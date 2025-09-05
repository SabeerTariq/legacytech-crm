import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import express from 'express';

dotenv.config();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || undefined,
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

const router = express.Router();

// GET /api/sales/leads - Get leads for selection
router.get('/leads', async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const [leads] = await mysqlConnection.execute(`
        SELECT * FROM leads 
        WHERE status != 'converted'
        ORDER BY created_at DESC
      `);

      res.status(200).json({
        success: true,
        data: leads || []
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in getLeads:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch leads'
    });
  }
});

// POST /api/sales/disposition - Create a complete sales disposition with all related data
router.post('/disposition', async (req, res) => {
  const mysqlConnection = await mysql.createConnection(mysqlConfig);
  
  try {
    await mysqlConnection.beginTransaction();

    const {
      customerName,
      phoneNumber,
      email,
      businessName,
      frontBrand,
      selectedServices,
      agreementUrl,
      paymentMode,
      paymentSource,
      paymentCompany,
      brand,
      agreementSigned,
      agreementSent,
      company,
      salesSource,
      leadSource,
      saleType,
      grossValue,
      cashIn,
      remaining,
      taxDeduction,
      saleDate,
      serviceTenure,
      turnaroundTime,
      userId,
      selectedLeadId,
      paymentPlanType,
      recurringFrequency,
      totalInstallments,
      installmentAmount,
      installmentFrequency,
      nextPaymentDate,
      nextInstallmentDate,
      recurringPackageAmount
    } = req.body;

    // Validate required fields
    if (!customerName || !email || !selectedServices || selectedServices.length === 0) {
      return res.status(400).json({
        error: 'Validation error',
        message: 'Customer name, email, and at least one service are required'
      });
    }

    // 1. Create payment plan first if needed
    let paymentPlanId = null;
    if (paymentPlanType !== 'one_time') {
      const [paymentPlanResult] = await mysqlConnection.execute(`
        INSERT INTO payment_plans (
          id, name, type, description, amount, frequency, 
          total_installments, installment_amount, next_payment_date, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        `${customerName} - ${paymentPlanType} Payment Plan`,
        paymentPlanType,
        `Payment plan for ${customerName} services`,
        grossValue,
        paymentPlanType === 'recurring' ? recurringFrequency : null,
        paymentPlanType === 'installments' ? totalInstallments : 1,
        paymentPlanType === 'installments' ? installmentAmount : null,
        paymentPlanType === 'recurring' ? nextPaymentDate : null,
        true
      ]);

      paymentPlanId = paymentPlanResult.insertId;
    }

    // 2. Create sales disposition
    const salesDispositionId = uuidv4();
    const currentDate = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await mysqlConnection.execute(`
      INSERT INTO sales_dispositions (
        id, sale_date, customer_name, phone_number, email, front_brand,
        business_name, service_sold, services_included, turnaround_time,
        service_tenure, service_details, agreement_url, payment_mode,
        company, sales_source, lead_source, sale_type, gross_value,
        cash_in, remaining, tax_deduction, seller, account_manager,
        project_manager, assigned_to, assigned_by, created_at, updated_at,
        user_id, lead_id, is_upsell, original_sales_disposition_id,
        service_types, payment_source, payment_company, brand,
        agreement_signed, agreement_sent, payment_plan_id, payment_source_id,
        is_recurring, recurring_frequency, total_installments,
        current_installment, next_payment_date, upsell_amount,
        original_sale_id, installment_frequency
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      salesDispositionId,
      saleDate,
      customerName,
      phoneNumber,
      email,
      frontBrand || null,
      businessName || null,
      selectedServices[0]?.serviceName || '',
      JSON.stringify(selectedServices.map(s => s.serviceName)),
      turnaroundTime || null,
      serviceTenure || null,
      selectedServices.map(s => `${s.serviceName}: ${s.details}`).join('\n'),
      agreementUrl || null,
      paymentMode,
      company,
      salesSource,
      leadSource,
      saleType,
      grossValue,
      cashIn,
      remaining,
      taxDeduction,
      '', // seller - will be assigned later
      '', // account_manager - will be assigned later
      '', // project_manager - will be assigned later
      '', // assigned_to - will be assigned later
      userId, // assigned_by
      currentDate, // created_at
      currentDate, // updated_at
      userId,
      selectedLeadId || null, // lead_id
      false, // is_upsell (this is a new sale, not upsell)
      null, // original_sales_disposition_id
      JSON.stringify(selectedServices.map(s => s.serviceName)), // service_types
      paymentSource === 'Other' ? paymentSource : paymentSource,
      paymentCompany === 'Others' ? paymentCompany : paymentCompany,
      brand === 'Others' ? brand : brand,
      agreementSigned,
      agreementSent,
      paymentPlanId, // Add the payment plan ID
      null, // payment_source_id
      paymentPlanType === 'recurring',
      paymentPlanType === 'recurring' ? recurringFrequency : null,
      totalInstallments || 1,
      1, // current_installment
      paymentPlanType === 'recurring' ? nextPaymentDate : 
      paymentPlanType === 'installments' ? nextInstallmentDate : null,
      0, // upsell_amount
      null, // original_sale_id
      paymentPlanType === 'installments' ? installmentFrequency : null
    ]);

    // 3. Create projects for each service
    const projectIds = [];
    for (const service of selectedServices) {
      const projectId = uuidv4();
      await mysqlConnection.execute(`
        INSERT INTO projects (
          id, name, client, description, sales_disposition_id, lead_id,
          total_amount, amount_paid, budget, status, created_at, updated_at,
          project_type, services, is_recurring, recurring_frequency,
          installment_frequency, next_payment_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        projectId,
        `${customerName} - ${service.serviceName}`,
        customerName,
        service.details,
        salesDispositionId,
        selectedLeadId || null,
        grossValue / selectedServices.length, // Split gross value among services
        0, // amount_paid starts at 0
        grossValue / selectedServices.length, // budget is split
        'unassigned', // status
        currentDate,
        currentDate,
        paymentPlanType === 'recurring' ? 'recurring' : 'one-time',
        JSON.stringify([service.serviceName]),
        paymentPlanType === 'recurring',
        paymentPlanType === 'recurring' ? recurringFrequency : null,
        paymentPlanType === 'installments' ? installmentFrequency : null,
        paymentPlanType === 'recurring' ? nextPaymentDate : 
        paymentPlanType === 'installments' ? nextInstallmentDate : null
      ]);
      projectIds.push(projectId);
    }

    // 4. Create recurring payment schedule if needed
    let recurringScheduleId = null;
    if (paymentPlanType === 'recurring' && projectIds.length > 0) {
      const [scheduleResult] = await mysqlConnection.execute(`
        INSERT INTO recurring_payment_schedule (
          id, project_id, frequency, amount, next_payment_date,
          total_payments, payments_completed, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        uuidv4(),
        projectIds[0], // Use first project
        recurringFrequency,
        recurringPackageAmount,
        nextPaymentDate,
        12, // Assuming 12 months
        0, // payments_completed starts at 0
        true
      ]);

      recurringScheduleId = scheduleResult.insertId;
    }

    // 5. Update lead status to converted if one was selected
    if (selectedLeadId) {
      await mysqlConnection.execute(`
        UPDATE leads SET status = 'converted' WHERE id = ?
      `, [selectedLeadId]);
    }

    await mysqlConnection.commit();

    res.status(201).json({
      success: true,
      message: 'Sales disposition created successfully',
      data: {
        salesDispositionId,
        projectIds,
        paymentPlanId,
        recurringScheduleId
      }
    });

  } catch (error) {
    await mysqlConnection.rollback();
    console.error('Error in createSalesDisposition:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create sales disposition'
    });
  } finally {
    await mysqlConnection.end();
  }
});

export default router;

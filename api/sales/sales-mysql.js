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

// GET /api/sales/services - Get all services
router.get('/services', async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const [services] = await mysqlConnection.execute(`
        SELECT * FROM services ORDER BY name
      `);

      res.status(200).json({
        success: true,
        data: services || []
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in getServices:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch services'
    });
  }
});

// POST /api/sales/upsell - Create a complete upsell with all related data
router.post('/upsell', async (req, res) => {
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
      originalSalesDispositionId,
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
        `Payment plan for ${customerName} upsell services`,
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
      null, // lead_id
      true, // is_upsell
      originalSalesDispositionId,
      JSON.stringify(selectedServices.map(s => s.serviceName)), // service_types
      paymentSource === 'Other' ? paymentSource : paymentSource,
      paymentCompany === 'Others' ? paymentCompany : paymentCompany,
      brand === 'Others' ? brand : brand,
      agreementSigned,
      agreementSent,
      paymentPlanId,
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

    // 3. Upsells are sales dispositions only - no projects created
    // Projects are created separately when needed for actual work

    await mysqlConnection.commit();

    res.status(201).json({
      success: true,
      message: 'Upsell created successfully',
      data: {
        salesDispositionId,
        paymentPlanId
      }
    });

  } catch (error) {
    await mysqlConnection.rollback();
    console.error('Error in createUpsell:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create upsell'
    });
  } finally {
    await mysqlConnection.end();
  }
});

// GET /api/sales/customers - Get customers for selection
router.get('/customers', async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const [customers] = await mysqlConnection.execute(`
        SELECT id, customer_name, email, phone_number, business_name, last_purchase_date
        FROM customers
        ORDER BY customer_name
      `);

      res.status(200).json({
        success: true,
        data: customers || []
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in getCustomers:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch customers'
    });
  }
});

export default router;

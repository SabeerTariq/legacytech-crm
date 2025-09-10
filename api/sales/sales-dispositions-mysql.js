import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'Developer@1234',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

// GET /api/sales/sales-dispositions - Get sales dispositions with filters
router.get('/', async (req, res) => {
  try {
    const { 
      user_id, 
      email, 
      phone_number, 
      sales_disposition_ids,
      page = 1, 
      limit = 100,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Build the base query
      let baseQuery = `
        SELECT 
          id,
          sale_date,
          customer_name,
          phone_number,
          email,
          front_brand,
          business_name,
          service_sold,
          services_included,
          turnaround_time,
          service_tenure,
          service_details,
          agreement_url,
          payment_mode,
          company,
          sales_source,
          lead_source,
          sale_type,
          gross_value,
          cash_in,
          remaining,
          tax_deduction,
          seller,
          account_manager,
          project_manager,
          assigned_to,
          assigned_by,
          created_at,
          updated_at,
          user_id,
          lead_id,
          is_upsell,
          original_sales_disposition_id,
          service_types,
          payment_source,
          payment_company,
          brand,
          agreement_signed,
          agreement_sent,
          payment_plan_id,
          payment_source_id,
          is_recurring,
          recurring_frequency,
          total_installments,
          current_installment,
          next_payment_date,
          upsell_amount,
          original_sale_id,
          installment_frequency
        FROM sales_dispositions 
        WHERE 1=1
      `;

      const queryParams = [];

      // Add user_id filter
      if (user_id) {
        baseQuery += ` AND user_id = ?`;
        queryParams.push(user_id);
      }

      // Add email filter
      if (email) {
        baseQuery += ` AND email = ?`;
        queryParams.push(email);
      }

      // Add phone_number filter
      if (phone_number) {
        baseQuery += ` AND phone_number = ?`;
        queryParams.push(phone_number);
      }

      // Add sales_disposition_ids filter
      if (sales_disposition_ids) {
        const ids = sales_disposition_ids.split(',').map(id => id.trim()).filter(id => id);
        if (ids.length > 0) {
          const placeholders = ids.map(() => '?').join(',');
          baseQuery += ` AND id IN (${placeholders})`;
          queryParams.push(...ids);
        }
      }

      // Add sorting and pagination
      baseQuery += ` ORDER BY ${sort_by} ${sort_order} LIMIT ? OFFSET ?`;
      queryParams.push(parseInt(limit), offset);

      console.log('Sales dispositions query:', baseQuery);
      console.log('Query parameters:', queryParams);

      // Execute the query
      const [salesDispositions] = await mysqlConnection.execute(baseQuery, queryParams);

      console.log('Sales dispositions found:', salesDispositions.length);

      // Get total count for pagination
      let countQuery = `SELECT COUNT(*) as total FROM sales_dispositions WHERE 1=1`;
      const countParams = [];

      if (user_id) {
        countQuery += ` AND user_id = ?`;
        countParams.push(user_id);
      }

      if (email) {
        countQuery += ` AND email = ?`;
        countParams.push(email);
      }

      if (phone_number) {
        countQuery += ` AND phone_number = ?`;
        countParams.push(phone_number);
      }

      if (sales_disposition_ids) {
        const ids = sales_disposition_ids.split(',').map(id => id.trim()).filter(id => id);
        if (ids.length > 0) {
          const placeholders = ids.map(() => '?').join(',');
          countQuery += ` AND id IN (${placeholders})`;
          countParams.push(...ids);
        }
      }

      const countResult = await DatabaseService.query(countQuery, countParams);
      const totalCount = countResult[0].total;

      res.status(200).json({
        success: true,
        data: {
          sales_dispositions: salesDispositions,
          pagination: {
            total: totalCount,
            page: parseInt(page),
            limit: parseInt(limit),
            total_pages: Math.ceil(totalCount / parseInt(limit))
          }
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching sales dispositions:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch sales dispositions',
      details: error.message
    });
  }
});

// GET /api/sales/sales-dispositions/:id - Get specific sales disposition
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const [salesDispositions] = await mysqlConnection.execute(`
        SELECT * FROM sales_dispositions WHERE id = ?
      `, [id]);

      if (salesDispositions.length === 0) {
        return res.status(404).json({
          error: 'Sales disposition not found',
          message: 'Sales disposition could not be found'
        });
      }

      res.status(200).json({
        success: true,
        data: salesDispositions[0]
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching sales disposition:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch sales disposition',
      details: error.message
    });
  }
});

export default router;

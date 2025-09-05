import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || undefined,
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

// GET /api/recurring-services - Get recurring services with filters
router.get('/', async (req, res) => {
  try {
    const { 
      customer_ids,
      page = 1, 
      limit = 100,
      sort_by = 'created_at',
      sort_order = 'DESC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Build the base query - using recurring_payment_schedule table
      let baseQuery = `
        SELECT 
          rps.id,
          rps.project_id,
          rps.amount,
          rps.frequency,
          rps.next_payment_date,
          rps.is_active as status,
          rps.created_at,
          p.name as project_name,
          p.sales_disposition_id as customer_id
        FROM recurring_payment_schedule rps
        LEFT JOIN projects p ON rps.project_id = p.id
        WHERE 1=1
      `;

      const queryParams = [];

      // Add customer_ids filter - these are actually sales_disposition_ids
      if (customer_ids) {
        const ids = customer_ids.split(',').map(id => id.trim());
        if (ids.length > 0) {
          const placeholders = ids.map(() => '?').join(',');
          baseQuery += ` AND p.sales_disposition_id IN (${placeholders})`;
          queryParams.push(...ids);
        }
      }

      // Add sorting and pagination
      baseQuery += ` ORDER BY rps.${sort_by} ${sort_order} LIMIT ? OFFSET ?`;
      queryParams.push(parseInt(limit), offset);

      console.log('Recurring services query:', baseQuery);
      console.log('Recurring services query parameters:', queryParams);

      // Execute the query
      const [recurringServices] = await mysqlConnection.execute(baseQuery, queryParams);

      console.log('Recurring services found:', recurringServices.length);

      // Get total count for pagination
      let countQuery = `
        SELECT COUNT(*) as total 
        FROM recurring_payment_schedule rps
        LEFT JOIN projects p ON rps.project_id = p.id
        WHERE 1=1
      `;
      const countParams = [];

      if (customer_ids) {
        const ids = customer_ids.split(',').map(id => id.trim());
        if (ids.length > 0) {
          const placeholders = ids.map(() => '?').join(',');
          countQuery += ` AND p.sales_disposition_id IN (${placeholders})`;
          countParams.push(...ids);
        }
      }

      const [countResult] = await mysqlConnection.execute(countQuery, countParams);
      const totalCount = countResult[0].total;

      res.status(200).json({
        success: true,
        data: {
          recurring_services: recurringServices,
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
    console.error('Error fetching recurring services:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch recurring services',
      details: error.message
    });
  }
});

// GET /api/recurring-services/:id - Get specific recurring service
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const [recurringServices] = await mysqlConnection.execute(`
        SELECT rps.*, p.name as project_name, p.sales_disposition_id as customer_id
        FROM recurring_payment_schedule rps
        LEFT JOIN projects p ON rps.project_id = p.id
        WHERE rps.id = ?
      `, [id]);

      if (recurringServices.length === 0) {
        return res.status(404).json({
          error: 'Recurring service not found',
          message: 'Recurring service could not be found'
        });
      }

      res.status(200).json({
        success: true,
        data: recurringServices[0]
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching recurring service:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch recurring service',
      details: error.message
    });
  }
});

export default router;

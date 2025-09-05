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

// GET /api/front-sales/performance - Get team performance summary
router.get('/performance', async (req, res) => {
  try {
    const { month } = req.query;
    
    if (!month) {
      return res.status(400).json({
        success: false,
        error: 'Month parameter is required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Get team performance data
      const [performance] = await mysqlConnection.execute(`
        SELECT 
          up.user_id as seller_id,
          up.employee_id,
          e.full_name as seller_name,
          COALESCE(COUNT(DISTINCT p.id), 0) as accounts_achieved,
          COALESCE(SUM(sd.gross_value), 0) as total_gross,
          COALESCE(SUM(sd.cash_in), 0) as total_cash_in,
          COALESCE(SUM(sd.remaining), 0) as total_remaining,
          COALESCE(fst.target_accounts, 0) as target_accounts,
          COALESCE(fst.target_gross, 0) as target_gross,
          COALESCE(fst.target_cash_in, 0) as target_cash_in
        FROM user_profiles up
        LEFT JOIN employees e ON up.employee_id = e.id
        LEFT JOIN projects p ON p.assigned_pm_id = e.id AND DATE_FORMAT(p.created_at, '%Y-%m') = ?
        LEFT JOIN sales_dispositions sd ON sd.user_id = up.user_id AND DATE_FORMAT(sd.created_at, '%Y-%m') = ?
        LEFT JOIN front_seller_targets fst ON fst.seller_id = e.id AND fst.month = ?
        WHERE e.department = 'Front Sales' AND e.id IS NOT NULL
        GROUP BY up.user_id, up.employee_id, e.full_name, fst.target_accounts, fst.target_gross, fst.target_cash_in
        ORDER BY total_gross DESC
      `, [month, month, month]);

      res.status(200).json({
        success: true,
        data: performance
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch performance data'
    });
  }
});

// GET /api/front-sales/employees - Get Front Sales employees
router.get('/employees', async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const [employees] = await mysqlConnection.execute(`
        SELECT 
          e.id,
          e.full_name,
          e.department,
          e.date_of_joining as hire_date,
          'active' as status,
          up.email,
          up.display_name,
          r.name as role_name
        FROM employees e
        LEFT JOIN user_profiles up ON e.id = up.employee_id
        LEFT JOIN user_roles ur ON up.user_id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        WHERE e.department = 'Front Sales' AND r.name = 'front_sales'
        ORDER BY e.full_name
      `);

      res.status(200).json({
        success: true,
        data: employees
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employees'
    });
  }
});

export default router;

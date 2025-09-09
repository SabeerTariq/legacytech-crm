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

// GET /api/front-sales/dashboard - Get complete dashboard data for a user
router.get('/dashboard', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Get current month data
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
      const currentMonthStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}`;
      const currentMonthDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;

      console.log('🔍 Dashboard Debug:', {
        user_id,
        currentMonthStr,
        currentMonthDate
      });

      // Get user's employee information
      const [userProfile] = await mysqlConnection.execute(`
        SELECT 
          up.user_id,
          up.employee_id,
          e.full_name,
          e.department
        FROM user_profiles up
        LEFT JOIN employees e ON up.employee_id = e.id
        WHERE up.user_id = ?
      `, [user_id]);

      if (userProfile.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User profile not found'
        });
      }

      const employeeId = userProfile[0].employee_id;
      const employeeName = userProfile[0].full_name;

      // Get current month target
      const [targetData] = await mysqlConnection.execute(`
        SELECT 
          target_accounts,
          target_gross,
          target_cash_in
        FROM front_seller_targets
        WHERE seller_id = ? AND month = ?
      `, [employeeId, currentMonthDate]);

      const target = targetData.length > 0 ? targetData[0] : {
        target_accounts: 0,
        target_gross: 0,
        target_cash_in: 0
      };

      // Get current month performance - front sellers create sales dispositions directly
      const [performanceData] = await mysqlConnection.execute(`
        SELECT 
          COALESCE(COUNT(DISTINCT sd.id), 0) as accounts_achieved,
          COALESCE(SUM(sd.gross_value), 0) as total_gross,
          COALESCE(SUM(sd.cash_in), 0) as total_cash_in,
          COALESCE(SUM(sd.remaining), 0) as total_remaining
        FROM sales_dispositions sd
        WHERE sd.user_id = ? AND DATE_FORMAT(sd.created_at, '%Y-%m') = ?
      `, [user_id, currentMonthStr]);

      const performance = performanceData.length > 0 ? performanceData[0] : {
        accounts_achieved: 0,
        total_gross: 0,
        total_cash_in: 0,
        total_remaining: 0
      };

      // Calculate current month metrics
      const currentMonthMetrics = {
        targetAccounts: target.target_accounts || 0,
        accountsAchieved: performance.accounts_achieved || 0,
        accountsRemaining: Math.max(0, (target.target_accounts || 0) - (performance.accounts_achieved || 0)),
        totalGross: performance.total_gross || 0,
        totalCashIn: performance.total_cash_in || 0,
        totalRemaining: performance.total_remaining || 0,
        targetCompletion: target.target_accounts > 0 ? 
          ((performance.accounts_achieved || 0) / target.target_accounts) * 100 : 0
      };

      // Get previous months data (last 6 months) - front sellers create sales dispositions directly
      const [previousMonthsData] = await mysqlConnection.execute(`
        SELECT 
          DATE_FORMAT(sd.created_at, '%Y-%m-01') as month,
          COUNT(DISTINCT sd.id) as accounts_achieved,
          COALESCE(SUM(sd.gross_value), 0) as total_gross,
          COALESCE(SUM(sd.cash_in), 0) as total_cash_in,
          COALESCE(SUM(sd.remaining), 0) as total_remaining,
          COALESCE(fst.target_accounts, 0) as target_accounts
        FROM sales_dispositions sd
        LEFT JOIN front_seller_targets fst ON fst.seller_id = ? AND fst.month = DATE_FORMAT(sd.created_at, '%Y-%m-01')
        WHERE sd.user_id = ? 
          AND sd.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
          AND DATE_FORMAT(sd.created_at, '%Y-%m') != ?
        GROUP BY DATE_FORMAT(sd.created_at, '%Y-%m-01'), fst.target_accounts
        ORDER BY month DESC
      `, [employeeId, user_id, currentMonthStr]);

      // Get team performance for current month
      // Use a subquery to get the most recent user profile for each employee
      const [teamPerformance] = await mysqlConnection.execute(`
        SELECT 
          up.user_id as seller_id,
          up.employee_id,
          e.full_name as seller_name,
          COALESCE(COUNT(DISTINCT sd.id), 0) as accounts_achieved,
          COALESCE(SUM(sd.gross_value), 0) as total_gross,
          COALESCE(SUM(sd.cash_in), 0) as total_cash_in,
          COALESCE(SUM(sd.remaining), 0) as total_remaining,
          COALESCE(fst.target_accounts, 0) as target_accounts,
          COALESCE(fst.target_gross, 0) as target_gross,
          COALESCE(fst.target_cash_in, 0) as target_cash_in,
          ROW_NUMBER() OVER (ORDER BY COALESCE(SUM(sd.gross_value), 0) DESC) as performance_rank
        FROM (
          SELECT DISTINCT
            up.employee_id,
            up.user_id,
            ROW_NUMBER() OVER (PARTITION BY up.employee_id ORDER BY up.created_at DESC) as rn
          FROM user_profiles up
          WHERE up.employee_id IS NOT NULL
        ) latest_profiles
        JOIN user_profiles up ON latest_profiles.user_id = up.user_id AND latest_profiles.rn = 1
        LEFT JOIN employees e ON up.employee_id = e.id
        LEFT JOIN sales_dispositions sd ON sd.user_id = up.user_id AND DATE_FORMAT(sd.created_at, '%Y-%m') = ?
        LEFT JOIN front_seller_targets fst ON fst.seller_id = e.id AND fst.month = ?
        WHERE e.department = 'Front Sales' AND e.id IS NOT NULL
        GROUP BY up.user_id, up.employee_id, e.full_name
        ORDER BY total_gross DESC
      `, [currentMonthStr, currentMonthDate]);

      // Calculate team averages
      const teamAverages = {
        accountsAchieved: teamPerformance.length > 0 ? 
          teamPerformance.reduce((sum, member) => sum + (member.accounts_achieved || 0), 0) / teamPerformance.length : 0,
        totalGross: teamPerformance.length > 0 ? 
          teamPerformance.reduce((sum, member) => sum + (member.total_gross || 0), 0) / teamPerformance.length : 0,
        totalCashIn: teamPerformance.length > 0 ? 
          teamPerformance.reduce((sum, member) => sum + (member.total_cash_in || 0), 0) / teamPerformance.length : 0
      };

      // Find user's personal rank
      const userRank = teamPerformance.findIndex(member => member.seller_id === user_id) + 1;

      // Debug: Check for duplicate seller_ids
      const sellerIds = teamPerformance.map(member => member.seller_id);
      const uniqueSellerIds = [...new Set(sellerIds)];
      if (sellerIds.length !== uniqueSellerIds.length) {
        console.warn('⚠️ Duplicate seller_ids found in team performance:', {
          total: sellerIds.length,
          unique: uniqueSellerIds.length,
          duplicates: sellerIds.filter((id, index) => sellerIds.indexOf(id) !== index)
        });
      }

      const dashboardData = {
        currentMonth: currentMonthMetrics,
        previousMonths: previousMonthsData,
        teamPerformance: teamPerformance,
        personalRank: userRank || 1,
        teamAverage: teamAverages
      };

      res.status(200).json({
        success: true,
        data: dashboardData
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

// PUT /api/front-sales/dashboard/targets - Update user targets
router.put('/dashboard/targets', async (req, res) => {
  try {
    const { user_id, target_accounts, target_gross, target_cash_in } = req.body;
    
    if (!user_id) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Get user's employee ID
      const [userProfile] = await mysqlConnection.execute(`
        SELECT employee_id FROM user_profiles WHERE user_id = ?
      `, [user_id]);

      if (userProfile.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User profile not found'
        });
      }

      const employeeId = userProfile[0].employee_id;

      // Get current month
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth() + 1;
      const currentMonthDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;

      // Check if target exists
      const [existingTarget] = await mysqlConnection.execute(`
        SELECT id FROM front_seller_targets 
        WHERE seller_id = ? AND month = ?
      `, [employeeId, currentMonthDate]);

      if (existingTarget.length > 0) {
        // Update existing target
        await mysqlConnection.execute(`
          UPDATE front_seller_targets 
          SET target_accounts = ?, target_gross = ?, target_cash_in = ?, updated_at = NOW()
          WHERE seller_id = ? AND month = ?
        `, [target_accounts || 0, target_gross || 0, target_cash_in || 0, employeeId, currentMonthDate]);
      } else {
        // Create new target
        const targetId = require('uuid').v4();
        await mysqlConnection.execute(`
          INSERT INTO front_seller_targets (id, seller_id, month, target_accounts, target_gross, target_cash_in, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())
        `, [targetId, employeeId, currentMonthDate, target_accounts || 0, target_gross || 0, target_cash_in || 0]);
      }

      res.status(200).json({
        success: true,
        message: 'Targets updated successfully'
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error updating targets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update targets'
    });
  }
});

export default router;

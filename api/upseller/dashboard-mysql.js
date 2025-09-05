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

// GET /api/upseller/dashboard - Get comprehensive upseller dashboard data
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
      console.log('🔍 Upseller Dashboard: Fetching data for user:', user_id);
      
      // Get current month
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const currentMonthString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;
      
      console.log('📅 Current month:', currentMonthString);

      // Get user profile and employee info
      const [userProfiles] = await mysqlConnection.execute(`
        SELECT 
          up.id,
          up.user_id,
          up.email,
          up.display_name,
          up.employee_id,
          up.is_admin,
          e.full_name,
          e.department,
          e.job_title
        FROM user_profiles up
        LEFT JOIN employees e ON up.employee_id = e.id
        WHERE up.user_id = ?
      `, [user_id]);

      if (userProfiles.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User profile not found'
        });
      }

      const userProfile = userProfiles[0];
      console.log('👤 User profile:', userProfile);

      // Get current month target
      console.log('🔍 Dashboard: Querying targets with:', {
        employee_id: userProfile.employee_id,
        currentMonthString: currentMonthString
      });
      
      const [targets] = await mysqlConnection.execute(`
        SELECT 
          ut.id,
          ut.seller_id,
          ut.month,
          ut.target_accounts,
          ut.target_gross,
          ut.target_cash_in,
          ut.created_at,
          ut.updated_at
        FROM upseller_targets ut
        WHERE ut.seller_id = ? AND ut.month = ?
      `, [userProfile.employee_id, currentMonthString]);
      
      console.log('🔍 Dashboard: Target query result:', targets);

      const currentTarget = targets.length > 0 ? targets[0] : null;
      console.log('🎯 Current month target:', currentTarget);

      // Get current month performance
      const [performance] = await mysqlConnection.execute(`
        SELECT 
          up.id,
          up.seller_id,
          up.month,
          up.accounts_achieved,
          up.total_gross,
          up.total_cash_in,
          up.total_remaining,
          up.created_at,
          up.updated_at
        FROM upseller_performance up
        WHERE up.seller_id = ? AND up.month = ?
      `, [user_id, currentMonthString]);

      const currentPerformance = performance.length > 0 ? performance[0] : null;
      console.log('📊 Current month performance:', currentPerformance);

      // Get assigned projects (accounts assigned)
      const [projects] = await mysqlConnection.execute(`
        SELECT 
          p.id,
          p.name,
          p.total_amount,
          p.amount_paid,
          p.status,
          p.assigned_pm_id,
          p.sales_disposition_id
        FROM projects p
        WHERE p.assigned_pm_id = ?
          AND p.status IN ('assigned', 'in_progress', 'review', 'pending')
      `, [userProfile.employee_id]);

      console.log('📋 Assigned projects:', projects.length);

      // Get sales dispositions created by this user with remaining amounts
      const [salesDispositions] = await mysqlConnection.execute(`
        SELECT 
          sd.id,
          sd.gross_value,
          sd.cash_in,
          sd.remaining,
          sd.customer_name,
          sd.sale_date
        FROM sales_dispositions sd
        WHERE sd.user_id = ? AND sd.remaining > 0
      `, [user_id]);

      console.log('💰 Sales dispositions with remaining:', salesDispositions.length);

      // Calculate accounts assigned and receivable
      const accountsAssigned = projects.length;
      
      // Project receivables
      const projectReceivable = projects.reduce((sum, project) => {
        const remaining = (project.total_amount || 0) - (project.amount_paid || 0);
        return sum + Math.max(0, remaining);
      }, 0);
      
      // Sales receivables
      const salesReceivable = salesDispositions.reduce((sum, sale) => {
        return sum + (sale.remaining || 0);
      }, 0);
      
      const totalReceivable = projectReceivable + salesReceivable;

      // Get previous months performance
      const [previousPerformance] = await mysqlConnection.execute(`
        SELECT 
          up.id,
          up.seller_id,
          up.month,
          up.accounts_achieved,
          up.total_gross,
          up.total_cash_in,
          up.total_remaining,
          up.created_at,
          up.updated_at
        FROM upseller_performance up
        WHERE up.seller_id = ? AND up.month < ?
        ORDER BY up.month DESC
        LIMIT 6
      `, [user_id, currentMonthString]);

      console.log('📊 Previous months performance:', previousPerformance.length);

      // Get team performance data
      const [teamPerformance] = await mysqlConnection.execute(`
        SELECT 
          up.seller_id,
          up.month,
          up.accounts_achieved,
          up.total_gross,
          up.total_cash_in,
          up.total_remaining,
          e.full_name as seller_name,
          ut.target_cash_in
        FROM upseller_performance up
        LEFT JOIN user_profiles up2 ON up.seller_id = up2.user_id
        LEFT JOIN employees e ON up2.employee_id = e.id
        LEFT JOIN upseller_targets ut ON up.seller_id = ut.seller_id AND up.month = ut.month
        WHERE up.month = ? AND e.department = 'Upseller'
        ORDER BY up.total_cash_in DESC
      `, [currentMonthString]);

      console.log('👥 Team performance:', teamPerformance.length);

      // Find current user's rank
      const currentUserRank = teamPerformance.findIndex(
        member => member.seller_id === user_id
      );

      // Calculate current month metrics
      const currentMonthMetrics = {
        accountsAssigned,
        receivable: totalReceivable,
        totalTarget: currentTarget?.target_cash_in || 0,
        targetAchieved: currentPerformance?.total_cash_in || 0,
        targetRemaining: Math.max(0, (currentTarget?.target_cash_in || 0) - (currentPerformance?.total_cash_in || 0)),
        totalGross: currentPerformance?.total_gross || 0,
        totalCashIn: currentPerformance?.total_cash_in || 0,
        totalRemaining: currentPerformance?.total_remaining || 0,
        targetCompletion: currentTarget?.target_cash_in > 0 
          ? ((currentPerformance?.total_cash_in || 0) / currentTarget.target_cash_in) * 100 
          : 0,
        teamRank: currentUserRank !== -1 ? currentUserRank + 1 : 0,
        month: currentMonthString
      };

      // Calculate previous months metrics
      const previousMonthsMetrics = previousPerformance.map(perf => {
        // Get target for this month
        const monthTarget = targets.find(t => t.month === perf.month);
        
        return {
          accountsAssigned: perf.accounts_achieved || 0,
          receivable: 0, // Not calculated for previous months
          totalTarget: monthTarget?.target_cash_in || 0,
          targetAchieved: perf.total_cash_in || 0,
          targetRemaining: Math.max(0, (monthTarget?.target_cash_in || 0) - (perf.total_cash_in || 0)),
          totalGross: perf.total_gross || 0,
          totalCashIn: perf.total_cash_in || 0,
          totalRemaining: perf.total_remaining || 0,
          targetCompletion: monthTarget?.target_cash_in > 0 
            ? ((perf.total_cash_in || 0) / monthTarget.target_cash_in) * 100 
            : 0,
          teamRank: 0, // Not calculated for previous months
          month: perf.month
        };
      });

      // Format team performance data
      const formattedTeamPerformance = teamPerformance.map(member => ({
        seller_id: member.seller_id,
        seller_name: member.seller_name || 'Unknown',
        accounts_achieved: member.accounts_achieved || 0,
        total_gross: member.total_gross || 0,
        total_cash_in: member.total_cash_in || 0,
        total_remaining: member.total_remaining || 0,
        target_accounts: 0, // Not available in current query
        target_gross: member.target_cash_in || 0,
        target_cash_in: member.target_cash_in || 0,
        performance_rank: 0 // Will be calculated on frontend
      }));

      const dashboardData = {
        currentMonth: currentMonthMetrics,
        previousMonths: previousMonthsMetrics,
        teamPerformance: formattedTeamPerformance,
        personalRank: currentUserRank !== -1 ? currentUserRank + 1 : 0,
        teamAverage: {
          accountsAchieved: 0,
          totalGross: 0,
          totalCashIn: 0
        }
      };

      console.log('✅ Dashboard data prepared:', {
        currentMonth: currentMonthMetrics,
        previousMonthsCount: previousMonthsMetrics.length,
        teamPerformanceCount: formattedTeamPerformance.length,
        personalRank: dashboardData.personalRank
      });

      res.status(200).json({
        success: true,
        data: dashboardData
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching upseller dashboard data:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to fetch dashboard data',
      details: error.message
    });
  }
});

// POST /api/upseller/target - Update upseller target
router.post('/target', async (req, res) => {
  try {
    const { user_id, target_cash_in } = req.body;
    
    if (!user_id || target_cash_in === undefined) {
      return res.status(400).json({
        success: false,
        error: 'User ID and target cash in are required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Get current month
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      const currentMonthString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`;

      // Get user profile to get employee_id
      const [userProfiles] = await mysqlConnection.execute(`
        SELECT employee_id FROM user_profiles WHERE user_id = ?
      `, [user_id]);

      if (userProfiles.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'User profile not found'
        });
      }

      const employeeId = userProfiles[0].employee_id;

      // Upsert target
      await mysqlConnection.execute(`
        INSERT INTO upseller_targets (seller_id, month, target_accounts, target_gross, target_cash_in, created_at, updated_at)
        VALUES (?, ?, 0, 0, ?, NOW(), NOW())
        ON DUPLICATE KEY UPDATE
          target_cash_in = VALUES(target_cash_in),
          updated_at = NOW()
      `, [employeeId, currentMonthString, target_cash_in]);

      res.status(200).json({
        success: true,
        message: 'Target updated successfully'
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error updating upseller target:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal server error',
      message: 'Failed to update target',
      details: error.message
    });
  }
});

export default router;

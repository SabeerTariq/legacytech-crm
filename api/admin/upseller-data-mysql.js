import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || undefined,
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Get current month for filtering
      const currentDate = new Date();
      const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
      
      console.log('API: Using current month format:', currentMonth);
      
      // Get upseller teams (likely empty initially)
      const [teams] = await mysqlConnection.execute(`
        SELECT 
          ut.id,
          ut.name,
          ut.description,
          ut.team_lead_id,
          ut.is_active,
          ut.created_at,
          ut.updated_at,
          e.full_name as team_lead_name
        FROM upseller_teams ut
        LEFT JOIN employees e ON ut.team_lead_id = e.id
        WHERE ut.is_active = TRUE
        ORDER BY ut.name
      `);
      
      console.log('API: Teams found:', teams.length);

      // Get upseller team members (likely empty initially)
      const [teamMembers] = await mysqlConnection.execute(`
        SELECT 
          utm.id,
          utm.team_id,
          utm.employee_id,
          utm.role,
          utm.joined_at,
          utm.is_active,
          e.full_name as member_name,
          e.email as member_email
        FROM upseller_team_members utm
        JOIN employees e ON utm.employee_id = e.id
        WHERE utm.is_active = TRUE
        ORDER BY utm.joined_at
      `);
      
      console.log('API: Team members found:', teamMembers.length);

      // Get upseller targets for current month (likely empty initially)
      // Use LIKE to match YYYY-MM format
      const [targets] = await mysqlConnection.execute(`
        SELECT 
          ut.id,
          ut.seller_id,
          ut.month,
          ut.target_accounts,
          ut.target_gross,
          ut.target_cash_in,
          ut.created_at,
          ut.updated_at,
          e.full_name as seller_name
        FROM upseller_targets ut
        JOIN employees e ON ut.seller_id = e.id
        WHERE ut.month LIKE ?
        ORDER BY ut.created_at
      `, [`${currentMonth}%`]);
      
      console.log('API: Targets found for month', currentMonth, ':', targets.length);

      // Get upseller performance for current month (likely empty initially)
      // Use LIKE to match YYYY-MM format
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
          up.updated_at,
          e.full_name as seller_name
        FROM upseller_performance up
        JOIN employees e ON up.seller_id = e.id
        WHERE up.month LIKE ?
        ORDER BY up.created_at
      `, [`${currentMonth}%`]);
      
      console.log('API: Performance records found for month', currentMonth, ':', performance.length);

      // Get upseller employees (employees in Upseller department)
      const [upsellerEmployees] = await mysqlConnection.execute(`
        SELECT DISTINCT
          e.id,
          e.full_name,
          e.email,
          e.department,
          e.job_title,
          e.date_of_joining,
          e.contact_number
        FROM employees e
        WHERE e.department = 'Upseller'
        ORDER BY e.full_name
      `);
      
      console.log('API: Upseller employees found:', upsellerEmployees.length);

      // Return all data
      res.status(200).json({
        success: true,
        data: {
          teams,
          teamMembers,
          targets,
          performance,
          upsellerEmployees,
          currentMonth
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching upseller data:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch upseller data'
    });
  }
}

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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, role_name } = req.body;

    // Validate required fields
    if (!user_id || !role_name) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'user_id and role_name are required'
      });
    }

    // Connect to MySQL database
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Check if user has the specified role
      const [userRoles] = await mysqlConnection.execute(`
        SELECT 
          ur.user_id,
          r.name as role_name,
          r.description as role_description,
          up.display_name,
          up.email
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        JOIN user_profiles up ON ur.user_id = up.user_id
        WHERE ur.user_id = ? AND r.name = ?
      `, [user_id, role_name]);

      if (userRoles.length === 0) {
        // User doesn't have this role
        return res.status(200).json({
          success: true,
          has_role: false,
          message: `User does not have the '${role_name}' role`,
          user_id,
          role_name
        });
      }

      // User has this role
      const userRole = userRoles[0];
      return res.status(200).json({
        success: true,
        has_role: true,
        message: `User has the '${role_name}' role`,
        data: {
          user_id: userRole.user_id,
          display_name: userRole.display_name,
          email: userRole.email,
          role_name: userRole.role_name,
          role_description: userRole.role_description
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in check-user-role API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to check user role',
      details: error.message
    });
  }
}

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'Developer@1234',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Connect to MySQL database
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Get all user profiles with their roles
      const [userProfiles] = await mysqlConnection.execute(`
        SELECT 
          up.user_id,
          up.display_name,
          up.email,
          GROUP_CONCAT(r.name SEPARATOR ', ') as roles
        FROM user_profiles up
        LEFT JOIN user_roles ur ON up.user_id = ur.user_id
        LEFT JOIN roles r ON ur.role_id = r.id
        GROUP BY up.user_id, up.display_name, up.email
        ORDER BY up.display_name
      `);

      // Transform the data to a more usable format
      const usersMap = {};
      userProfiles.forEach(userProfile => {
        usersMap[userProfile.user_id] = {
          display_name: userProfile.display_name,
          email: userProfile.email,
          roles: userProfile.roles || 'No roles assigned'
        };
      });

      res.status(200).json({
        success: true,
        data: usersMap,
        count: Object.keys(usersMap).length
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in get-user-roles API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch user roles',
      details: error.message
    });
  }
}

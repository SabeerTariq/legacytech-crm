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
    const { excludeCurrentUser = true } = req.query;
    const userId = req.user.id;

    // Connect to MySQL database
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Build query to get user profiles
      let query = `
        SELECT 
          user_id,
          display_name,
          email,
          is_active,
          created_at,
          updated_at
        FROM user_profiles
        WHERE is_active = 1
      `;
      
      const queryParams = [];

      // Exclude current user if requested
      if (excludeCurrentUser === 'true' || excludeCurrentUser === true) {
        query += ` AND user_id != ?`;
        queryParams.push(userId);
      }

      query += ` ORDER BY display_name ASC`;

      // Execute the query
      const [users] = await mysqlConnection.execute(query, queryParams);

      // Transform the data to match the expected format
      const transformedUsers = users.map(user => ({
        user_id: user.user_id,
        display_name: user.display_name,
        email: user.email,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));

      return res.status(200).json({
        success: true,
        data: {
          users: transformedUsers
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in get-user-profiles API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch user profiles',
      details: error.message
    });
  }
}

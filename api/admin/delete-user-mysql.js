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
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id } = req.body;

    // Validate required fields
    if (!user_id) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'user_id is required'
      });
    }

    // Connect to MySQL database
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Start transaction
      await mysqlConnection.beginTransaction();

      try {
        // Get user info before deletion for response
        const [userInfo] = await mysqlConnection.execute(`
          SELECT 
            up.user_id,
            up.display_name,
            up.email,
            au.is_admin
          FROM user_profiles up
          JOIN auth_users au ON up.user_id = au.id
          WHERE up.user_id = ?
        `, [user_id]);

        if (userInfo.length === 0) {
          return res.status(404).json({
            error: 'User not found',
            message: 'User could not be found'
          });
        }

        const user = userInfo[0];

        // Check if user is trying to delete themselves
        if (req.user && req.user.id === user_id) {
          return res.status(400).json({
            error: 'Cannot delete self',
            message: 'You cannot delete your own account'
          });
        }

        // Check if user is trying to delete another admin (only super admins should be able to do this)
        if (user.is_admin && req.user && !req.user.is_super_admin) {
          return res.status(403).json({
            error: 'Insufficient permissions',
            message: 'Only super administrators can delete admin accounts'
          });
        }

        // Delete user roles first (due to foreign key constraints)
        await mysqlConnection.execute(`
          DELETE FROM user_roles WHERE user_id = ?
        `, [user_id]);

        // Delete user sessions
        await mysqlConnection.execute(`
          DELETE FROM auth_user_sessions WHERE user_id = ?
        `, [user_id]);

        // Delete password reset tokens
        await mysqlConnection.execute(`
          DELETE FROM auth_password_reset_tokens WHERE user_id = ?
        `, [user_id]);

        // Delete audit log entries
        await mysqlConnection.execute(`
          DELETE FROM auth_audit_log WHERE user_id = ?
        `, [user_id]);

        // Delete user profile
        await mysqlConnection.execute(`
          DELETE FROM user_profiles WHERE user_id = ?
        `, [user_id]);

        // Finally, delete the auth user
        await mysqlConnection.execute(`
          DELETE FROM auth_users WHERE id = ?
        `, [user_id]);

        // Commit transaction
        await mysqlConnection.commit();

        return res.status(200).json({
          success: true,
          message: 'User deleted successfully',
          data: {
            deleted_user: {
              user_id: user.user_id,
              display_name: user.display_name,
              email: user.email,
              is_admin: user.is_admin
            },
            deleted_at: new Date().toISOString()
          }
        });

      } catch (error) {
        // Rollback transaction on error
        await mysqlConnection.rollback();
        throw error;
      }

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error in delete-user API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete user',
      details: error.message
    });
  }
}

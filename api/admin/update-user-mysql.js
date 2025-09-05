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
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, updates } = req.body;

    // Validate required fields
    if (!user_id || !updates) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'user_id and updates object are required'
      });
    }

    // Validate updates object
    if (typeof updates !== 'object' || Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        error: 'Invalid updates',
        message: 'updates must be a non-empty object'
      });
    }

    // Connect to MySQL database
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Start transaction
      await mysqlConnection.beginTransaction();

      try {
        // Update user profile if profile fields are provided
        const profileFields = ['display_name', 'email', 'is_active'];
        const profileUpdates = {};
        
        profileFields.forEach(field => {
          if (updates[field] !== undefined) {
            profileUpdates[field] = updates[field];
          }
        });

        if (Object.keys(profileUpdates).length > 0) {
          const profileSetClause = Object.keys(profileUpdates)
            .map(field => `${field} = ?`)
            .join(', ');
          
          const profileValues = Object.values(profileUpdates);
          profileValues.push(user_id);

          await mysqlConnection.execute(`
            UPDATE user_profiles 
            SET ${profileSetClause}, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
          `, profileValues);
        }

        // Update auth_users table if auth fields are provided
        const authFields = ['is_admin', 'is_active'];
        const authUpdates = {};
        
        authFields.forEach(field => {
          if (updates[field] !== undefined) {
            authUpdates[field] = updates[field];
          }
        });

        if (Object.keys(authUpdates).length > 0) {
          const authSetClause = Object.keys(authUpdates)
            .map(field => `${field} = ?`)
            .join(', ');
          
          const authValues = Object.values(authUpdates);
          authValues.push(user_id);

          await mysqlConnection.execute(`
            UPDATE auth_users 
            SET ${authSetClause}, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
          `, authValues);
        }

        // Update roles if provided
        if (updates.roles && Array.isArray(updates.roles)) {
          // Remove existing roles
          await mysqlConnection.execute(`
            DELETE FROM user_roles WHERE user_id = ?
          `, [user_id]);

          // Add new roles
          for (const roleName of updates.roles) {
            // Get role ID
            const [roles] = await mysqlConnection.execute(`
              SELECT id FROM roles WHERE name = ?
            `, [roleName]);

            if (roles.length > 0) {
              await mysqlConnection.execute(`
                INSERT INTO user_roles (user_id, role_id) VALUES (?, ?)
              `, [user_id, roles[0].id]);
            }
          }
        }

        // Commit transaction
        await mysqlConnection.commit();

        // Get updated user data
        const [updatedUser] = await mysqlConnection.execute(`
          SELECT 
            up.user_id,
            up.display_name,
            up.email,
            up.is_active as profile_active,
            au.is_admin,
            au.is_active as auth_active,
            GROUP_CONCAT(r.name SEPARATOR ', ') as roles
          FROM user_profiles up
          JOIN auth_users au ON up.user_id = au.id
          LEFT JOIN user_roles ur ON up.user_id = ur.user_id
          LEFT JOIN roles r ON ur.role_id = r.id
          WHERE up.user_id = ?
          GROUP BY up.user_id, up.display_name, up.email, up.is_active, au.is_admin, au.is_active
        `, [user_id]);

        if (updatedUser.length === 0) {
          return res.status(404).json({
            error: 'User not found',
            message: 'User could not be found after update'
          });
        }

        const user = updatedUser[0];
        return res.status(200).json({
          success: true,
          message: 'User updated successfully',
          data: {
            user_id: user.user_id,
            display_name: user.display_name,
            email: user.email,
            is_active: user.profile_active && user.auth_active,
            is_admin: user.is_admin,
            roles: user.roles || 'No roles assigned'
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
    console.error('Error in update-user API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update user',
      details: error.message
    });
  }
}

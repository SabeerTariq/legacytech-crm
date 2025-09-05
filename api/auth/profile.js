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
    // User should be available from authenticateToken middleware
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please authenticate first'
      });
    }

    // Connect to database
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Get comprehensive user profile
      const [userProfiles] = await mysqlConnection.execute(`
        SELECT 
          up.*,
          e.department,
          e.full_name,
          e.job_title,
          e.contact_number,
          e.personal_email_address,
          e.date_of_joining,
          e.reporting_manager,
          e.work_module,
          e.work_hours
        FROM user_profiles up
        LEFT JOIN employees e ON up.employee_id = e.id
        WHERE up.user_id = ?
      `, [req.user.id]);

      // Get user roles
      const [userRoles] = await mysqlConnection.execute(`
        SELECT 
          r.id,
          r.name,
          r.display_name,
          r.description,
          r.hierarchy_level
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = ?
        ORDER BY r.hierarchy_level ASC
      `, [req.user.id]);

      // Get user permissions
      const [userPermissions] = await mysqlConnection.execute(`
        SELECT 
          up.module_id,
          m.name as module_name,
          m.display_name as module_display_name,
          up.can_create,
          up.can_read,
          up.can_update,
          up.can_delete,
          up.screen_visible
        FROM user_permissions up
        JOIN modules m ON up.module_id = m.id
        WHERE up.user_id = ?
        ORDER BY m.name
      `, [req.user.id]);

      let userProfile = null;
      if (userProfiles.length > 0) {
        userProfile = userProfiles[0];
      }

      // Get role-based permissions for all user roles
      let roleBasedPermissions = [];
      if (userRoles.length > 0) {
        const roleIds = userRoles.map(role => role.id);
        const [rolePermissions] = await mysqlConnection.execute(`
          SELECT 
            rp.module_name,
            m.display_name as module_display_name,
            MAX(rp.can_create) as can_create,
            MAX(rp.can_read) as can_read,
            MAX(rp.can_update) as can_update,
            MAX(rp.can_delete) as can_delete,
            MAX(rp.screen_visible) as screen_visible
          FROM role_permissions rp
          JOIN modules m ON rp.module_name = m.name
          WHERE rp.role_id IN (${roleIds.map(() => '?').join(',')})
          GROUP BY rp.module_name, m.display_name
          ORDER BY m.display_name
        `, roleIds);
        
        roleBasedPermissions = rolePermissions.map(perm => ({
          module_name: perm.module_name,
          module_display_name: perm.module_display_name,
          can_create: Boolean(perm.can_create),
          can_read: Boolean(perm.can_read),
          can_update: Boolean(perm.can_update),
          can_delete: Boolean(perm.can_delete),
          screen_visible: Boolean(perm.screen_visible),
          source: 'role'
        }));
      }

      // Combine direct permissions with role-based permissions
      const allPermissions = [
        ...userPermissions.map(perm => ({
          module_name: perm.module_name,
          module_display_name: perm.module_display_name,
          can_create: Boolean(perm.can_create),
          can_read: Boolean(perm.can_read),
          can_update: Boolean(perm.can_update),
          can_delete: Boolean(perm.can_delete),
          screen_visible: Boolean(perm.screen_visible),
          source: 'direct'
        })),
        ...roleBasedPermissions
      ];

      // Build comprehensive user object
      const userData = {
        id: req.user.id,
        email: req.user.email,
        display_name: req.user.display_name,
        is_admin: req.user.is_admin,
        created_at: req.user.created_at,
        updated_at: req.user.updated_at,
        profile: userProfile ? {
          employee_id: userProfile.employee_id,
          is_active: userProfile.is_active,
          attributes: userProfile.attributes
        } : null,
        employee: userProfile ? {
          department: userProfile.department,
          full_name: userProfile.full_name,
          job_title: userProfile.job_title,
          contact_number: userProfile.contact_number,
          personal_email_address: userProfile.personal_email_address,
          date_of_joining: userProfile.date_of_joining,
          reporting_manager: userProfile.reporting_manager,
          work_module: userProfile.work_module,
          work_hours: userProfile.work_hours
        } : null,
        roles: userRoles.map(role => ({
          id: role.id,
          name: role.name,
          display_name: role.display_name,
          description: role.description,
          hierarchy_level: role.hierarchy_level
        })),
        permissions: allPermissions
      };

      // Return success response
      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: userData
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Profile retrieval error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'An error occurred while retrieving profile'
    });
  }
}

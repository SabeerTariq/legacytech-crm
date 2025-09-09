import express from 'express';
import mysql from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
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

// GET /api/admin/roles - Get all roles
router.get('/', async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const [roles] = await mysqlConnection.execute(`
        SELECT 
          r.id,
          r.name,
          r.display_name,
          r.description,
          r.hierarchy_level,
          r.is_system_role,
          r.permissions,
          r.created_at,
          r.updated_at
        FROM roles r
        ORDER BY r.display_name
      `);

      // Return roles in the format expected by the frontend
      const rolesWithPermissions = await Promise.all(
        roles.map(async (role) => {
          // Get role permissions
          const [permissions] = await mysqlConnection.execute(`
            SELECT 
              module_name,
              can_create,
              can_read,
              can_update,
              can_delete,
              screen_visible
            FROM role_permissions 
            WHERE role_id = ?
          `, [role.id]);

          return {
            id: role.id,
            name: role.name,
            display_name: role.display_name || role.name,
            description: role.description,
            hierarchy_level: role.hierarchy_level || 50,
            is_system_role: role.is_system_role || false,
            permissions: permissions || [],
            created_at: role.created_at,
            updated_at: role.updated_at
          };
        })
      );

      res.status(200).json(rolesWithPermissions);

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching roles:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch roles'
    });
  }
});

// GET /api/admin/roles/:id - Get specific role
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const [roles] = await mysqlConnection.execute(`
        SELECT 
          r.id,
          r.name,
          r.display_name,
          r.description,
          r.hierarchy_level,
          r.is_system_role,
          r.permissions,
          r.created_at,
          r.updated_at
        FROM roles r
        WHERE r.id = ?
      `, [id]);

      if (roles.length === 0) {
        return res.status(404).json({
          error: 'Role not found',
          message: 'Role could not be found'
        });
      }

      const role = roles[0];
      
      // Get role permissions
      const [permissions] = await mysqlConnection.execute(`
        SELECT 
          module_name,
          can_create,
          can_read,
          can_update,
          can_delete,
          screen_visible
        FROM role_permissions 
        WHERE role_id = ?
      `, [id]);

      res.status(200).json({
        id: role.id,
        name: role.name,
        display_name: role.display_name || role.name,
        description: role.description,
        hierarchy_level: role.hierarchy_level || 50,
        is_system_role: role.is_system_role || false,
        permissions: permissions || [],
        created_at: role.created_at,
        updated_at: role.updated_at
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching role:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch role'
    });
  }
});

// POST /api/admin/roles - Create new role
router.post('/', async (req, res) => {
  try {
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Role name is required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Check if role name already exists
      const [existingRoles] = await mysqlConnection.execute(`
        SELECT id FROM roles WHERE name = ?
      `, [name]);

      if (existingRoles.length > 0) {
        return res.status(409).json({
          error: 'Role already exists',
          message: 'A role with this name already exists'
        });
      }

      // Create new role
      const roleId = uuidv4();
      await mysqlConnection.execute(`
        INSERT INTO roles (
          id, name, description, permissions, created_at, updated_at
        ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [
        roleId,
        name,
        description || null,
        permissions ? JSON.stringify(permissions) : null
      ]);

      // Get the created role
      const [newRole] = await mysqlConnection.execute(`
        SELECT * FROM roles WHERE id = ?
      `, [roleId]);

      res.status(201).json({
        success: true,
        message: 'Role created successfully',
        data: {
          ...newRole[0],
          permissions: newRole[0].permissions ? JSON.parse(newRole[0].permissions) : {},
          user_count: 0
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create role'
    });
  }
});

// PUT /api/admin/roles/:id - Update role
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;

    if (!name) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Role name is required'
      });
    }

    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Check if role exists
      const [existingRoles] = await mysqlConnection.execute(`
        SELECT id FROM roles WHERE id = ?
      `, [id]);

      if (existingRoles.length === 0) {
        return res.status(404).json({
          error: 'Role not found',
          message: 'Role could not be found'
        });
      }

      // Check if new name conflicts with existing role
      const [nameConflict] = await mysqlConnection.execute(`
        SELECT id FROM roles WHERE name = ? AND id != ?
      `, [name, id]);

      if (nameConflict.length > 0) {
        return res.status(409).json({
          error: 'Role name conflict',
          message: 'A role with this name already exists'
        });
      }

      // Update role
      await mysqlConnection.execute(`
        UPDATE roles 
        SET name = ?, description = ?, permissions = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [
        name,
        description || null,
        permissions ? JSON.stringify(permissions) : null,
        id
      ]);

      // Get the updated role
      const [updatedRole] = await mysqlConnection.execute(`
        SELECT 
          r.id,
          r.name,
          r.description,
          r.permissions,
          r.created_at,
          r.updated_at,
          COUNT(ur.user_id) as user_count
        FROM roles r
        LEFT JOIN user_roles ur ON r.id = ur.role_id
        WHERE r.id = ?
        GROUP BY r.id, r.name, r.description, r.permissions, r.created_at, r.updated_at
      `, [id]);

      res.status(200).json({
        success: true,
        message: 'Role updated successfully',
        data: {
          ...updatedRole[0],
          permissions: updatedRole[0].permissions ? JSON.parse(updatedRole[0].permissions) : {},
          user_count: parseInt(updatedRole[0].user_count)
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update role'
    });
  }
});

// DELETE /api/admin/roles/:id - Delete role
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Check if role exists
      const [existingRoles] = await mysqlConnection.execute(`
        SELECT id, name FROM roles WHERE id = ?
      `, [id]);

      if (existingRoles.length === 0) {
        return res.status(404).json({
          error: 'Role not found',
          message: 'Role could not be found'
        });
      }

      const role = existingRoles[0];

      // Check if role is assigned to any users
      const [userAssignments] = await mysqlConnection.execute(`
        SELECT COUNT(*) as count FROM user_roles WHERE role_id = ?
      `, [id]);

      if (userAssignments[0].count > 0) {
        return res.status(400).json({
          error: 'Cannot delete role',
          message: `Role '${role.name}' is assigned to ${userAssignments[0].count} users. Remove all assignments first.`
        });
      }

      // Delete role
      await mysqlConnection.execute(`
        DELETE FROM roles WHERE id = ?
      `, [id]);

      res.status(200).json({
        success: true,
        message: 'Role deleted successfully',
        data: {
          deleted_role: {
            id: role.id,
            name: role.name
          },
          deleted_at: new Date().toISOString()
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete role'
    });
  }
});

// GET /api/admin/roles/:id/users - Get users with this role
router.get('/:id/users', async (req, res) => {
  try {
    const { id } = req.params;
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Get role info
      const [roles] = await mysqlConnection.execute(`
        SELECT id, name, description FROM roles WHERE id = ?
      `, [id]);

      if (roles.length === 0) {
        return res.status(404).json({
          error: 'Role not found',
          message: 'Role could not be found'
        });
      }

      const role = roles[0];

      // Get users with this role
      const [users] = await mysqlConnection.execute(`
        SELECT 
          up.user_id,
          up.display_name,
          up.email,
          up.is_active,
          ur.created_at as role_assigned_at
        FROM user_roles ur
        JOIN user_profiles up ON ur.user_id = up.user_id
        WHERE ur.role_id = ?
        ORDER BY up.display_name
      `, [id]);

      res.status(200).json({
        success: true,
        data: {
          role: {
            id: role.id,
            name: role.name,
            description: role.description
          },
          users: users,
          user_count: users.length
        }
      });

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching role users:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch role users'
    });
  }
});

// GET /api/admin/roles/modules/list - Get all available modules
router.get('/modules/list', async (req, res) => {
  try {
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      const [modules] = await mysqlConnection.execute(`
        SELECT 
          id,
          name,
          display_name,
          description,
          created_at
        FROM modules 
        ORDER BY display_name
      `);

      res.status(200).json(modules);

    } finally {
      await mysqlConnection.end();
    }

  } catch (error) {
    console.error('Error fetching modules:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to fetch modules'
    });
  }
});

export default router;

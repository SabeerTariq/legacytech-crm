import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Get all roles
router.get('/', async (req, res) => {
  try {
    const { data: roles, error } = await supabase
      .from('roles')
      .select('*')
      .order('display_name', { ascending: true });

    if (error) {
      console.error('Error fetching roles:', error);
      return res.status(500).json({ error: 'Failed to fetch roles' });
    }

    // Fetch permissions for each role
    const rolesWithPermissions = await Promise.all(
      roles.map(async (role) => {
        const { data: permissions, error: permError } = await supabase
          .from('role_permissions')
          .select('*')
          .eq('role_id', role.id);

        if (permError) {
          console.error('Error fetching permissions for role:', role.id, permError);
          return { ...role, permissions: [] };
        }

        return { ...role, permissions: permissions || [] };
      })
    );

    res.json(rolesWithPermissions);
  } catch (error) {
    console.error('Error in GET /roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get role by ID with permissions
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Get role details
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .single();

    if (roleError) {
      console.error('Error fetching role:', roleError);
      return res.status(404).json({ error: 'Role not found' });
    }

    // Get role permissions
    const { data: permissions, error: permError } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('role_id', id);

    if (permError) {
      console.error('Error fetching role permissions:', permError);
      return res.status(500).json({ error: 'Failed to fetch role permissions' });
    }

    res.json({
      ...role,
      permissions: permissions || []
    });
  } catch (error) {
    console.error('Error in GET /roles/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new role
router.post('/', async (req, res) => {
  try {
    const { name, display_name, description, permissions } = req.body;

    if (!name || !display_name) {
      return res.status(400).json({ error: 'Name and display name are required' });
    }

    // Check if role name already exists
    const { data: existingRole } = await supabase
      .from('roles')
      .select('id')
      .eq('name', name)
      .single();

    if (existingRole) {
      return res.status(400).json({ error: 'Role name already exists' });
    }

    // Create role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .insert([{
        name,
        display_name,
        description: description || '',
        hierarchy_level: 50, // Default level
        is_system_role: false
      }])
      .select()
      .single();

    if (roleError) {
      console.error('Error creating role:', roleError);
      return res.status(500).json({ error: 'Failed to create role' });
    }

    // Create role permissions if provided
    if (permissions && Array.isArray(permissions)) {
      const permissionData = permissions.map(perm => ({
        role_id: role.id,
        module_name: perm.module_name,
        can_create: perm.can_create || false,
        can_read: perm.can_read || false,
        can_update: perm.can_update || false,
        can_delete: perm.can_delete || false,
        screen_visible: perm.screen_visible || false
      }));

      const { error: permError } = await supabase
        .from('role_permissions')
        .insert(permissionData);

      if (permError) {
        console.error('Error creating role permissions:', permError);
        // Delete the role if permissions fail
        await supabase.from('roles').delete().eq('id', role.id);
        return res.status(500).json({ error: 'Failed to create role permissions' });
      }
    }

    // Fetch the created role with permissions
    const { data: createdRoleWithPermissions, error: fetchError } = await supabase
      .from('roles')
      .select('*')
      .eq('id', role.id)
      .single();

    if (fetchError) {
      console.error('Error fetching created role:', fetchError);
      res.status(201).json(role);
      return;
    }

    // Fetch permissions for the created role
    const { data: rolePermissions, error: permFetchError } = await supabase
      .from('role_permissions')
      .select('*')
      .eq('role_id', role.id);

    const roleWithPermissions = {
      ...createdRoleWithPermissions,
      permissions: rolePermissions || []
    };

    res.status(201).json(roleWithPermissions);
  } catch (error) {
    console.error('Error in POST /roles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update role
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, display_name, description, permissions } = req.body;

    // Check if role exists
    const { data: existingRole, error: checkError } = await supabase
      .from('roles')
      .select('id, is_system_role')
      .eq('id', id)
      .single();

    if (checkError) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Prevent updating system roles
    if (existingRole.is_system_role) {
      return res.status(400).json({ error: 'Cannot update system roles' });
    }

    // Update role
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .update({
        name: name || existingRole.name,
        display_name: display_name || existingRole.display_name,
        description: description || existingRole.description,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (roleError) {
      console.error('Error updating role:', roleError);
      return res.status(500).json({ error: 'Failed to update role' });
    }

    // Update permissions if provided
    if (permissions && Array.isArray(permissions)) {
      // Delete existing permissions
      await supabase
        .from('role_permissions')
        .delete()
        .eq('role_id', id);

      // Insert new permissions
      const permissionData = permissions.map(perm => ({
        role_id: id,
        module_name: perm.module_name,
        can_create: perm.can_create || false,
        can_read: perm.can_read || false,
        can_update: perm.can_update || false,
        can_delete: perm.can_delete || false,
        screen_visible: perm.screen_visible || false
      }));

      const { error: permError } = await supabase
        .from('role_permissions')
        .insert(permissionData);

      if (permError) {
        console.error('Error updating role permissions:', permError);
        return res.status(500).json({ error: 'Failed to update role permissions' });
      }
    }

    res.json(role);
  } catch (error) {
    console.error('Error in PUT /roles/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete role
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check if role exists and is not a system role
    const { data: role, error: checkError } = await supabase
      .from('roles')
      .select('id, name, is_system_role')
      .eq('id', id)
      .single();

    if (checkError) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Prevent deleting system roles
    if (role.is_system_role) {
      return res.status(400).json({ error: 'Cannot delete system roles' });
    }

    // Check if role is assigned to any users
    const { data: userRoles, error: userRoleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('role_id', id);

    if (userRoleError) {
      console.error('Error checking user roles:', userRoleError);
      return res.status(500).json({ error: 'Failed to check role usage' });
    }

    if (userRoles && userRoles.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete role that is assigned to users. Please reassign users first.' 
      });
    }

    // Delete role permissions first
    await supabase
      .from('role_permissions')
      .delete()
      .eq('role_id', id);

    // Delete role
    const { error: deleteError } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting role:', deleteError);
      return res.status(500).json({ error: 'Failed to delete role' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE /roles/:id:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all available modules
router.get('/modules/list', async (req, res) => {
  try {
    const { data: modules, error } = await supabase
      .from('modules')
      .select('*')
      .order('display_name');

    if (error) {
      console.error('Error fetching modules:', error);
      return res.status(500).json({ error: 'Failed to fetch modules' });
    }

    res.json(modules);
  } catch (error) {
    console.error('Error in GET /roles/modules/list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyRoleManagement() {
  try {
    console.log('🔧 Applying Role Management Migration...\n');

    // Step 1: Clean up existing roles and keep only admin
    console.log('1. Cleaning up existing roles...');
    const { error: deleteUserRolesError } = await supabase
      .from('user_roles')
      .delete()
      .neq('role_id', '00000000-0000-0000-0000-000000000000'); // Keep admin role

    if (deleteUserRolesError) {
      console.log('No user_roles to clean up or error:', deleteUserRolesError.message);
    }

    const { error: deleteRolesError } = await supabase
      .from('roles')
      .delete()
      .neq('name', 'admin');

    if (deleteRolesError) {
      console.log('No roles to clean up or error:', deleteRolesError.message);
    }

    // Step 2: Update admin role
    console.log('2. Updating admin role...');
    const { error: updateAdminError } = await supabase
      .from('roles')
      .update({
        permissions: [
          { resource: "*", action: "*" },
          { resource: "users", action: "manage" },
          { resource: "roles", action: "manage" },
          { resource: "audit", action: "view" }
        ],
        hierarchy_level: 100,
        display_name: 'Administrator',
        description: 'Full system access with all permissions'
      })
      .eq('name', 'admin');

    if (updateAdminError) {
      console.log('Error updating admin role:', updateAdminError.message);
    }

    // Step 3: Create role_permissions table
    console.log('3. Creating role_permissions table...');
    const { error: createRolePermissionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS role_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          module_name TEXT NOT NULL,
          can_create BOOLEAN DEFAULT false,
          can_read BOOLEAN DEFAULT false,
          can_update BOOLEAN DEFAULT false,
          can_delete BOOLEAN DEFAULT false,
          screen_visible BOOLEAN DEFAULT false,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(role_id, module_name)
        );
      `
    });

    if (createRolePermissionsError) {
      console.log('Error creating role_permissions table:', createRolePermissionsError.message);
    }

    // Step 4: Create user_roles table
    console.log('4. Creating user_roles table...');
    const { error: createUserRolesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS user_roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT NOW(),
          UNIQUE(user_id, role_id)
        );
      `
    });

    if (createUserRolesError) {
      console.log('Error creating user_roles table:', createUserRolesError.message);
    }

    // Step 5: Get admin role and modules
    console.log('5. Setting up admin permissions...');
    const { data: adminRole, error: adminRoleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', 'admin')
      .single();

    if (adminRoleError) {
      console.log('Error fetching admin role:', adminRoleError.message);
      return;
    }

    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('name');

    if (modulesError) {
      console.log('Error fetching modules:', modulesError.message);
      return;
    }

    // Step 6: Insert admin permissions for all modules
    console.log('6. Inserting admin permissions...');
    const adminPermissions = modules.map(module => ({
      role_id: adminRole.id,
      module_name: module.name,
      can_create: true,
      can_read: true,
      can_update: true,
      can_delete: true,
      screen_visible: true
    }));

    const { error: insertPermissionsError } = await supabase
      .from('role_permissions')
      .upsert(adminPermissions, { onConflict: 'role_id,module_name' });

    if (insertPermissionsError) {
      console.log('Error inserting admin permissions:', insertPermissionsError.message);
    }

    // Step 7: Create indexes
    console.log('7. Creating indexes...');
    const { error: indexError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
        CREATE INDEX IF NOT EXISTS idx_role_permissions_module_name ON role_permissions(module_name);
        CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
        CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
      `
    });

    if (indexError) {
      console.log('Error creating indexes:', indexError.message);
    }

    // Step 8: Enable RLS
    console.log('8. Enabling Row Level Security...');
    const { error: rlsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
        ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
      `
    });

    if (rlsError) {
      console.log('Error enabling RLS:', rlsError.message);
    }

    // Step 9: Create RLS policies
    console.log('9. Creating RLS policies...');
    const { error: policyError } = await supabase.rpc('exec_sql', {
      sql: `
        DROP POLICY IF EXISTS "Admins can manage role permissions" ON role_permissions;
        CREATE POLICY "Admins can manage role permissions" ON role_permissions
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM user_roles ur
              JOIN roles r ON r.id = ur.role_id
              WHERE ur.user_id = auth.uid() 
              AND r.name = 'admin'
            )
          );

        DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
        CREATE POLICY "Admins can manage user roles" ON user_roles
          FOR ALL USING (
            EXISTS (
              SELECT 1 FROM user_roles ur
              JOIN roles r ON r.id = ur.role_id
              WHERE ur.user_id = auth.uid() 
              AND r.name = 'admin'
            )
          );
      `
    });

    if (policyError) {
      console.log('Error creating policies:', policyError.message);
    }

    // Step 10: Create functions
    console.log('10. Creating permission functions...');
    const { error: functionError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
        RETURNS TABLE (
          module_name TEXT,
          can_create BOOLEAN,
          can_read BOOLEAN,
          can_update BOOLEAN,
          can_delete BOOLEAN,
          screen_visible BOOLEAN
        ) AS $$
        BEGIN
          RETURN QUERY
          SELECT 
            rp.module_name,
            MAX(rp.can_create)::BOOLEAN as can_create,
            MAX(rp.can_read)::BOOLEAN as can_read,
            MAX(rp.can_update)::BOOLEAN as can_update,
            MAX(rp.can_delete)::BOOLEAN as can_delete,
            MAX(rp.screen_visible)::BOOLEAN as screen_visible
          FROM user_roles ur
          JOIN role_permissions rp ON ur.role_id = rp.role_id
          WHERE ur.user_id = user_uuid
          GROUP BY rp.module_name;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        CREATE OR REPLACE FUNCTION user_has_permission(
          user_uuid UUID,
          module_name TEXT,
          action TEXT
        )
        RETURNS BOOLEAN AS $$
        DECLARE
          has_permission BOOLEAN := FALSE;
        BEGIN
          SELECT 
            CASE action
              WHEN 'create' THEN can_create
              WHEN 'read' THEN can_read
              WHEN 'update' THEN can_update
              WHEN 'delete' THEN can_delete
              WHEN 'visible' THEN screen_visible
              ELSE FALSE
            END INTO has_permission
          FROM get_user_permissions(user_uuid)
          WHERE module_name = $2;
          
          RETURN COALESCE(has_permission, FALSE);
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `
    });

    if (functionError) {
      console.log('Error creating functions:', functionError.message);
    }

    console.log('\n✅ Role Management Migration Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log('- Cleaned up existing roles (kept admin)');
    console.log('- Created role_permissions table');
    console.log('- Created user_roles table');
    console.log('- Set up admin permissions for all modules');
    console.log('- Created indexes for performance');
    console.log('- Enabled Row Level Security');
    console.log('- Created RLS policies');
    console.log('- Created permission functions');

  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

applyRoleManagement(); 
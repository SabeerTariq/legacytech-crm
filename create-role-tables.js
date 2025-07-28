import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createRoleTables() {
  console.log('🔧 Creating Role Management Tables...');

  try {
    // 1. Create roles table
    console.log('1. Creating roles table...');
    const { error: rolesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS roles (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT UNIQUE NOT NULL,
          display_name TEXT NOT NULL,
          description TEXT,
          hierarchy_level INTEGER DEFAULT 50,
          is_system_role BOOLEAN DEFAULT false,
          permissions JSONB DEFAULT '[]'::jsonb,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );
      `
    });

    if (rolesError) {
      console.log('Roles table error:', rolesError.message);
      // Try direct SQL execution
      const { error: directRolesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_name', 'roles');
      
      if (directRolesError) {
        console.log('Direct check failed:', directRolesError.message);
      }
    } else {
      console.log('✅ Roles table created successfully');
    }

    // 2. Create role_permissions table
    console.log('2. Creating role_permissions table...');
    const { error: rolePermsError } = await supabase.rpc('exec_sql', {
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

    if (rolePermsError) {
      console.log('Role permissions table error:', rolePermsError.message);
    } else {
      console.log('✅ Role permissions table created successfully');
    }

    // 3. Create user_roles table
    console.log('3. Creating user_roles table...');
    const { error: userRolesError } = await supabase.rpc('exec_sql', {
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

    if (userRolesError) {
      console.log('User roles table error:', userRolesError.message);
    } else {
      console.log('✅ User roles table created successfully');
    }

    // 4. Create admin role
    console.log('4. Creating admin role...');
    const { data: adminRole, error: adminError } = await supabase
      .from('roles')
      .insert([{
        name: 'admin',
        display_name: 'Administrator',
        description: 'Full system access with all permissions',
        hierarchy_level: 100,
        is_system_role: true,
        permissions: [
          {"resource": "*", "action": "*"},
          {"resource": "users", "action": "manage"},
          {"resource": "roles", "action": "manage"},
          {"resource": "audit", "action": "view"}
        ]
      }])
      .select()
      .single();

    if (adminError) {
      if (adminError.code === '23505') { // Unique violation
        console.log('✅ Admin role already exists');
      } else {
        console.log('Admin role error:', adminError.message);
      }
    } else {
      console.log('✅ Admin role created successfully');
    }

    // 5. Create indexes
    console.log('5. Creating indexes...');
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);',
      'CREATE INDEX IF NOT EXISTS idx_role_permissions_module_name ON role_permissions(module_name);',
      'CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);'
    ];

    for (const query of indexQueries) {
      const { error: indexError } = await supabase.rpc('exec_sql', { sql: query });
      if (indexError) {
        console.log('Index creation error:', indexError.message);
      }
    }

    console.log('✅ Indexes created successfully');

    // 6. Enable RLS
    console.log('6. Enabling Row Level Security...');
    const rlsQueries = [
      'ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;',
      'ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;'
    ];

    for (const query of rlsQueries) {
      const { error: rlsError } = await supabase.rpc('exec_sql', { sql: query });
      if (rlsError) {
        console.log('RLS error:', rlsError.message);
      }
    }

    console.log('✅ RLS enabled successfully');

    // 7. Create RLS policies
    console.log('7. Creating RLS policies...');
    const policyQueries = [
      `CREATE POLICY "Admins can manage role permissions" ON role_permissions
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'admin'
          )
        );`,
      `CREATE POLICY "Admins can manage user roles" ON user_roles
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'admin'
          )
        );`
    ];

    for (const query of policyQueries) {
      const { error: policyError } = await supabase.rpc('exec_sql', { sql: query });
      if (policyError) {
        console.log('Policy creation error:', policyError.message);
      }
    }

    console.log('✅ RLS policies created successfully');

    // 8. Create functions
    console.log('8. Creating permission functions...');
    const functionQueries = [
      `CREATE OR REPLACE FUNCTION get_user_permissions(user_uuid UUID)
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
        $$ LANGUAGE plpgsql SECURITY DEFINER;`,
      `CREATE OR REPLACE FUNCTION user_has_permission(
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
        $$ LANGUAGE plpgsql SECURITY DEFINER;`
    ];

    for (const query of functionQueries) {
      const { error: functionError } = await supabase.rpc('exec_sql', { sql: query });
      if (functionError) {
        console.log('Function creation error:', functionError.message);
      }
    }

    console.log('✅ Permission functions created successfully');

    // 9. Insert admin permissions for all modules
    console.log('9. Setting up admin permissions...');
    const { data: modules } = await supabase
      .from('modules')
      .select('name');

    if (modules && modules.length > 0) {
      const { data: adminRoleData } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'admin')
        .single();

      if (adminRoleData) {
        const permissionData = modules.map(module => ({
          role_id: adminRoleData.id,
          module_name: module.name,
          can_create: true,
          can_read: true,
          can_update: true,
          can_delete: true,
          screen_visible: true
        }));

        const { error: permError } = await supabase
          .from('role_permissions')
          .insert(permissionData);

        if (permError) {
          console.log('Admin permissions error:', permError.message);
        } else {
          console.log('✅ Admin permissions set up successfully');
        }
      }
    }

    console.log('🎉 Role management system setup completed!');

  } catch (error) {
    console.error('❌ Error setting up role management:', error);
  }
}

createRoleTables(); 
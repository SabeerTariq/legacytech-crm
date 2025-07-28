import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTablesDirect() {
  console.log('🔧 Creating Role Management Tables (Direct Method)...');

  try {
    // First, let's check what tables exist
    console.log('Checking existing tables...');
    const { data: existingTables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tableError) {
      console.log('Error checking tables:', tableError.message);
    } else {
      console.log('Existing tables:', existingTables?.map(t => t.table_name) || []);
    }

    // Since we can't use exec_sql, let's try to create tables by inserting data
    // This will fail if the table doesn't exist, but we can catch the error
    
    // 1. Try to create admin role (this will fail if roles table doesn't exist)
    console.log('1. Attempting to create admin role...');
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
      if (adminError.code === '42P01') { // Table doesn't exist
        console.log('❌ Roles table does not exist. We need to create it manually.');
        console.log('Please run the following SQL in your Supabase SQL editor:');
        console.log(`
-- Create roles table
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

-- Create role_permissions table
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

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_module_name ON role_permissions(module_name);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- Enable RLS
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins can manage role permissions" ON role_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'admin'
    )
  );

CREATE POLICY "Admins can manage user roles" ON user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur
      JOIN roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() 
      AND r.name = 'admin'
    )
  );

-- Create permission functions
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
        `);
      } else if (adminError.code === '23505') { // Unique violation
        console.log('✅ Admin role already exists');
      } else {
        console.log('Admin role error:', adminError.message);
      }
    } else {
      console.log('✅ Admin role created successfully');
    }

    // 2. Check if we can access the modules table
    console.log('2. Checking modules table...');
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('name, display_name')
      .limit(5);

    if (modulesError) {
      console.log('Modules table error:', modulesError.message);
    } else {
      console.log('Available modules:', modules?.map(m => m.name) || []);
    }

    // 3. Try to set up admin permissions if roles table exists
    if (!adminError || adminError.code === '23505') {
      console.log('3. Setting up admin permissions...');
      
      // Get admin role ID
      const { data: adminRoleData } = await supabase
        .from('roles')
        .select('id')
        .eq('name', 'admin')
        .single();

      if (adminRoleData && modules && modules.length > 0) {
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
          if (permError.code === '42P01') {
            console.log('❌ role_permissions table does not exist');
          } else {
            console.log('Admin permissions error:', permError.message);
          }
        } else {
          console.log('✅ Admin permissions set up successfully');
        }
      }
    }

    console.log('🎉 Setup process completed!');
    console.log('If tables were missing, please run the SQL commands above in your Supabase SQL editor.');

  } catch (error) {
    console.error('❌ Error in setup process:', error);
  }
}

createTablesDirect(); 
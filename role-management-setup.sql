-- Complete Role Management System Setup
-- Run this in your Supabase SQL Editor

-- 1. Create roles table
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

-- 2. Create role_permissions table
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

-- 3. Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_module_name ON role_permissions(module_name);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- 5. Enable Row Level Security
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS policies
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

-- 7. Create permission functions
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

-- 8. Create admin role
INSERT INTO roles (name, display_name, description, hierarchy_level, is_system_role, permissions)
VALUES (
  'admin',
  'Administrator',
  'Full system access with all permissions',
  100,
  true,
  '[
    {"resource": "*", "action": "*"},
    {"resource": "users", "action": "manage"},
    {"resource": "roles", "action": "manage"},
    {"resource": "audit", "action": "view"}
  ]'::jsonb
) ON CONFLICT (name) DO NOTHING;

-- 9. Insert admin permissions for all modules
INSERT INTO role_permissions (role_id, module_name, can_create, can_read, can_update, can_delete, screen_visible)
SELECT 
  r.id,
  m.name,
  true, true, true, true, true  -- Admin gets all permissions
FROM roles r
CROSS JOIN modules m
WHERE r.name = 'admin'
ON CONFLICT (role_id, module_name) DO NOTHING;

-- 10. Verify setup
SELECT 'Roles table created' as status, COUNT(*) as count FROM roles
UNION ALL
SELECT 'Role permissions created', COUNT(*) FROM role_permissions
UNION ALL
SELECT 'User roles table created', COUNT(*) FROM user_roles; 
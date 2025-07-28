-- Simplified Role Management System
-- This migration removes complex RBAC and creates a simple role management system

-- 1. Clean up existing roles and keep only admin
DELETE FROM user_roles WHERE role_id IN (
  SELECT id FROM roles WHERE name != 'admin'
);

DELETE FROM roles WHERE name != 'admin';

-- 2. Update admin role to have all permissions
UPDATE roles 
SET permissions = '[
  {"resource": "*", "action": "*"},
  {"resource": "users", "action": "manage"},
  {"resource": "roles", "action": "manage"},
  {"resource": "audit", "action": "view"}
]'::jsonb,
hierarchy_level = 100,
display_name = 'Administrator',
description = 'Full system access with all permissions'
WHERE name = 'admin';

-- 3. Create simplified role_permissions table
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

-- 4. Create user_roles table (simplified)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- 5. Insert all available modules for role management
INSERT INTO role_permissions (role_id, module_name, can_create, can_read, can_update, can_delete, screen_visible)
SELECT 
    r.id,
    m.name,
    true, true, true, true, true  -- Admin gets all permissions
FROM roles r
CROSS JOIN modules m
WHERE r.name = 'admin'
ON CONFLICT (role_id, module_name) DO NOTHING;

-- 6. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_module_name ON role_permissions(module_name);
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);

-- 7. Enable Row Level Security
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies
-- Role permissions: Only admins can manage
CREATE POLICY "Admins can manage role permissions" ON role_permissions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'admin'
        )
    );

-- User roles: Only admins can manage
CREATE POLICY "Admins can manage user roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'admin'
        )
    );

-- 9. Create function to get user permissions
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

-- 10. Create function to check if user has permission
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
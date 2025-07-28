-- Improved User Management & Permissions Schema
-- This migration implements a modern ABAC/RBAC hybrid system

-- Core Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    permissions JSONB NOT NULL DEFAULT '{}',
    hierarchy_level INTEGER NOT NULL DEFAULT 0,
    is_system_role BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Role Hierarchies for inheritance
CREATE TABLE IF NOT EXISTS role_hierarchies (
    parent_role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    child_role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (parent_role_id, child_role_id),
    CONSTRAINT no_self_reference CHECK (parent_role_id != child_role_id)
);

-- Improved User Profiles
DROP TABLE IF EXISTS user_profiles CASCADE;
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id UUID UNIQUE REFERENCES employees(id) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    attributes JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- User Role Assignments with temporal support
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    granted_by UUID REFERENCES auth.users(id),
    granted_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP NULL,
    context JSONB DEFAULT '{}',
    UNIQUE(user_id, role_id)
);

-- Permission Definitions for fine-grained control
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    description TEXT,
    attributes JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(resource, action)
);

-- Audit Log for security and compliance
CREATE TABLE IF NOT EXISTS permission_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    permission_granted BOOLEAN NOT NULL,
    context JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_active ON user_roles(user_id, role_id) WHERE expires_at IS NULL OR expires_at > NOW();
CREATE INDEX IF NOT EXISTS idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON permission_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON permission_audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permission_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
CREATE POLICY "Admins can manage all profiles" ON user_profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'super_admin'
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

-- RLS Policies for user_roles
DROP POLICY IF EXISTS "Users can view own roles" ON user_roles;
CREATE POLICY "Users can view own roles" ON user_roles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage user roles" ON user_roles;
CREATE POLICY "Admins can manage user roles" ON user_roles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('super_admin', 'admin')
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

-- RLS Policies for audit log
DROP POLICY IF EXISTS "Admins can view audit logs" ON permission_audit_log;
CREATE POLICY "Admins can view audit logs" ON permission_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            JOIN roles r ON r.id = ur.role_id
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('super_admin', 'admin')
            AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        )
    );

-- Insert default roles
INSERT INTO roles (name, display_name, description, permissions, hierarchy_level, is_system_role) VALUES
('super_admin', 'Super Administrator', 'Full system access with all permissions', '[
    {"resource": "*", "action": "*"},
    {"resource": "users", "action": "manage"},
    {"resource": "roles", "action": "manage"},
    {"resource": "audit", "action": "view"}
]'::jsonb, 100, true),

('admin', 'Administrator', 'Administrative access to most features', '[
    {"resource": "leads", "action": "*"},
    {"resource": "projects", "action": "*"},
    {"resource": "employees", "action": "*"},
    {"resource": "customers", "action": "*"},
    {"resource": "dashboard", "action": "view"},
    {"resource": "reports", "action": "view"}
]'::jsonb, 75, true),

('manager', 'Manager', 'Management level access', '[
    {"resource": "leads", "action": "read"},
    {"resource": "leads", "action": "update"},
    {"resource": "leads", "action": "create"},
    {"resource": "projects", "action": "read"},
    {"resource": "projects", "action": "update"},
    {"resource": "employees", "action": "read"},
    {"resource": "customers", "action": "read"},
    {"resource": "dashboard", "action": "view"},
    {"resource": "reports", "action": "view"}
]'::jsonb, 50, true),

('front_sales', 'Front Sales', 'Front sales team access', '[
    {"resource": "leads", "action": "read"},
    {"resource": "leads", "action": "create"},
    {"resource": "leads", "action": "update", "conditions": "resource.assigned_to == user.id"},
    {"resource": "customers", "action": "read"},
    {"resource": "customers", "action": "create"},
    {"resource": "dashboard", "action": "view"}
]'::jsonb, 25, true),

('employee', 'Employee', 'Standard employee access', '[
    {"resource": "dashboard", "action": "view"},
    {"resource": "projects", "action": "read", "conditions": "resource.assigned_to == user.id OR resource.team_members contains user.id"}
]'::jsonb, 10, true);

-- Insert default permissions
INSERT INTO permissions (resource, action, description) VALUES
('*', '*', 'All permissions on all resources'),
('leads', 'create', 'Create new leads'),
('leads', 'read', 'View leads'),
('leads', 'update', 'Edit leads'),
('leads', 'delete', 'Delete leads'),
('projects', 'create', 'Create projects'),
('projects', 'read', 'View projects'),
('projects', 'update', 'Edit projects'),
('projects', 'delete', 'Delete projects'),
('employees', 'create', 'Create employee records'),
('employees', 'read', 'View employee information'),
('employees', 'update', 'Edit employee information'),
('employees', 'delete', 'Delete employee records'),
('customers', 'create', 'Create customer records'),
('customers', 'read', 'View customer information'),
('customers', 'update', 'Edit customer information'),
('customers', 'delete', 'Delete customer records'),
('dashboard', 'view', 'Access dashboard'),
('reports', 'view', 'View reports'),
('users', 'manage', 'Manage user accounts'),
('roles', 'manage', 'Manage roles and permissions'),
('audit', 'view', 'View audit logs');

-- Function to sync user profiles when auth.users is created
CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, email, display_name)
    VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
    ON CONFLICT (user_id) DO UPDATE SET
        email = NEW.email,
        updated_at = NOW();
    
    -- Assign default employee role
    INSERT INTO user_roles (user_id, role_id)
    SELECT NEW.id, r.id
    FROM roles r
    WHERE r.name = 'employee'
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION sync_user_profile();

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(
    check_user_id UUID,
    check_resource TEXT,
    check_action TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
    has_permission BOOLEAN := FALSE;
    role_record RECORD;
    permission_record JSONB;
BEGIN
    -- Loop through user's active roles
    FOR role_record IN 
        SELECT r.permissions, r.hierarchy_level
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = check_user_id
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
        ORDER BY r.hierarchy_level DESC
    LOOP
        -- Check each permission in the role
        FOR permission_record IN 
            SELECT value FROM jsonb_array_elements(role_record.permissions)
        LOOP
            -- Check for wildcard permissions
            IF (permission_record->>'resource' = '*' AND permission_record->>'action' = '*') OR
               (permission_record->>'resource' = check_resource AND permission_record->>'action' = '*') OR
               (permission_record->>'resource' = check_resource AND permission_record->>'action' = check_action) THEN
                has_permission := TRUE;
                EXIT;
            END IF;
        END LOOP;
        
        IF has_permission THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN has_permission;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user's effective permissions
CREATE OR REPLACE FUNCTION get_user_permissions(check_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    all_permissions JSONB := '[]'::jsonb;
    role_record RECORD;
    permission_record JSONB;
BEGIN
    -- Aggregate all permissions from user's active roles
    FOR role_record IN 
        SELECT r.permissions
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = check_user_id
        AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    LOOP
        -- Add each permission to the aggregate
        FOR permission_record IN 
            SELECT value FROM jsonb_array_elements(role_record.permissions)
        LOOP
            all_permissions := all_permissions || permission_record;
        END LOOP;
    END LOOP;
    
    RETURN all_permissions;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
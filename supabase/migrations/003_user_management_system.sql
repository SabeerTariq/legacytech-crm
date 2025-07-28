-- User Management System Migration
-- This adds the necessary tables for admin user creation and management

-- Add employee_id column to user_profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'employee_id') THEN
        ALTER TABLE user_profiles ADD COLUMN employee_id UUID REFERENCES employees(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add is_active column to user_profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'is_active') THEN
        ALTER TABLE user_profiles ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Add attributes column to user_profiles if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user_profiles' AND column_name = 'attributes') THEN
        ALTER TABLE user_profiles ADD COLUMN attributes JSONB DEFAULT '{}';
    END IF;
END $$;

-- Create modules table for permission system
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create user_permissions table
CREATE TABLE IF NOT EXISTS user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_id INTEGER NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    can_create BOOLEAN DEFAULT false,
    can_read BOOLEAN DEFAULT false,
    can_update BOOLEAN DEFAULT false,
    can_delete BOOLEAN DEFAULT false,
    screen_visible BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

-- Insert default modules
INSERT INTO modules (name, display_name, description) VALUES
('dashboard', 'Dashboard', 'Main dashboard access'),
('leads', 'Leads', 'Lead management'),
('customers', 'Customers', 'Customer management'),
('sales', 'Sales', 'Sales management'),
('upsell', 'Upsell', 'Upsell management'),
('projects', 'Projects', 'Project management'),
('kanban', 'Kanban', 'Kanban board'),
('payments', 'Payments', 'Payment management'),
('recurring_services', 'Recurring Services', 'Recurring services management'),
('messages', 'Messages', 'Message system'),
('automation', 'Marketing Automation', 'Marketing automation'),
('calendar', 'Calendar', 'Calendar management'),
('documents', 'Documents', 'Document management'),
('employees', 'Employees', 'Employee management'),
('user_management', 'User Management', 'User account management'),
('settings', 'Settings', 'System settings'),
('front_sales_management', 'Front Sales Management', 'Front sales management'),
('my_dashboard', 'My Dashboard', 'Personal dashboard')
ON CONFLICT (name) DO NOTHING;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_module_id ON user_permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_name ON modules(name);

-- Enable RLS on new tables
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for modules (read-only for authenticated users)
CREATE POLICY "Authenticated users can read modules" ON modules
    FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policies for user_permissions
CREATE POLICY "Users can view own permissions" ON user_permissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all permissions" ON user_permissions
    FOR ALL USING (auth.role() = 'authenticated');

-- Function to create user permissions from role template
CREATE OR REPLACE FUNCTION create_user_permissions_from_template(
    p_user_id UUID,
    p_role_template JSONB
)
RETURNS VOID AS $$
DECLARE
    module_record RECORD;
    permission_record JSONB;
BEGIN
    -- Loop through each permission in the template
    FOR permission_record IN 
        SELECT value FROM jsonb_array_elements(p_role_template)
    LOOP
        -- Get module ID
        SELECT id INTO module_record FROM modules WHERE name = permission_record->>'module';
        
        IF module_record.id IS NOT NULL THEN
            -- Insert or update permission
            INSERT INTO user_permissions (
                user_id, 
                module_id, 
                can_create, 
                can_read, 
                can_update, 
                can_delete, 
                screen_visible
            ) VALUES (
                p_user_id,
                module_record.id,
                COALESCE((permission_record->>'can_create')::boolean, false),
                COALESCE((permission_record->>'can_read')::boolean, false),
                COALESCE((permission_record->>'can_update')::boolean, false),
                COALESCE((permission_record->>'can_delete')::boolean, false),
                COALESCE((permission_record->>'screen_visible')::boolean, false)
            ) ON CONFLICT (user_id, module_id) DO UPDATE SET
                can_create = EXCLUDED.can_create,
                can_read = EXCLUDED.can_read,
                can_update = EXCLUDED.can_update,
                can_delete = EXCLUDED.can_delete,
                screen_visible = EXCLUDED.screen_visible,
                updated_at = NOW();
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add updated_at trigger for user_permissions
CREATE TRIGGER update_user_permissions_updated_at
    BEFORE UPDATE ON user_permissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 
-- Quick Database Fix for User Management System
-- Run this in your Supabase SQL Editor

-- 1. Drop the problematic foreign key constraint temporarily
ALTER TABLE user_permissions 
DROP CONSTRAINT IF EXISTS user_permissions_user_id_fkey;

-- 2. Recreate the foreign key constraint with proper CASCADE
ALTER TABLE user_permissions 
ADD CONSTRAINT user_permissions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Ensure user_profiles table has proper structure
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS attributes JSONB DEFAULT '{}';

-- 4. Create modules table if it doesn't exist
CREATE TABLE IF NOT EXISTS modules (
    id SERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Create user_permissions table if it doesn't exist
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

-- 6. Insert default modules
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

-- 7. Create the permission function
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

-- 8. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_module_id ON user_permissions(module_id);
CREATE INDEX IF NOT EXISTS idx_modules_name ON modules(name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_employee_id ON user_profiles(employee_id);

-- 9. Enable RLS and create policies
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_permissions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Authenticated users can read modules" ON modules;
DROP POLICY IF EXISTS "Users can view own permissions" ON user_permissions;
DROP POLICY IF EXISTS "Admins can manage all permissions" ON user_permissions;

-- Create new policies
CREATE POLICY "Authenticated users can read modules" ON modules
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view own permissions" ON user_permissions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all permissions" ON user_permissions
    FOR ALL USING (auth.role() = 'authenticated');

-- Success message
SELECT 'Database fix completed successfully! User creation should now work.' as status; 
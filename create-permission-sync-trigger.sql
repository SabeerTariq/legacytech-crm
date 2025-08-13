-- =====================================================
-- PERMISSION SYNC TRIGGER
-- =====================================================
-- This trigger automatically syncs user permissions when role permissions are updated

-- Drop existing trigger and function if they exist
DROP TRIGGER IF EXISTS sync_user_permissions_on_role_change ON role_permissions;
DROP FUNCTION IF EXISTS sync_user_permissions_on_role_change();

-- Create the function to sync user permissions
CREATE OR REPLACE FUNCTION sync_user_permissions_on_role_change()
RETURNS TRIGGER AS $$
DECLARE
    user_record RECORD;
    module_record RECORD;
BEGIN
    -- If this is a DELETE operation, remove user permissions for this role-module combination
    IF TG_OP = 'DELETE' THEN
        -- Get all users with this role
        FOR user_record IN 
            SELECT user_id FROM user_roles WHERE role_id = OLD.role_id
        LOOP
            -- Get module ID
            SELECT id INTO module_record FROM modules WHERE name = OLD.module_name;
            
            -- Delete user permission for this user and module
            DELETE FROM user_permissions 
            WHERE user_id = user_record.user_id 
            AND module_id = module_record.id;
        END LOOP;
        
        RETURN OLD;
    END IF;

    -- For INSERT and UPDATE operations
    -- Get all users with this role
    FOR user_record IN 
        SELECT user_id FROM user_roles WHERE role_id = NEW.role_id
    LOOP
        -- Get module ID
        SELECT id INTO module_record FROM modules WHERE name = NEW.module_name;
        
        -- Check if user permission already exists
        IF EXISTS (
            SELECT 1 FROM user_permissions 
            WHERE user_id = user_record.user_id 
            AND module_id = module_record.id
        ) THEN
            -- Update existing user permission
            UPDATE user_permissions 
            SET 
                can_create = NEW.can_create,
                can_read = NEW.can_read,
                can_update = NEW.can_update,
                can_delete = NEW.can_delete,
                screen_visible = NEW.screen_visible,
                updated_at = NOW()
            WHERE user_id = user_record.user_id 
            AND module_id = module_record.id;
        ELSE
            -- Insert new user permission
            INSERT INTO user_permissions (
                user_id,
                module_id,
                can_create,
                can_read,
                can_update,
                can_delete,
                screen_visible,
                created_at,
                updated_at
            ) VALUES (
                user_record.user_id,
                module_record.id,
                NEW.can_create,
                NEW.can_read,
                NEW.can_update,
                NEW.can_delete,
                NEW.screen_visible,
                NOW(),
                NOW()
            );
        END IF;
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER sync_user_permissions_on_role_change
    AFTER INSERT OR UPDATE OR DELETE ON role_permissions
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_permissions_on_role_change();

-- Also create a trigger for when users are assigned to roles
DROP TRIGGER IF EXISTS sync_user_permissions_on_user_role_change ON user_roles;
DROP FUNCTION IF EXISTS sync_user_permissions_on_user_role_change();

-- Create function to sync when user-role assignments change
CREATE OR REPLACE FUNCTION sync_user_permissions_on_user_role_change()
RETURNS TRIGGER AS $$
DECLARE
    role_perm_record RECORD;
    module_record RECORD;
BEGIN
    -- If this is a DELETE operation, remove all user permissions for this user
    IF TG_OP = 'DELETE' THEN
        DELETE FROM user_permissions WHERE user_id = OLD.user_id;
        RETURN OLD;
    END IF;

    -- For INSERT operations, add all role permissions for this user
    IF TG_OP = 'INSERT' THEN
        -- Get all permissions for this role
        FOR role_perm_record IN 
            SELECT * FROM role_permissions WHERE role_id = NEW.role_id
        LOOP
            -- Get module ID
            SELECT id INTO module_record FROM modules WHERE name = role_perm_record.module_name;
            
            -- Insert user permission
            INSERT INTO user_permissions (
                user_id,
                module_id,
                can_create,
                can_read,
                can_update,
                can_delete,
                screen_visible,
                created_at,
                updated_at
            ) VALUES (
                NEW.user_id,
                module_record.id,
                role_perm_record.can_create,
                role_perm_record.can_read,
                role_perm_record.can_update,
                role_perm_record.can_delete,
                role_perm_record.screen_visible,
                NOW(),
                NOW()
            )
            ON CONFLICT (user_id, module_id) 
            DO UPDATE SET
                can_create = EXCLUDED.can_create,
                can_read = EXCLUDED.can_read,
                can_update = EXCLUDED.can_update,
                can_delete = EXCLUDED.can_delete,
                screen_visible = EXCLUDED.screen_visible,
                updated_at = NOW();
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for user-role changes
CREATE TRIGGER sync_user_permissions_on_user_role_change
    AFTER INSERT OR DELETE ON user_roles
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_permissions_on_user_role_change();

-- Verify triggers were created
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table, 
    action_statement
FROM information_schema.triggers 
WHERE trigger_name IN (
    'sync_user_permissions_on_role_change',
    'sync_user_permissions_on_user_role_change'
)
ORDER BY trigger_name;

-- Test the trigger by updating a role permission
-- This will automatically sync all users with that role
SELECT 'Triggers created successfully! Role permission changes will now automatically sync user permissions.' as status;
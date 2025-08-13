-- Add CASCADE DELETE constraints for tables referencing auth.users
-- This ensures that when a user is deleted, all related data is automatically cleaned up

-- 1. user_profiles table
ALTER TABLE user_profiles
DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

ALTER TABLE user_profiles
ADD CONSTRAINT user_profiles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 2. user_roles table
ALTER TABLE user_roles
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

ALTER TABLE user_roles
ADD CONSTRAINT user_roles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 3. user_permissions table
ALTER TABLE user_permissions
DROP CONSTRAINT IF EXISTS user_permissions_user_id_fkey;

ALTER TABLE user_permissions
ADD CONSTRAINT user_permissions_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 4. team_members table
ALTER TABLE team_members
DROP CONSTRAINT IF EXISTS team_members_user_id_fkey;

ALTER TABLE team_members
ADD CONSTRAINT team_members_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 5. front_seller_performance table
ALTER TABLE front_seller_performance
DROP CONSTRAINT IF EXISTS front_seller_performance_user_id_fkey;

ALTER TABLE front_seller_performance
ADD CONSTRAINT front_seller_performance_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 6. Check if any other tables reference auth.users and add constraints
-- This will help identify any missing foreign key relationships

-- Verify the constraints were created successfully
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule,
    rc.update_rule
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON tc.constraint_name = rc.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_schema = 'public'
    AND ccu.table_name = 'users'
ORDER BY tc.table_name; 
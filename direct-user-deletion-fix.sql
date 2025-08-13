-- Direct User Deletion Fix
-- This script creates the necessary functions and tests the deletion

-- 1. Create safe delete function
CREATE OR REPLACE FUNCTION safe_delete_user(user_email TEXT)
RETURNS TEXT AS $$
DECLARE
  auth_user_id UUID;
  deleted_count INTEGER;
BEGIN
  -- Get the auth user ID
  SELECT id INTO auth_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF auth_user_id IS NULL THEN
    RETURN 'User not found in auth.users';
  END IF;
  
  -- Delete from user_profiles first (if exists)
  DELETE FROM user_profiles WHERE user_id = auth_user_id;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Delete from auth.users
  DELETE FROM auth.users WHERE id = auth_user_id;
  
  RETURN format('User deleted successfully. Auth user: %s, Profiles deleted: %s', 
                CASE WHEN auth_user_id IS NOT NULL THEN 'YES' ELSE 'NO' END,
                deleted_count);
                
EXCEPTION WHEN OTHERS THEN
  RETURN 'Error deleting user: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Grant permissions
GRANT EXECUTE ON FUNCTION safe_delete_user(TEXT) TO authenticated;

-- 3. Test the deletion
SELECT '=== TESTING DELETION ===' as info;

-- Check if user exists before deletion
SELECT 
  'BEFORE DELETION' as status,
  COUNT(*) as auth_users_count
FROM auth.users 
WHERE email = 'shahbaz.khan@logicworks.com'

UNION ALL

SELECT 
  'BEFORE DELETION' as status,
  COUNT(*) as profiles_count
FROM user_profiles 
WHERE email = 'shahbaz.khan@logicworks.com';

-- Perform the deletion
SELECT safe_delete_user('shahbaz.khan@logicworks.com') as delete_result;

-- Check if user exists after deletion
SELECT 
  'AFTER DELETION' as status,
  COUNT(*) as auth_users_count
FROM auth.users 
WHERE email = 'shahbaz.khan@logicworks.com'

UNION ALL

SELECT 
  'AFTER DELETION' as status,
  COUNT(*) as profiles_count
FROM user_profiles 
WHERE email = 'shahbaz.khan@logicworks.com'; 
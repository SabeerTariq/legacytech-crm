-- Fix user creation issue by temporarily disabling the trigger

-- 1. Drop the problematic trigger
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;

-- 2. Drop the function
DROP FUNCTION IF EXISTS create_user_profile_trigger();

-- 3. Recreate the function with better error handling
CREATE OR REPLACE FUNCTION create_user_profile_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if it doesn't already exist
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE user_id = NEW.id) THEN
    INSERT INTO user_profiles (
      user_id, 
      email, 
      display_name, 
      is_active, 
      attributes
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
      true,
      jsonb_build_object(
        'role', 'user',
        'department', 'General',
        'is_admin', false,
        'is_super_admin', false,
        'permissions', '{}'::jsonb,
        'access_level', 'basic',
        'created_via', 'auth_trigger'
      )
    );
  END IF;
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate the trigger
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile_trigger(); 
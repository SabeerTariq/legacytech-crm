-- FIX: Update sync_user_profile function to handle existing emails
-- This migration updates the sync_user_profile function to prevent errors
-- when a user is created with an email that already exists in user_profiles.

CREATE OR REPLACE FUNCTION sync_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if a profile with the new user's email already exists
    IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE email = NEW.email) THEN
        -- If no profile with that email exists, create a new one
        INSERT INTO user_profiles (user_id, email, display_name)
        VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email))
        ON CONFLICT (user_id) DO UPDATE SET
            email = NEW.email,
            updated_at = NOW();
    ELSE
        -- If a profile with that email already exists, update it with the new user_id
        UPDATE user_profiles
        SET user_id = NEW.id,
            updated_at = NOW()
        WHERE email = NEW.email;
    END IF;

    -- Assign default employee role
    INSERT INTO user_roles (user_id, role_id)
    SELECT NEW.id, r.id
    FROM roles r
    WHERE r.name = 'employee'
    ON CONFLICT (user_id, role_id) DO NOTHING;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-apply the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION sync_user_profile(); 
-- Update Email Linking System Migration
-- This migration updates the system to use user management emails as the primary linking mechanism
-- between users and employees, instead of relying on email matching

-- Add a new column to employees table to store the user management email
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'user_management_email') THEN
        ALTER TABLE employees ADD COLUMN user_management_email TEXT;
    END IF;
END $$;

-- Add a new column to employees table to store the original email as personal_email
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'personal_email') THEN
        ALTER TABLE employees ADD COLUMN personal_email TEXT;
    END IF;
END $$;

-- Update employees table to move current email to personal_email and set user_management_email
UPDATE employees 
SET personal_email = email,
    user_management_email = NULL
WHERE personal_email IS NULL;

-- Create a function to generate user management emails for employees
CREATE OR REPLACE FUNCTION generate_employee_user_email(employee_full_name TEXT, employee_department TEXT)
RETURNS TEXT AS $$
DECLARE
    clean_name TEXT;
    dept_prefix TEXT;
    base_email TEXT;
    final_email TEXT;
    counter INTEGER := 1;
BEGIN
    -- Clean the name
    clean_name := lower(regexp_replace(employee_full_name, '[^a-zA-Z\s]', '', 'g'));
    clean_name := regexp_replace(trim(clean_name), '\s+', '.', 'g');
    
    -- Get department prefix (first 3 letters)
    dept_prefix := lower(substring(employee_department, 1, 3));
    
    -- Generate base email
    base_email := clean_name || '.' || dept_prefix || '@logicworks.com';
    final_email := base_email;
    
    -- Check for uniqueness and add counter if needed
    WHILE EXISTS (SELECT 1 FROM user_profiles WHERE email = final_email) OR
          EXISTS (SELECT 1 FROM employees WHERE user_management_email = final_email) LOOP
        final_email := regexp_replace(base_email, '@', counter || '@');
        counter := counter + 1;
    END LOOP;
    
    RETURN final_email;
END;
$$ LANGUAGE plpgsql;

-- Create a function to sync employee user management emails
CREATE OR REPLACE FUNCTION sync_employee_user_emails()
RETURNS VOID AS $$
DECLARE
    emp RECORD;
    user_email TEXT;
BEGIN
    FOR emp IN SELECT id, full_name, department FROM employees WHERE user_management_email IS NULL LOOP
        -- Generate user management email
        user_email := generate_employee_user_email(emp.full_name, emp.department);
        
        -- Update employee with user management email
        UPDATE employees 
        SET user_management_email = user_email
        WHERE id = emp.id;
        
        RAISE NOTICE 'Generated user management email for %: %', emp.full_name, user_email;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Execute the sync function to generate user management emails for all employees
SELECT sync_employee_user_emails();

-- Update the user creation process to use employee_id linking
-- This function will be called when creating users through the admin interface
CREATE OR REPLACE FUNCTION create_user_with_employee_link(
    p_employee_id UUID,
    p_password TEXT,
    p_permissions JSONB DEFAULT '[]'::JSONB
)
RETURNS JSONB AS $$
DECLARE
    emp RECORD;
    user_email TEXT;
    auth_user_id UUID;
    profile_id UUID;
    result JSONB;
BEGIN
    -- Get employee data
    SELECT * INTO emp FROM employees WHERE id = p_employee_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Employee not found with ID: %', p_employee_id;
    END IF;
    
    -- Generate or get user management email
    IF emp.user_management_email IS NULL THEN
        user_email := generate_employee_user_email(emp.full_name, emp.department);
        UPDATE employees SET user_management_email = user_email WHERE id = p_employee_id;
    ELSE
        user_email := emp.user_management_email;
    END IF;
    
    -- Create auth user (this would be done through the API, but we'll prepare the data)
    -- Note: Actual auth user creation should be done through Supabase Auth API
    
    -- Create user profile
    INSERT INTO user_profiles (user_id, employee_id, email, display_name, is_active)
    VALUES (auth_user_id, p_employee_id, user_email, emp.full_name, true)
    RETURNING id INTO profile_id;
    
    -- Return the result
    result := jsonb_build_object(
        'success', true,
        'employee_id', p_employee_id,
        'user_management_email', user_email,
        'personal_email', emp.personal_email,
        'employee_name', emp.full_name,
        'department', emp.department
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Create a view to show the email linking status
CREATE OR REPLACE VIEW employee_user_linking_status AS
SELECT 
    e.id as employee_id,
    e.full_name as employee_name,
    e.personal_email as original_email,
    e.user_management_email as system_email,
    e.department,
    up.user_id as auth_user_id,
    up.email as profile_email,
    CASE 
        WHEN up.user_id IS NOT NULL THEN 'LINKED'
        WHEN e.user_management_email IS NOT NULL THEN 'READY_FOR_LINKING'
        ELSE 'NEEDS_EMAIL_GENERATION'
    END as linking_status
FROM employees e
LEFT JOIN user_profiles up ON up.employee_id = e.id
ORDER BY e.full_name;

-- Show the current linking status
SELECT 'Current Employee-User Linking Status:' as info;
SELECT * FROM employee_user_linking_status WHERE department = 'Front Sales';

-- Update the team performance function to use the new linking system
DROP FUNCTION IF EXISTS get_team_performance_summary(p_month DATE);

CREATE OR REPLACE FUNCTION get_team_performance_summary(p_month DATE)
RETURNS TABLE (
  seller_id UUID,
  seller_name TEXT,
  accounts_achieved INTEGER,
  total_gross NUMERIC,
  total_cash_in NUMERIC,
  total_remaining NUMERIC,
  performance_rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fsp.seller_id,
    COALESCE(e.full_name, up.display_name, 'Unknown User') as seller_name,
    fsp.accounts_achieved,
    fsp.total_gross,
    fsp.total_cash_in,
    fsp.total_remaining,
    ROW_NUMBER() OVER (ORDER BY fsp.accounts_achieved DESC, fsp.total_gross DESC) as performance_rank
  FROM front_seller_performance fsp
  -- Join with user_profiles to get the user management email (primary linking)
  LEFT JOIN user_profiles up ON up.user_id = fsp.seller_id
  -- Join with employees using the employee_id link
  LEFT JOIN employees e ON e.id = up.employee_id
  -- Only include performance data for the specified month
  WHERE fsp.month = p_month
  -- Only include employees who are in Front Sales teams or have sales-related emails
  AND (e.department = 'Front Sales' OR up.email LIKE '%.sal@logicworks.com' OR up.email LIKE '%.fro@logicworks.com')
  -- Order by performance
  ORDER BY fsp.accounts_achieved DESC, fsp.total_gross DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the updated function
SELECT 'Testing updated team performance function with new email linking system...' as status;

-- Check what the function returns for current month
SELECT 
  'Function result for current month:' as info,
  seller_id,
  seller_name,
  accounts_achieved,
  total_gross,
  performance_rank
FROM get_team_performance_summary(DATE_TRUNC('month', CURRENT_DATE)::DATE); 
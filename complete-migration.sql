-- Complete Database Migration for New Email Linking System
-- Apply this through Supabase Dashboard SQL Editor

-- Step 1: Add new columns to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_management_email TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS personal_email TEXT;

-- Step 2: Move existing emails to personal_email
UPDATE employees 
SET personal_email = email, user_management_email = NULL 
WHERE personal_email IS NULL;

-- Step 3: Create email generation function
CREATE OR REPLACE FUNCTION generate_employee_user_email(employee_full_name TEXT, employee_department TEXT)
RETURNS TEXT AS $$
DECLARE
  clean_name TEXT;
  dept_prefix TEXT;
  base_email TEXT;
  final_email TEXT;
  counter INTEGER := 1;
BEGIN
  -- Clean the employee name
  clean_name := LOWER(REGEXP_REPLACE(employee_full_name, '[^a-zA-Z0-9\\s]', '', 'g'));
  clean_name := REGEXP_REPLACE(TRIM(clean_name), '\\s+', '.', 'g');
  
  -- Get department prefix (first 3 letters)
  dept_prefix := LOWER(SUBSTRING(employee_department FROM 1 FOR 3));
  
  -- Create base email
  base_email := clean_name || '.' || dept_prefix || '@logicworks.com';
  
  -- Check for uniqueness and add number if needed
  final_email := base_email;
  
  WHILE EXISTS (
    SELECT 1 FROM employees 
    WHERE user_management_email = final_email
  ) LOOP
    final_email := clean_name || '.' || dept_prefix || counter || '@logicworks.com';
    counter := counter + 1;
  END LOOP;
  
  RETURN final_email;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create sync function
CREATE OR REPLACE FUNCTION sync_employee_user_emails()
RETURNS VOID AS $$
DECLARE
  emp_record RECORD;
BEGIN
  FOR emp_record IN 
    SELECT id, full_name, department 
    FROM employees 
    WHERE user_management_email IS NULL
  LOOP
    UPDATE employees 
    SET user_management_email = generate_employee_user_email(emp_record.full_name, emp_record.department)
    WHERE id = emp_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Step 5: Create linking status view
CREATE OR REPLACE VIEW employee_user_linking_status AS
SELECT 
  e.id as employee_id,
  e.full_name as employee_name,
  e.email as original_email,
  e.personal_email,
  e.user_management_email as system_email,
  e.department,
  up.user_id as profile_user_id,
  up.email as profile_email,
  CASE 
    WHEN up.user_id IS NOT NULL THEN 'LINKED'
    WHEN e.user_management_email IS NOT NULL THEN 'NEEDS_ACCOUNT_CREATION'
    ELSE 'NEEDS_EMAIL_GENERATION'
  END as linking_status
FROM employees e
LEFT JOIN user_profiles up ON up.employee_id = e.id
ORDER BY e.full_name;

-- Step 6: Fix team performance function (resolve overloading)
-- Drop all existing versions
DROP FUNCTION IF EXISTS get_team_performance_summary(p_month DATE) CASCADE;
DROP FUNCTION IF EXISTS get_team_performance_summary(p_month TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_team_performance_summary(p_month TIMESTAMP) CASCADE;

-- Create clean version with new email linking system
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
  LEFT JOIN user_profiles up ON up.user_id = fsp.seller_id
  LEFT JOIN employees e ON e.id = up.employee_id
  WHERE fsp.month = p_month
  AND (e.department = 'Front Sales' OR up.email LIKE '%.sal@logicworks.com' OR up.email LIKE '%.fro@logicworks.com')
  ORDER BY fsp.accounts_achieved DESC, fsp.total_gross DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Generate emails for all Front Sales employees
UPDATE employees 
SET user_management_email = generate_employee_user_email(full_name, department)
WHERE department = 'Front Sales' AND user_management_email IS NULL;

-- Step 8: Verification queries
-- Check the migration results
SELECT 
  'Migration Results:' as info,
  COUNT(*) as total_employees,
  COUNT(CASE WHEN user_management_email IS NOT NULL THEN 1 END) as with_emails,
  COUNT(CASE WHEN user_management_email IS NULL THEN 1 END) as without_emails
FROM employees 
WHERE department = 'Front Sales';

-- Show sample generated emails
SELECT 
  'Sample Generated Emails:' as info,
  full_name,
  email as original_email,
  personal_email,
  user_management_email
FROM employees 
WHERE department = 'Front Sales' 
AND user_management_email IS NOT NULL
ORDER BY full_name
LIMIT 5;

-- Test the team performance function
SELECT 
  'Team Performance Function Test:' as info,
  seller_name,
  accounts_achieved,
  total_gross,
  performance_rank
FROM get_team_performance_summary(DATE_TRUNC('month', CURRENT_DATE)::DATE)
LIMIT 3; 
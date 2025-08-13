-- Fix Function Overloading Issue
-- This script resolves the conflict between multiple versions of get_team_performance_summary function

-- Drop all existing versions of the function to resolve overloading
DROP FUNCTION IF EXISTS get_team_performance_summary(p_month DATE) CASCADE;
DROP FUNCTION IF EXISTS get_team_performance_summary(p_month TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_team_performance_summary(p_month TIMESTAMP) CASCADE;

-- Create a clean version of the function with the new email linking system
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

-- Test the function to ensure it works
SELECT 'Testing fixed team performance function...' as status;

-- Check what the function returns for current month
SELECT 
  'Function result for current month:' as info,
  seller_id,
  seller_name,
  accounts_achieved,
  total_gross,
  performance_rank
FROM get_team_performance_summary(DATE_TRUNC('month', CURRENT_DATE)::DATE);

-- Show the function signature to confirm it's correct
SELECT 
  'Function signature:' as info,
  p.proname as function_name,
  pg_get_function_arguments(p.oid) as arguments,
  pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname = 'get_team_performance_summary';

-- Show the updated mapping using user management emails
SELECT 
  'User Management Email Linking:' as info,
  up.user_id as auth_user_id,
  up.email as user_management_email,
  up.employee_id as linked_employee_id,
  e.full_name as employee_name,
  e.email as employee_original_email,
  e.department
FROM user_profiles up
LEFT JOIN employees e ON e.id = up.employee_id
WHERE e.department = 'Front Sales' OR up.email LIKE '%.sal@logicworks.com' OR up.email LIKE '%.fro@logicworks.com'
ORDER BY e.full_name;

-- Show team members with their user management emails
SELECT 
  'Team Members with User Management Emails:' as info,
  tm.member_id as employee_id,
  e.full_name as employee_name,
  e.email as employee_original_email,
  up.user_id as auth_user_id,
  up.email as user_management_email,
  t.name as team_name,
  tm.role
FROM team_members tm
JOIN employees e ON e.id = tm.member_id
JOIN teams t ON t.id = tm.team_id
LEFT JOIN user_profiles up ON up.employee_id = e.id
WHERE t.department = 'Front Sales'
ORDER BY t.name, e.full_name;

-- Show employees who need user management accounts
SELECT 
  'Employees Needing User Management Accounts:' as info,
  e.id as employee_id,
  e.full_name as employee_name,
  e.email as employee_original_email,
  e.department,
  CASE 
    WHEN up.user_id IS NOT NULL THEN 'HAS ACCOUNT'
    ELSE 'NEEDS ACCOUNT'
  END as account_status
FROM employees e
LEFT JOIN user_profiles up ON up.employee_id = e.id
WHERE e.department = 'Front Sales'
ORDER BY e.full_name; 
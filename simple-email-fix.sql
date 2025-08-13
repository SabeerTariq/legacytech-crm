-- Simple fix for Shahbaz Khan's email mismatch
-- This will allow his performance data to show up in the team dashboard

-- Fix Shahbaz Khan's email to match his user profile
UPDATE employees 
SET email = 'shahbaz.khan@logicworks.com'
WHERE full_name = 'Shahbaz khan' 
AND email = 'shahbazyouknow@gmail.com';

-- Update the team performance function to work with the fixed email
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
    COALESCE(e.full_name, 'Unknown User') as seller_name,
    fsp.accounts_achieved,
    fsp.total_gross,
    fsp.total_cash_in,
    fsp.total_remaining,
    ROW_NUMBER() OVER (ORDER BY fsp.accounts_achieved DESC, fsp.total_gross DESC) as performance_rank
  FROM front_seller_performance fsp
  -- Join with user_profiles to get the email
  LEFT JOIN user_profiles up ON up.user_id = fsp.seller_id
  -- Join with employees to get the employee details
  LEFT JOIN employees e ON e.email = up.email
  -- Only include performance data for the specified month
  WHERE fsp.month = p_month
  -- Only include employees who are in Front Sales teams
  AND e.department = 'Front Sales'
  -- Order by performance
  ORDER BY fsp.accounts_achieved DESC, fsp.total_gross DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the fix
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

-- Verify Shahbaz Khan's email was updated
SELECT 
  'Shahbaz Khan email check:' as info,
  full_name,
  email,
  department
FROM employees 
WHERE full_name = 'Shahbaz khan';

-- Show the mapping that should now work
SELECT 
  'Auth User to Employee Mapping:' as info,
  up.user_id as auth_user_id,
  up.email as profile_email,
  e.id as employee_id,
  e.full_name as employee_name,
  e.email as employee_email
FROM user_profiles up
LEFT JOIN employees e ON e.email = up.email
WHERE e.department = 'Front Sales' OR up.email LIKE '%logicworks%'
ORDER BY e.full_name; 
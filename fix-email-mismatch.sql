-- Fix email mismatches between employees and user profiles
-- This will allow the team performance function to work correctly

-- First, let's see what we're working with
SELECT 'Current Email Mismatches:' as info;

SELECT 
  'Employee vs Profile Email Check:' as check_type,
  e.full_name as employee_name,
  e.email as employee_email,
  up.email as profile_email,
  CASE 
    WHEN up.email IS NULL THEN 'NO PROFILE'
    WHEN e.email = up.email THEN 'MATCH'
    ELSE 'MISMATCH'
  END as status
FROM employees e
LEFT JOIN user_profiles up ON up.email = e.email
WHERE e.department = 'Front Sales'
ORDER BY e.full_name;

-- Fix Shahbaz Khan's email to match his profile
UPDATE employees 
SET email = 'shahbaz.khan@logicworks.com'
WHERE full_name = 'Shahbaz khan' 
AND email = 'shahbazyouknow@gmail.com';

-- Create user profiles for employees who don't have them
-- We'll create profiles with the same email as the employee

-- For employees without profiles, we need to create auth users first
-- But since we can't create auth users via SQL, we'll update the team performance function
-- to handle cases where there's no profile

-- Update the team performance function to be more flexible
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
  -- Join with employees to get the employee details (more flexible matching)
  LEFT JOIN employees e ON (
    e.email = up.email OR 
    e.email = fsp.seller_id::text OR 
    e.id = fsp.seller_id
  )
  -- Only include performance data for the specified month
  WHERE fsp.month = p_month
  -- Only include employees who are in Front Sales teams (if we can find them)
  AND (e.department = 'Front Sales' OR e.department IS NULL)
  -- Order by performance
  ORDER BY fsp.accounts_achieved DESC, fsp.total_gross DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the updated function
SELECT 'Testing updated team performance function...' as status;

-- Check what the function returns for current month
SELECT 
  'Function result for current month:' as info,
  seller_id,
  seller_name,
  accounts_achieved,
  total_gross,
  performance_rank
FROM get_team_performance_summary(DATE_TRUNC('month', CURRENT_DATE)::DATE);

-- Show the updated mapping
SELECT 
  'Updated Auth User to Employee Mapping:' as info,
  up.user_id as auth_user_id,
  up.email as profile_email,
  e.id as employee_id,
  e.full_name as employee_name,
  e.email as employee_email,
  e.department
FROM user_profiles up
LEFT JOIN employees e ON e.email = up.email
WHERE e.department = 'Front Sales' OR up.email LIKE '%logicworks%'
ORDER BY e.full_name;

-- Show team members with their auth user IDs (after fix)
SELECT 
  'Updated Team Members with Auth User IDs:' as info,
  tm.member_id as employee_id,
  e.full_name as employee_name,
  e.email as employee_email,
  up.user_id as auth_user_id,
  up.email as profile_email,
  t.name as team_name,
  tm.role
FROM team_members tm
JOIN employees e ON e.id = tm.member_id
JOIN teams t ON t.id = tm.team_id
LEFT JOIN user_profiles up ON up.email = e.email
WHERE t.department = 'Front Sales'
ORDER BY t.name, e.full_name; 
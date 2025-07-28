-- =====================================================
-- DEBUG get_front_sales_agents FUNCTION
-- =====================================================

-- 1. Check the leads table structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'leads' 
ORDER BY ordinal_position;

-- 2. Check what the function is actually doing
-- Let's break down the function step by step

-- Step 1: Get profiles
SELECT id, full_name, username, role 
FROM profiles 
LIMIT 5;

-- Step 2: Get employees with Front Sales department
SELECT full_name, email, department, work_module 
FROM employees 
WHERE department = 'Front Sales' 
LIMIT 5;

-- Step 3: Test the email matching logic
SELECT 
    p.id,
    p.full_name,
    p.username,
    p.username || '@example.com' as constructed_email,
    e.email as actual_email,
    CASE WHEN p.username || '@example.com' = e.email THEN 'MATCH' ELSE 'NO MATCH' END as match_status
FROM profiles p
INNER JOIN employees e ON e.email = p.username || '@example.com'
WHERE e.department = 'Front Sales'
LIMIT 10;

-- Step 4: Check the materialized view
SELECT * FROM lead_assignment_stats LIMIT 5;

-- Step 5: Test the complete function logic
SELECT 
    p.id,
    p.full_name,
    p.username || '@example.com' as email,
    e.department,
    e.job_title,
    COALESCE(las.total_leads, 0) as current_leads_count,
    CASE 
        WHEN las.total_leads = 0 THEN 100
        WHEN las.total_leads <= 5 THEN 90
        WHEN las.total_leads <= 10 THEN 80
        WHEN las.total_leads <= 15 THEN 70
        ELSE 60
    END as performance_score
FROM profiles p
INNER JOIN employees e ON e.email = p.username || '@example.com'
LEFT JOIN lead_assignment_stats las ON las.profile_id = p.id
WHERE e.department = 'Front Sales'
AND e.work_module = 'On-Site'
ORDER BY las.total_leads ASC, p.full_name;

-- 6. Check if there are any leads at all
SELECT COUNT(*) as total_leads FROM leads;

-- 7. Check lead statuses
SELECT DISTINCT status, COUNT(*) as count 
FROM leads 
GROUP BY status 
ORDER BY status; 
-- Fix Target Date Format Issue
-- This script checks and fixes the date format mismatch between target setting and fetching

-- 1. First, let's check what user IDs exist in the employees table
SELECT 
    'Available employee IDs:' as info,
    id,
    email,
    first_name,
    last_name,
    department
FROM employees
ORDER BY created_at DESC;

-- 2. Check current targets in the database
SELECT 
    'Current targets in database:' as info,
    seller_id,
    month,
    target_accounts,
    target_gross,
    target_cash_in,
    created_at
FROM front_seller_targets
ORDER BY month DESC, created_at DESC;

-- 3. Check what the dashboard is looking for (current month format)
SELECT 
    'Dashboard looking for:' as info,
    DATE_TRUNC('month', CURRENT_DATE)::DATE as current_month_date,
    TO_CHAR(DATE_TRUNC('month', CURRENT_DATE), 'YYYY-MM-DD') as current_month_string;

-- 4. Check if there's a target for any employee and current month
SELECT 
    'Targets for current month:' as info,
    seller_id,
    month,
    target_accounts,
    target_gross,
    target_cash_in
FROM front_seller_targets
WHERE month = DATE_TRUNC('month', CURRENT_DATE)::DATE;

-- 5. If no target exists, create a sample target for the first available employee
-- (Replace the UUID below with an actual employee ID from step 1)
INSERT INTO front_seller_targets (
    seller_id,
    month,
    target_accounts,
    target_gross,
    target_cash_in,
    created_at,
    updated_at
) 
SELECT 
    e.id,  -- Use the first available employee ID
    DATE_TRUNC('month', CURRENT_DATE)::DATE,
    10,  -- Target accounts
    50000,  -- Target gross
    40000,  -- Target cash in
    NOW(),
    NOW()
FROM employees e
WHERE e.department = 'Front Sales'
LIMIT 1
ON CONFLICT (seller_id, month) DO NOTHING;

-- 6. Verify the target was created
SELECT 
    'Target created/verified:' as info,
    seller_id,
    month,
    target_accounts,
    target_gross,
    target_cash_in
FROM front_seller_targets
WHERE month = DATE_TRUNC('month', CURRENT_DATE)::DATE; 
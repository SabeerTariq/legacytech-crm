-- Quick Fix: Disable RLS on leads table
-- This will allow all users to see all leads

-- 1. Disable RLS on the leads table
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- 2. Verify RLS is disabled
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'leads';

-- 3. Test query to verify access
SELECT 
    'RLS Disabled Test' as test_type,
    COUNT(*) as total_leads,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_user_leads,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as assigned_leads
FROM leads;

-- 4. Show sample leads to confirm access
SELECT 
    id,
    client_name,
    status,
    user_id,
    created_at
FROM leads 
LIMIT 5; 
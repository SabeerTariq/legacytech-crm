-- Fix Row Level Security (RLS) for leads table
-- This script will allow users to see all leads, not just their own

-- 1. First, let's check current RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'leads';

-- 2. Drop existing RLS policies on leads table
DROP POLICY IF EXISTS "Users can view their own leads" ON leads;
DROP POLICY IF EXISTS "Users can insert their own leads" ON leads;
DROP POLICY IF EXISTS "Users can update their own leads" ON leads;
DROP POLICY IF EXISTS "Users can delete their own leads" ON leads;

-- 3. Create new RLS policies that allow proper access

-- Policy for viewing leads - allow authenticated users to see all leads
CREATE POLICY "Authenticated users can view all leads" ON leads
    FOR SELECT
    TO authenticated
    USING (true);

-- Policy for inserting leads - allow authenticated users to insert leads
CREATE POLICY "Authenticated users can insert leads" ON leads
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy for updating leads - allow users to update their own leads or leads with null user_id
CREATE POLICY "Users can update leads" ON leads
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL)
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy for deleting leads - allow users to delete their own leads or leads with null user_id
CREATE POLICY "Users can delete leads" ON leads
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id OR user_id IS NULL);

-- 4. Alternative: If you want to disable RLS entirely for leads (not recommended for production)
-- ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- 5. Verify the policies are created
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'leads';

-- 6. Test query to verify access
SELECT 
    'RLS Test' as test_type,
    COUNT(*) as total_leads,
    COUNT(CASE WHEN user_id IS NULL THEN 1 END) as null_user_leads,
    COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as assigned_leads
FROM leads; 
-- =====================================================
-- DATABASE OPTIMIZATION SCRIPT FOR LOGICWORKS CRM
-- Execute this in your Supabase SQL Editor
-- =====================================================

-- 1. CRITICAL INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for leads table - most critical for lead assignment
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to_id ON leads (assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status_assigned ON leads (status, assigned_to_id);

-- Index for employees table - department filtering
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees (department);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees (email);
CREATE INDEX IF NOT EXISTS idx_employees_work_module ON employees (work_module);
CREATE INDEX IF NOT EXISTS idx_employees_dept_module ON employees (department, work_module);

-- Index for profiles table - role and user lookups
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles (username);
CREATE INDEX IF NOT EXISTS idx_profiles_full_name ON profiles (full_name);

-- 2. FOREIGN KEY IMPROVEMENTS
-- =====================================================

-- Add foreign key constraint for lead assignment (with proper error handling)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_leads_assigned_to' 
        AND table_name = 'leads'
    ) THEN
        ALTER TABLE leads ADD CONSTRAINT fk_leads_assigned_to 
        FOREIGN KEY (assigned_to_id) REFERENCES profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Add profile_id column to employees for direct linking
ALTER TABLE employees ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES profiles(id);

-- 3. DATA INTEGRITY IMPROVEMENTS
-- =====================================================

-- First, fix any invalid lead statuses before adding constraints
-- Update any invalid statuses to valid ones
UPDATE leads SET status = 'new' WHERE status IS NULL OR status = '';
UPDATE leads SET status = 'contacted' WHERE status IN ('contact', 'calling', 'called');
UPDATE leads SET status = 'qualified' WHERE status IN ('qualify', 'qualified_lead', 'hot_lead');
UPDATE leads SET status = 'converted' WHERE status IN ('sale', 'sold', 'won', 'closed_won');
UPDATE leads SET status = 'lost' WHERE status IN ('rejected', 'closed_lost', 'dead');

-- If there are still invalid statuses, update them to 'new'
UPDATE leads SET status = 'new' 
WHERE status NOT IN ('new', 'contacted', 'qualified', 'converted', 'lost');

-- Add check constraints for data validation (with proper error handling)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_leads_status' 
        AND table_name = 'leads'
    ) THEN
        ALTER TABLE leads ADD CONSTRAINT chk_leads_status 
        CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost'));
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_profiles_role' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE profiles ADD CONSTRAINT chk_profiles_role 
        CHECK (role IN ('user', 'front_seller', 'manager', 'employee', 'assistant', 'lead_generator', 'specialist', 'junior'));
    END IF;
END $$;

-- 4. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- 5. CREATE MATERIALIZED VIEW FOR LEAD ASSIGNMENT STATS
-- =====================================================

CREATE MATERIALIZED VIEW IF NOT EXISTS lead_assignment_stats AS
SELECT 
    p.id as profile_id,
    p.full_name,
    p.role,
    e.department,
    COUNT(l.id) as total_leads,
    COUNT(CASE WHEN l.status = 'new' THEN 1 END) as new_leads,
    COUNT(CASE WHEN l.status = 'contacted' THEN 1 END) as contacted_leads,
    COUNT(CASE WHEN l.status = 'qualified' THEN 1 END) as qualified_leads,
    AVG(EXTRACT(EPOCH FROM (l.updated_at - l.created_at))/86400) as avg_lead_age_days
FROM profiles p
LEFT JOIN employees e ON e.email = p.username || '@example.com'
LEFT JOIN leads l ON l.assigned_to_id = p.id
WHERE e.department = 'Front Sales'
GROUP BY p.id, p.full_name, p.role, e.department;

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_lead_stats_profile ON lead_assignment_stats (profile_id);

-- 6. CREATE OPTIMIZED DATABASE FUNCTIONS
-- =====================================================

-- Function to get Front Sales agents with performance metrics
CREATE OR REPLACE FUNCTION get_front_sales_agents()
RETURNS TABLE (
    profile_id UUID,
    full_name TEXT,
    email TEXT,
    department TEXT,
    job_title TEXT,
    current_leads_count BIGINT,
    performance_score INTEGER
) AS $$
BEGIN
    RETURN QUERY
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign lead to agent with validation
CREATE OR REPLACE FUNCTION assign_lead_to_agent(
    lead_id UUID,
    agent_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    agent_dept TEXT;
BEGIN
    -- Check if agent is from Front Sales department
    SELECT department INTO agent_dept
    FROM employees e
    INNER JOIN profiles p ON e.email = p.username || '@example.com'
    WHERE p.id = agent_id;
    
    IF agent_dept != 'Front Sales' THEN
        RAISE EXCEPTION 'Agent must be from Front Sales department';
    END IF;
    
    -- Update the lead
    UPDATE leads 
    SET assigned_to_id = agent_id, 
        updated_at = NOW()
    WHERE id = lead_id;
    
    -- Refresh materialized view
    REFRESH MATERIALIZED VIEW lead_assignment_stats;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. CREATE AUDIT LOG TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID DEFAULT auth.uid()
);

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log (action);

-- 8. CREATE ANALYTICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW lead_performance_analytics AS
SELECT 
    p.id as agent_id,
    p.full_name as agent_name,
    e.department,
    COUNT(l.id) as total_leads,
    COUNT(CASE WHEN l.status = 'converted' THEN 1 END) as converted_leads,
    COUNT(CASE WHEN l.status = 'lost' THEN 1 END) as lost_leads,
    ROUND(
        COUNT(CASE WHEN l.status = 'converted' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(l.id), 0) * 100, 2
    ) as conversion_rate,
    AVG(EXTRACT(EPOCH FROM (l.updated_at - l.created_at))/86400) as avg_lead_age_days
FROM profiles p
LEFT JOIN employees e ON e.email = p.username || '@example.com'
LEFT JOIN leads l ON l.assigned_to_id = p.id
WHERE e.department = 'Front Sales'
GROUP BY p.id, p.full_name, e.department;

-- 9. GRANT PERMISSIONS
-- =====================================================

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_front_sales_agents() TO authenticated;
GRANT EXECUTE ON FUNCTION assign_lead_to_agent(UUID, UUID) TO authenticated;

-- Grant select permissions on views
GRANT SELECT ON lead_assignment_stats TO authenticated;
GRANT SELECT ON lead_performance_analytics TO authenticated;

-- Grant permissions on audit log
GRANT INSERT ON audit_log TO authenticated;
GRANT SELECT ON audit_log TO authenticated;

-- 10. TEST THE OPTIMIZATION
-- =====================================================

-- Test the function
SELECT * FROM get_front_sales_agents();

-- Show the analytics
SELECT * FROM lead_performance_analytics;

-- Show the materialized view
SELECT * FROM lead_assignment_stats;

-- =====================================================
-- OPTIMIZATION COMPLETE!
-- ===================================================== 
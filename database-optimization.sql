-- =====================================================
-- DATABASE OPTIMIZATION SCRIPT FOR LOGICWORKS CRM
-- Based on Supabase Best Practices
-- =====================================================

-- 1. CRITICAL INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for leads table - most critical for lead assignment
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to_id ON leads (assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at);
CREATE INDEX IF NOT EXISTS idx_leads_department ON leads (department);

-- Index for employees table - department filtering
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees (department);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees (email);
CREATE INDEX IF NOT EXISTS idx_employees_work_module ON employees (work_module);

-- Index for user_profiles table - role and username filtering
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles (role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles (username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_full_name ON user_profiles (full_name);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_leads_status_assigned ON leads (status, assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_employees_dept_module ON employees (department, work_module);

-- 2. FOREIGN KEY IMPROVEMENTS
-- =====================================================

-- Add proper foreign key constraint for leads.assigned_to_id
-- This ensures data integrity between leads and user_profiles
ALTER TABLE leads 
ADD CONSTRAINT IF NOT EXISTS fk_leads_assigned_to 
FOREIGN KEY (assigned_to_id) REFERENCES user_profiles(id) 
ON DELETE SET NULL;

-- Add foreign key for employees to user_profiles (if not exists)
-- This creates a proper relationship between employees and users
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS profile_id UUID REFERENCES user_profiles(id);

-- 3. PERFORMANCE OPTIMIZATIONS
-- =====================================================

-- Create a materialized view for lead assignment statistics
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
FROM user_profiles p
LEFT JOIN employees e ON e.email = p.username || '@example.com'
LEFT JOIN leads l ON l.assigned_to_id = p.id
WHERE e.department = 'Front Sales'
GROUP BY p.id, p.full_name, p.role, e.department;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_lead_stats_profile ON lead_assignment_stats (profile_id);

-- 4. DATA INTEGRITY IMPROVEMENTS
-- =====================================================

-- Add check constraints for data validation
ALTER TABLE leads 
ADD CONSTRAINT IF NOT EXISTS chk_leads_status 
CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost'));

ALTER TABLE user_profiles 
ADD CONSTRAINT IF NOT EXISTS chk_user_profiles_role 
CHECK (role IN ('user', 'front_seller', 'manager', 'employee', 'assistant', 'lead_generator', 'specialist', 'junior'));

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on critical tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Policy for leads - users can only see leads assigned to them or unassigned leads
CREATE POLICY IF NOT EXISTS "Users can view assigned and unassigned leads" ON leads
    FOR SELECT USING (
        assigned_to_id = auth.uid() OR 
        assigned_to_id IS NULL OR
        auth.uid() IN (
            SELECT id FROM user_profiles WHERE role IN ('manager', 'admin')
        )
    );

-- Policy for user_profiles - users can view their own profile and team members
CREATE POLICY IF NOT EXISTS "Users can view team user_profiles" ON user_profiles
    FOR SELECT USING (
        id = auth.uid() OR
        auth.uid() IN (
            SELECT id FROM user_profiles WHERE role IN ('manager', 'admin')
        )
    );

-- 6. FUNCTIONS FOR COMMON OPERATIONS
-- =====================================================

-- Function to get available front sales agents with lead counts
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
    FROM user_profiles p
    INNER JOIN employees e ON e.email = p.username || '@example.com'
    LEFT JOIN lead_assignment_stats las ON las.profile_id = p.id
    WHERE e.department = 'Front Sales'
    AND e.work_module = 'On-Site'
    ORDER BY las.total_leads ASC, p.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to assign lead with validation
CREATE OR REPLACE FUNCTION assign_lead_to_agent(
    lead_id UUID,
    agent_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    agent_dept TEXT;
    lead_dept TEXT;
BEGIN
    -- Check if agent is from Front Sales department
    SELECT department INTO agent_dept
    FROM employees e
    INNER JOIN user_profiles p ON e.email = p.username || '@example.com'
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

-- 7. TRIGGERS FOR AUTOMATIC UPDATES
-- =====================================================

-- Trigger to refresh materialized view when leads are updated
CREATE OR REPLACE FUNCTION refresh_lead_stats()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW lead_assignment_stats;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_refresh_lead_stats
    AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH STATEMENT
    EXECUTE FUNCTION refresh_lead_stats();

-- 8. ANALYTICS VIEWS
-- =====================================================

-- View for lead performance analytics
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
FROM user_profiles p
LEFT JOIN employees e ON e.email = p.username || '@example.com'
LEFT JOIN leads l ON l.assigned_to_id = p.id
WHERE e.department = 'Front Sales'
GROUP BY p.id, p.full_name, e.department;

-- 9. CLEANUP AND MAINTENANCE
-- =====================================================

-- Create a function to clean up orphaned data
CREATE OR REPLACE FUNCTION cleanup_orphaned_data()
RETURNS VOID AS $$
BEGIN
    -- Remove leads assigned to non-existent profiles
    UPDATE leads 
    SET assigned_to_id = NULL 
    WHERE assigned_to_id NOT IN (SELECT id FROM user_profiles);
    
    -- Log cleanup activity
    INSERT INTO audit_log (action, table_name, details)
    VALUES ('cleanup', 'leads', 'Removed orphaned lead assignments');
END;
$$ LANGUAGE plpgsql;

-- 10. MONITORING AND ALERTS
-- =====================================================

-- Create audit log table for tracking changes
CREATE TABLE IF NOT EXISTS audit_log (
    id BIGSERIAL PRIMARY KEY,
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID DEFAULT auth.uid()
);

-- Index for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log (action);

-- Function to log lead assignments
CREATE OR REPLACE FUNCTION log_lead_assignment()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.assigned_to_id IS DISTINCT FROM NEW.assigned_to_id THEN
        INSERT INTO audit_log (action, table_name, record_id, details)
        VALUES (
            'lead_assignment',
            'leads',
            NEW.id,
            jsonb_build_object(
                'old_agent_id', OLD.assigned_to_id,
                'new_agent_id', NEW.assigned_to_id,
                'lead_status', NEW.status
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_lead_assignment
    AFTER UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION log_lead_assignment();

-- =====================================================
-- EXECUTION SUMMARY
-- =====================================================

-- Run this to apply all optimizations:
-- \i database-optimization.sql

-- To refresh materialized views manually:
-- REFRESH MATERIALIZED VIEW lead_assignment_stats;

-- To check performance:
-- EXPLAIN ANALYZE SELECT * FROM get_front_sales_agents();

-- To monitor index usage:
-- SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch 
-- FROM pg_stat_user_indexes 
-- WHERE schemaname = 'public' 
-- ORDER BY idx_scan DESC; 
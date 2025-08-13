-- =====================================================
-- OPTIMIZED CONVERSION FLOW - DATABASE SCHEMA UPDATES
-- Lead → Customer → Sales Disposition → Project
-- =====================================================

-- 1. UPDATE PROJECTS TABLE - Add Missing Columns
-- =====================================================

-- Add lead reference to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id);

-- Add sales disposition reference to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sales_disposition_id UUID REFERENCES sales_dispositions(id);

-- Add assigned employee reference to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS assigned_to_id UUID REFERENCES employees(id);

-- Add budget column to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2) DEFAULT 0;

-- Add services array to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS services TEXT[] DEFAULT '{}';

-- Add project manager column to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS project_manager TEXT;

-- 2. UPDATE SALES DISPOSITIONS TABLE - Add Lead Reference
-- =====================================================

-- Add lead reference to sales dispositions
ALTER TABLE sales_dispositions ADD COLUMN IF NOT EXISTS lead_id UUID REFERENCES leads(id);

-- 3. UPDATE LEADS TABLE - Add Conversion Tracking
-- =====================================================

-- Add conversion timestamp to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS converted_at TIMESTAMPTZ;

-- Add sales disposition reference to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sales_disposition_id UUID REFERENCES sales_dispositions(id);

-- 4. CREATE ENHANCED CONVERSION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION convert_lead_to_customer(
    lead_id UUID,
    conversion_data JSONB
)
RETURNS JSONB AS $$
DECLARE
    agent_id UUID;
    agent_name TEXT;
    sales_disposition_id UUID;
    project_ids UUID[];
    result JSONB;
BEGIN
    -- Get the agent who claimed this lead
    SELECT assigned_to_id, agent INTO agent_id, agent_name
    FROM leads WHERE id = lead_id;
    
    IF agent_id IS NULL THEN
        RAISE EXCEPTION 'Lead must be claimed before conversion';
    END IF;
    
    -- Create sales disposition
    INSERT INTO sales_dispositions (
        lead_id,
        customer_name,
        email,
        phone_number,
        business_name,
        service_sold,
        services_included,
        service_details,
        gross_value,
        cash_in,
        remaining,
        payment_mode,
        company,
        sales_source,
        lead_source,
        sale_type,
        service_tenure,
        turnaround_time,
        seller,
        account_manager,
        project_manager,
        sale_date,
        user_id,
        assigned_by,
        assigned_to,
        front_brand,
        agreement_url,
        tax_deduction
    ) VALUES (
        lead_id,
        conversion_data->>'customer_name',
        conversion_data->>'email',
        conversion_data->>'phone_number',
        conversion_data->>'business_name',
        conversion_data->>'service_sold',
        conversion_data->'services_included',
        conversion_data->>'service_details',
        (conversion_data->>'gross_value')::DECIMAL,
        (conversion_data->>'cash_in')::DECIMAL,
        (conversion_data->>'remaining')::DECIMAL,
        conversion_data->>'payment_mode',
        conversion_data->>'company',
        conversion_data->>'sales_source',
        conversion_data->>'lead_source',
        conversion_data->>'sale_type',
        conversion_data->>'service_tenure',
        conversion_data->>'turnaround_time',
        agent_name,
        conversion_data->>'account_manager',
        conversion_data->>'project_manager',
        conversion_data->>'sale_date',
        conversion_data->>'user_id',
        agent_name,
        conversion_data->>'project_manager',
        conversion_data->>'front_brand',
        conversion_data->>'agreement_url',
        (conversion_data->>'tax_deduction')::DECIMAL
    ) RETURNING id INTO sales_disposition_id;
    
    -- Update lead status
    UPDATE leads 
    SET status = 'converted',
        converted_at = NOW(),
        sales_disposition_id = sales_disposition_id,
        price = (conversion_data->>'gross_value')::DECIMAL,
        updated_at = NOW()
    WHERE id = lead_id;
    
    -- Create projects for each service
    SELECT array_agg(project_id) INTO project_ids
    FROM (
        SELECT create_project_from_service(
            sales_disposition_id,
            service_name,
            conversion_data->>'customer_name',
            conversion_data->>'project_manager',
            conversion_data->>'user_id'
        ) as project_id
        FROM jsonb_array_elements_text(conversion_data->'services_included') as service_name
    ) as projects;
    
    -- Log the conversion
    INSERT INTO audit_log (action, table_name, record_id, details)
    VALUES (
        'lead_converted',
        'leads',
        lead_id,
        jsonb_build_object(
            'agent_id', agent_id,
            'agent_name', agent_name,
            'sales_disposition_id', sales_disposition_id,
            'project_ids', project_ids,
            'converted_at', NOW()
        )
    );
    
    -- Return result
    result := jsonb_build_object(
        'success', true,
        'sales_disposition_id', sales_disposition_id,
        'project_ids', project_ids,
        'agent_name', agent_name
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CREATE PROJECT GENERATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION create_project_from_service(
    sales_disposition_id UUID,
    service_name TEXT,
    customer_name TEXT,
    project_manager TEXT,
    user_id TEXT
)
RETURNS UUID AS $$
DECLARE
    project_id UUID;
    due_date DATE;
    lead_id UUID;
BEGIN
    -- Get lead_id from sales disposition
    SELECT lead_id INTO lead_id FROM sales_dispositions WHERE id = sales_disposition_id;
    
    -- Calculate due date (30 days from now)
    due_date := CURRENT_DATE + INTERVAL '30 days';
    
    -- Create project
    INSERT INTO projects (
        name,
        client,
        description,
        status,
        due_date,
        lead_id,
        sales_disposition_id,
        assigned_to_id,
        project_manager,
        budget,
        services,
        user_id
    ) VALUES (
        service_name || ' - ' || customer_name,
        customer_name,
        'Project created from sales disposition for service: ' || service_name,
        'new',
        due_date,
        lead_id,
        sales_disposition_id,
        (SELECT id FROM employees WHERE full_name = project_manager LIMIT 1),
        project_manager,
        0, -- Budget will be calculated from service
        ARRAY[service_name],
        user_id
    ) RETURNING id INTO project_id;
    
    RETURN project_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. CREATE PERFORMANCE TRACKING VIEW
-- =====================================================

CREATE OR REPLACE VIEW agent_performance_summary AS
SELECT 
    p.id as agent_id,
    p.full_name as agent_name,
    e.department,
    e.job_title,
    COUNT(l.id) as total_leads_claimed,
    COUNT(CASE WHEN l.status = 'converted' THEN 1 END) as leads_converted,
    COUNT(CASE WHEN l.status = 'contacted' THEN 1 END) as leads_contacted,
    COUNT(CASE WHEN l.status = 'qualified' THEN 1 END) as leads_qualified,
    ROUND(
        COUNT(CASE WHEN l.status = 'converted' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(l.id), 0) * 100, 2
    ) as conversion_rate,
    COALESCE(SUM(sd.gross_value), 0) as total_sales_value,
    COALESCE(AVG(sd.gross_value), 0) as avg_deal_size,
    AVG(EXTRACT(EPOCH FROM (l.converted_at - l.updated_at))/86400) as avg_conversion_time_days,
    COUNT(DISTINCT pr.id) as total_projects,
    COUNT(CASE WHEN pr.status = 'completed' THEN 1 END) as completed_projects
FROM user_profiles p
INNER JOIN employees e ON SPLIT_PART(e.email, '@', 1) = p.username
LEFT JOIN leads l ON l.assigned_to_id = p.id
LEFT JOIN sales_dispositions sd ON sd.lead_id = l.id
LEFT JOIN projects pr ON pr.lead_id = l.id
WHERE e.department = 'Front Sales'
GROUP BY p.id, p.full_name, e.department, e.job_title;

-- 7. CREATE SALES ANALYTICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW sales_analytics AS
SELECT 
    DATE_TRUNC('month', sd.sale_date) as month,
    sd.company,
    sd.sale_type,
    sd.sales_source,
    COUNT(sd.id) as total_sales,
    SUM(sd.gross_value) as total_revenue,
    SUM(sd.cash_in) as total_cash_in,
    AVG(sd.gross_value) as avg_deal_size,
    COUNT(DISTINCT sd.seller) as active_sellers,
    COUNT(DISTINCT pr.id) as projects_created,
    ROUND(
        COUNT(CASE WHEN pr.status = 'completed' THEN 1 END)::DECIMAL / 
        NULLIF(COUNT(pr.id), 0) * 100, 2
    ) as project_completion_rate
FROM sales_dispositions sd
LEFT JOIN projects pr ON pr.sales_disposition_id = sd.id
GROUP BY DATE_TRUNC('month', sd.sale_date), sd.company, sd.sale_type, sd.sales_source
ORDER BY month DESC;

-- 8. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for lead conversion tracking
CREATE INDEX IF NOT EXISTS idx_leads_converted_at ON leads (converted_at);
CREATE INDEX IF NOT EXISTS idx_leads_sales_disposition ON leads (sales_disposition_id);

-- Index for project relationships
CREATE INDEX IF NOT EXISTS idx_projects_lead_id ON projects (lead_id);
CREATE INDEX IF NOT EXISTS idx_projects_sales_disposition ON projects (sales_disposition_id);
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON projects (assigned_to_id);

-- Index for sales disposition lead reference
CREATE INDEX IF NOT EXISTS idx_sales_dispositions_lead_id ON sales_dispositions (lead_id);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_leads_status_converted ON leads (status, converted_at);
CREATE INDEX IF NOT EXISTS idx_projects_status_lead ON projects (status, lead_id);

-- 9. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION convert_lead_to_customer(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION create_project_from_service(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT SELECT ON agent_performance_summary TO authenticated;
GRANT SELECT ON sales_analytics TO authenticated;

-- 10. CREATE AUDIT LOG TABLE (if not exists)
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

-- Index for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log (created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log (action);
CREATE INDEX IF NOT EXISTS idx_audit_log_table ON audit_log (table_name);

-- 11. CREATE TRIGGER FOR AUTOMATIC AUDIT LOGGING
-- =====================================================

CREATE OR REPLACE FUNCTION log_lead_conversion()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'converted' AND NEW.status = 'converted' THEN
        INSERT INTO audit_log (action, table_name, record_id, details)
        VALUES (
            'lead_converted',
            'leads',
            NEW.id,
            jsonb_build_object(
                'agent_id', NEW.assigned_to_id,
                'agent_name', NEW.agent,
                'converted_at', NEW.converted_at,
                'sales_disposition_id', NEW.sales_disposition_id
            )
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_log_lead_conversion ON leads;
CREATE TRIGGER trigger_log_lead_conversion
    AFTER UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION log_lead_conversion();

-- 12. VALIDATION QUERIES
-- =====================================================

-- Check if schema updates were successful
SELECT 
    'Schema Update Status' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'projects' AND column_name = 'lead_id'
        ) THEN '✅ Projects table updated'
        ELSE '❌ Projects table not updated'
    END as status;

SELECT 
    'Function Status' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.routines 
            WHERE routine_name = 'convert_lead_to_customer'
        ) THEN '✅ Conversion function created'
        ELSE '❌ Conversion function not created'
    END as status;

SELECT 
    'View Status' as check_type,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.views 
            WHERE table_name = 'agent_performance_summary'
        ) THEN '✅ Performance view created'
        ELSE '❌ Performance view not created'
    END as status;

-- =====================================================
-- SCHEMA UPDATE COMPLETE
-- =====================================================

-- Summary of changes:
-- ✅ Added lead_id, sales_disposition_id, assigned_to_id, budget, services to projects
-- ✅ Added lead_id to sales_dispositions
-- ✅ Added converted_at, sales_disposition_id to leads
-- ✅ Created convert_lead_to_customer function
-- ✅ Created create_project_from_service function
-- ✅ Created agent_performance_summary view
-- ✅ Created sales_analytics view
-- ✅ Added performance indexes
-- ✅ Created audit logging system
-- ✅ Added automatic triggers

-- Next steps:
-- 1. Test the conversion function with sample data
-- 2. Implement the enhanced conversion modal in the frontend
-- 3. Update the performance dashboard to use the new views
-- 4. Train the team on the new workflow 
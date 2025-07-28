-- =====================================================
-- UPSELL SYSTEM - DATABASE SCHEMA UPDATES
-- LogicWorks CRM - Mixed Service Types Support
-- =====================================================

-- 1. UPDATE SERVICES TABLE - Add Service Type Classification
-- =====================================================

-- Add service type classification
ALTER TABLE services ADD COLUMN IF NOT EXISTS service_type TEXT DEFAULT 'project';
-- Values: 'project', 'recurring', 'one-time'

-- Add billing frequency for recurring services
ALTER TABLE services ADD COLUMN IF NOT EXISTS billing_frequency TEXT;
-- Values: 'monthly', 'quarterly', 'yearly', 'one-time'

-- Add service category
ALTER TABLE services ADD COLUMN IF NOT EXISTS category TEXT;
-- Values: 'hosting', 'domain', 'ssl', 'development', 'design', 'marketing'

-- 2. CREATE RECURRING SERVICES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS recurring_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES sales_dispositions(id),
    service_name TEXT NOT NULL,
    service_type TEXT NOT NULL, -- 'hosting', 'domain', 'ssl', etc.
    billing_frequency TEXT NOT NULL, -- 'monthly', 'yearly', etc.
    amount DECIMAL(10,2) NOT NULL,
    next_billing_date DATE NOT NULL,
    status TEXT DEFAULT 'active', -- 'active', 'suspended', 'cancelled'
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. UPDATE SALES DISPOSITIONS TABLE - Add Upsell Tracking
-- =====================================================

-- Add upsell tracking
ALTER TABLE sales_dispositions ADD COLUMN IF NOT EXISTS is_upsell BOOLEAN DEFAULT FALSE;

-- Add reference to original sales disposition for upsells
ALTER TABLE sales_dispositions ADD COLUMN IF NOT EXISTS original_sales_disposition_id UUID REFERENCES sales_dispositions(id);

-- Add service types array to track mixed service types
ALTER TABLE sales_dispositions ADD COLUMN IF NOT EXISTS service_types TEXT[];

-- 4. UPDATE PROJECTS TABLE - Add Upsell Support
-- =====================================================

-- Add upsell tracking to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_upsell BOOLEAN DEFAULT FALSE;

-- Add parent project reference for upsell projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS parent_project_id UUID REFERENCES projects(id);

-- 5. CREATE ONE-TIME SERVICES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS one_time_services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES sales_dispositions(id),
    service_name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    delivery_date DATE,
    status TEXT DEFAULT 'pending', -- 'pending', 'delivered', 'cancelled'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. CREATE UPSELL ANALYTICS VIEW
-- =====================================================

CREATE OR REPLACE VIEW upsell_analytics AS
SELECT 
    sd.id as sales_disposition_id,
    sd.customer_name,
    sd.email,
    sd.is_upsell,
    sd.original_sales_disposition_id,
    sd.gross_value as upsell_value,
    sd.sale_date,
    sd.service_types,
    COUNT(p.id) as project_count,
    COUNT(rs.id) as recurring_service_count,
    COUNT(ots.id) as one_time_service_count
FROM sales_dispositions sd
LEFT JOIN projects p ON p.sales_disposition_id = sd.id
LEFT JOIN recurring_services rs ON rs.customer_id = sd.id
LEFT JOIN one_time_services ots ON ots.customer_id = sd.id
WHERE sd.is_upsell = TRUE
GROUP BY sd.id, sd.customer_name, sd.email, sd.is_upsell, sd.original_sales_disposition_id, sd.gross_value, sd.sale_date, sd.service_types;

-- 7. CREATE CUSTOMER SERVICE PORTFOLIO VIEW
-- =====================================================

CREATE OR REPLACE VIEW customer_service_portfolio AS
SELECT 
    sd.id as customer_id,
    sd.customer_name,
    sd.email,
    sd.phone_number,
    -- Projects
    COUNT(p.id) as total_projects,
    COUNT(CASE WHEN p.status = 'in_progress' THEN 1 END) as active_projects,
    COUNT(CASE WHEN p.status = 'completed' THEN 1 END) as completed_projects,
    -- Recurring Services
    COUNT(rs.id) as total_recurring_services,
    COUNT(CASE WHEN rs.status = 'active' THEN 1 END) as active_recurring_services,
    SUM(CASE WHEN rs.status = 'active' THEN rs.amount ELSE 0 END) as monthly_recurring_revenue,
    -- One-time Services
    COUNT(ots.id) as total_one_time_services,
    -- Sales History
    COUNT(sd2.id) as total_sales,
    SUM(sd2.gross_value) as total_lifetime_value,
    MAX(sd2.sale_date) as last_purchase_date
FROM sales_dispositions sd
LEFT JOIN projects p ON p.sales_disposition_id = sd.id
LEFT JOIN recurring_services rs ON rs.customer_id = sd.id
LEFT JOIN one_time_services ots ON ots.customer_id = sd.id
LEFT JOIN sales_dispositions sd2 ON sd2.customer_name = sd.customer_name AND sd2.email = sd.email
GROUP BY sd.id, sd.customer_name, sd.email, sd.phone_number;

-- 8. INSERT SAMPLE SERVICE DATA WITH TYPES
-- =====================================================

-- Project-based services
UPDATE services SET 
    service_type = 'project',
    category = 'development'
WHERE name ILIKE '%website%' OR name ILIKE '%development%' OR name ILIKE '%app%';

UPDATE services SET 
    service_type = 'project',
    category = 'design'
WHERE name ILIKE '%design%' OR name ILIKE '%graphic%' OR name ILIKE '%logo%';

UPDATE services SET 
    service_type = 'project',
    category = 'marketing'
WHERE name ILIKE '%seo%' OR name ILIKE '%marketing%' OR name ILIKE '%content%';

-- Add sample recurring services
INSERT INTO services (name, service_type, billing_frequency, category, price) VALUES
('VPS Hosting - Basic', 'recurring', 'monthly', 'hosting', 29.99),
('VPS Hosting - Professional', 'recurring', 'monthly', 'hosting', 59.99),
('Shared Hosting - Basic', 'recurring', 'monthly', 'hosting', 9.99),
('Shared Hosting - Premium', 'recurring', 'monthly', 'hosting', 19.99),
('Domain Registration', 'recurring', 'yearly', 'domain', 12.99),
('SSL Certificate - Basic', 'recurring', 'yearly', 'ssl', 49.99),
('SSL Certificate - Premium', 'recurring', 'yearly', 'ssl', 99.99),
('Email Hosting - Basic', 'recurring', 'monthly', 'email', 4.99),
('Email Hosting - Professional', 'recurring', 'monthly', 'email', 9.99),
('CDN Service', 'recurring', 'monthly', 'hosting', 14.99),
('Backup Service', 'recurring', 'monthly', 'hosting', 7.99)
ON CONFLICT (name) DO NOTHING;

-- Add sample one-time services
INSERT INTO services (name, service_type, billing_frequency, category, price) VALUES
('Domain Transfer', 'one-time', 'one-time', 'domain', 25.00),
('Data Migration', 'one-time', 'one-time', 'hosting', 150.00),
('SSL Installation', 'one-time', 'one-time', 'ssl', 75.00),
('Website Backup', 'one-time', 'one-time', 'hosting', 50.00),
('Consultation - 1 Hour', 'one-time', 'one-time', 'consultation', 100.00),
('Consultation - 2 Hours', 'one-time', 'one-time', 'consultation', 180.00)
ON CONFLICT (name) DO NOTHING; 
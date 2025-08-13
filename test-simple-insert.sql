-- Simple test to check if there are any other functions causing issues
-- This script will help us identify if the issue is in our trigger or elsewhere

-- 1. Disable ALL triggers on sales_dispositions
ALTER TABLE sales_dispositions DISABLE TRIGGER ALL;

-- 2. Test insertion
INSERT INTO sales_dispositions (
    sale_date,
    customer_name,
    phone_number,
    email,
    service_sold,
    services_included,
    turnaround_time,
    service_tenure,
    service_details,
    gross_value,
    cash_in,
    remaining,
    payment_mode,
    company,
    sales_source,
    lead_source,
    sale_type,
    seller,
    account_manager,
    project_manager,
    assigned_to,
    user_id,
    assigned_by,
    created_at,
    updated_at
) VALUES (
    '2025-07-29',
    'Test Customer Simple',
    '+1234567890',
    'testsimple@example.com',
    'Web Development',
    ARRAY['Web Development'],
    '2 weeks',
    '1 month',
    'Test service details',
    5000,
    5000,
    0,
    'WIRE',
    'American Digital Agency',
    'BARK',
    'PAID_MARKETING',
    'FRONT',
    'Test Seller',
    'Test Account Manager',
    'Test Project Manager',
    'Test Assigned To',
    'de514a73-4782-439e-b2ea-3f49fe568e24',
    'de514a73-4782-439e-b2ea-3f49fe568e24',
    NOW(),
    NOW()
);

-- 3. Check if insertion was successful
SELECT 'Insertion successful' as status, id, customer_name, email FROM sales_dispositions WHERE email = 'testsimple@example.com';

-- 4. Clean up test data
DELETE FROM sales_dispositions WHERE email = 'testsimple@example.com';

-- 5. Re-enable ALL triggers
ALTER TABLE sales_dispositions ENABLE TRIGGER ALL; 
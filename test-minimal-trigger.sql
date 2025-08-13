-- Test minimal trigger function
-- This script creates a very simple trigger to test if the issue is in our function logic

-- 1. Drop the current trigger and function
DROP TRIGGER IF EXISTS trigger_update_front_seller_performance ON sales_dispositions;
DROP FUNCTION IF EXISTS update_front_seller_performance() CASCADE;

-- 2. Create a MINIMAL trigger function that does nothing
CREATE OR REPLACE FUNCTION update_front_seller_performance()
RETURNS TRIGGER AS $$
BEGIN
    -- Do nothing - just return the record
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
CREATE TRIGGER trigger_update_front_seller_performance
    AFTER INSERT OR UPDATE OR DELETE ON sales_dispositions
    FOR EACH ROW
    EXECUTE FUNCTION update_front_seller_performance();

-- 4. Test insertion with minimal trigger
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
    'Test Customer Minimal Trigger',
    '+1234567890',
    'testminimal@example.com',
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

-- 5. Check if insertion was successful
SELECT 'Minimal trigger test' as status, id, customer_name, email FROM sales_dispositions WHERE email = 'testminimal@example.com';

-- 6. Clean up test data
DELETE FROM sales_dispositions WHERE email = 'testminimal@example.com'; 
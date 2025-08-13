-- Step 4: Test front_seller_performance operations
-- This script adds the front_seller_performance SELECT to see if that's where the issue is

-- 1. Drop the current trigger and function
DROP TRIGGER IF EXISTS trigger_update_front_seller_performance ON sales_dispositions;
DROP FUNCTION IF EXISTS update_front_seller_performance() CASCADE;

-- 2. Create a STEP 4 function - add front_seller_performance SELECT
CREATE OR REPLACE FUNCTION update_front_seller_performance()
RETURNS TRIGGER AS $$
DECLARE
    current_seller_id UUID;
    seller_department TEXT;
    current_month_str TEXT;
    existing_performance_id UUID;
BEGIN
    -- Get the seller ID from the new/old record
    current_seller_id := COALESCE(NEW.user_id, OLD.user_id);
    
    -- Only proceed if we have a seller ID
    IF current_seller_id IS NULL THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Check if the seller is from Front Sales department
    SELECT department INTO seller_department
    FROM employees e
    INNER JOIN user_profiles p ON e.email = p.email
    WHERE p.id = current_seller_id;
    
    -- Only update performance for Front Sales employees
    IF seller_department != 'Front Sales' THEN
        RETURN COALESCE(NEW, OLD);
    END IF;
    
    -- Get the current month as string (YYYY-MM-DD format)
    current_month_str := TO_CHAR(DATE_TRUNC('month', CURRENT_DATE), 'YYYY-MM-DD');
    
    -- Check if performance record already exists for this month
    SELECT id INTO existing_performance_id
    FROM front_seller_performance
    WHERE seller_id = current_seller_id AND month = current_month_str;
    
    -- For now, just return the record without INSERT/UPDATE operations
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
CREATE TRIGGER trigger_update_front_seller_performance
    AFTER INSERT OR UPDATE OR DELETE ON sales_dispositions
    FOR EACH ROW
    EXECUTE FUNCTION update_front_seller_performance();

-- 4. Test insertion with step 4 function
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
    'Test Customer Step 4',
    '+1234567890',
    'teststep4@example.com',
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

-- 5. Check if step 4 was successful
SELECT 'Step 4 test' as status, id, customer_name, email FROM sales_dispositions WHERE email = 'teststep4@example.com';

-- 6. Clean up test data
DELETE FROM sales_dispositions WHERE email = 'teststep4@example.com'; 
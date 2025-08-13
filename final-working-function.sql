-- Final Working Function
-- This script creates the complete working function with the date casting fix

-- 1. Drop the current trigger and function
DROP TRIGGER IF EXISTS trigger_update_front_seller_performance ON sales_dispositions;
DROP FUNCTION IF EXISTS update_front_seller_performance() CASCADE;

-- 2. Create the FINAL WORKING function with proper date casting
CREATE OR REPLACE FUNCTION update_front_seller_performance()
RETURNS TRIGGER AS $$
DECLARE
    current_seller_id UUID;
    seller_department TEXT;
    current_month DATE;
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
    
    -- Get the current month as DATE (first day of the month)
    current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    
    -- Check if performance record already exists for this month
    SELECT id INTO existing_performance_id
    FROM front_seller_performance
    WHERE seller_id = current_seller_id AND month = current_month;
    
    -- If this is a new sales disposition (INSERT)
    IF TG_OP = 'INSERT' THEN
        IF existing_performance_id IS NULL THEN
            -- Create new performance record for the month
            INSERT INTO front_seller_performance (
                seller_id,
                month,
                accounts_achieved,
                total_gross,
                total_cash_in,
                total_remaining
            ) VALUES (
                current_seller_id,
                current_month,
                1, -- One new account
                NEW.gross_value,
                NEW.cash_in,
                NEW.remaining
            );
        ELSE
            -- Update existing performance record
            UPDATE front_seller_performance
            SET 
                accounts_achieved = accounts_achieved + 1,
                total_gross = total_gross + NEW.gross_value,
                total_cash_in = total_cash_in + NEW.cash_in,
                total_remaining = total_remaining + NEW.remaining,
                updated_at = NOW()
            WHERE id = existing_performance_id;
        END IF;
    END IF;
    
    -- If this is an update to existing sales disposition
    IF TG_OP = 'UPDATE' THEN
        IF existing_performance_id IS NOT NULL THEN
            -- Update performance record with the difference
            UPDATE front_seller_performance
            SET 
                total_gross = total_gross - OLD.gross_value + NEW.gross_value,
                total_cash_in = total_cash_in - OLD.cash_in + NEW.cash_in,
                total_remaining = total_remaining - OLD.remaining + NEW.remaining,
                updated_at = NOW()
            WHERE id = existing_performance_id;
        END IF;
    END IF;
    
    -- If this is a deletion
    IF TG_OP = 'DELETE' THEN
        IF existing_performance_id IS NOT NULL THEN
            -- Update performance record by subtracting the deleted values
            UPDATE front_seller_performance
            SET 
                accounts_achieved = GREATEST(0, accounts_achieved - 1),
                total_gross = GREATEST(0, total_gross - OLD.gross_value),
                total_cash_in = GREATEST(0, total_cash_in - OLD.cash_in),
                total_remaining = GREATEST(0, total_remaining - OLD.remaining),
                updated_at = NOW()
            WHERE id = existing_performance_id;
        END IF;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create the trigger
CREATE TRIGGER trigger_update_front_seller_performance
    AFTER INSERT OR UPDATE OR DELETE ON sales_dispositions
    FOR EACH ROW
    EXECUTE FUNCTION update_front_seller_performance();

-- 4. Test insertion with the final working function
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
    'Test Customer Final Working',
    '+1234567890',
    'testfinal@example.com',
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

-- 5. Check if the final working function was successful
SELECT 'Final working function test' as status, id, customer_name, email FROM sales_dispositions WHERE email = 'testfinal@example.com';

-- 6. Check if performance record was created
SELECT 'Performance record created' as status, seller_id, month, accounts_achieved, total_gross FROM front_seller_performance WHERE seller_id = 'de514a73-4782-439e-b2ea-3f49fe568e24';

-- 7. Clean up test data
DELETE FROM sales_dispositions WHERE email = 'testfinal@example.com';
DELETE FROM front_seller_performance WHERE seller_id = 'de514a73-4782-439e-b2ea-3f49fe568e24' AND month = DATE_TRUNC('month', CURRENT_DATE)::DATE; 
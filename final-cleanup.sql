-- Final Cleanup - Drop ALL functions and recreate only the essential one
-- This script ensures no conflicting functions exist

-- 1. Drop ALL functions that might interfere
DROP FUNCTION IF EXISTS update_front_seller_performance() CASCADE;
DROP FUNCTION IF EXISTS recalculate_seller_performance(UUID, DATE) CASCADE;
DROP FUNCTION IF EXISTS recalculate_all_front_sales_performance() CASCADE;
DROP FUNCTION IF EXISTS get_seller_performance_summary(UUID, DATE) CASCADE;
DROP FUNCTION IF EXISTS test_front_sales_performance_update() CASCADE;
DROP FUNCTION IF EXISTS assign_lead_to_agent(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_front_sales_agents() CASCADE;
DROP FUNCTION IF EXISTS refresh_lead_stats() CASCADE;
DROP FUNCTION IF EXISTS cleanup_orphaned_data() CASCADE;
DROP FUNCTION IF EXISTS log_lead_assignment() CASCADE;
DROP FUNCTION IF EXISTS log_performance_update() CASCADE;

-- 2. Drop ALL views
DROP VIEW IF EXISTS agent_performance_summary CASCADE;
DROP VIEW IF EXISTS lead_performance_analytics CASCADE;
DROP MATERIALIZED VIEW IF EXISTS lead_assignment_stats CASCADE;

-- 3. Drop ALL triggers
DROP TRIGGER IF EXISTS trigger_update_front_seller_performance ON sales_dispositions;
DROP TRIGGER IF EXISTS trigger_refresh_lead_stats ON leads;
DROP TRIGGER IF EXISTS trigger_log_lead_assignment ON leads;
DROP TRIGGER IF EXISTS trigger_log_performance_update ON front_seller_performance;

-- 4. Create a SIMPLIFIED function that only handles the essential logic
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
                current_month_str,
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

-- 5. Create the trigger
CREATE TRIGGER trigger_update_front_seller_performance
    AFTER INSERT OR UPDATE OR DELETE ON sales_dispositions
    FOR EACH ROW
    EXECUTE FUNCTION update_front_seller_performance();

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION update_front_seller_performance() TO authenticated;

-- 7. Log the final cleanup
INSERT INTO audit_log (action, table_name, details)
VALUES (
    'final_cleanup_profiles_references',
    'system',
    jsonb_build_object(
        'message', 'Final cleanup applied - simplified function with proper date handling',
        'timestamp', NOW()
    )
); 
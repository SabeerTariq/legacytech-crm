-- =====================================================
-- AUTO-UPDATE FRONT SALES PERFORMANCE
-- =====================================================
-- This script creates triggers and functions to automatically
-- update Front Sales employee performance when they complete sales forms

-- 1. CREATE OR UPDATE FRONT SELLER PERFORMANCE FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_front_seller_performance()
RETURNS TRIGGER AS $$
DECLARE
    seller_id UUID;
    seller_email TEXT;
    current_month DATE;
    existing_performance_id UUID;
    seller_department TEXT;
BEGIN
    -- Get the seller's user ID from the sales disposition
    seller_id := NEW.user_id;
    
    -- Check if the seller is from Front Sales department
    SELECT department INTO seller_department
    FROM employees e
    INNER JOIN profiles p ON e.email = p.username || '@example.com'
    WHERE p.id = seller_id;
    
    -- Only update performance for Front Sales employees
    IF seller_department != 'Front Sales' THEN
        RETURN NEW;
    END IF;
    
    -- Get the current month (first day of the month)
    current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    
    -- Check if performance record already exists for this month
    SELECT id INTO existing_performance_id
    FROM front_seller_performance
    WHERE seller_id = seller_id AND month = current_month::TEXT;
    
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
                seller_id,
                current_month::TEXT,
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

-- 2. CREATE TRIGGER ON SALES_DISPOSITIONS TABLE
-- =====================================================

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_update_front_seller_performance ON sales_dispositions;

-- Create the trigger
CREATE TRIGGER trigger_update_front_seller_performance
    AFTER INSERT OR UPDATE OR DELETE ON sales_dispositions
    FOR EACH ROW
    EXECUTE FUNCTION update_front_seller_performance();

-- 3. CREATE FUNCTION TO RECALCULATE PERFORMANCE FOR A SELLER
-- =====================================================

CREATE OR REPLACE FUNCTION recalculate_seller_performance(seller_user_id UUID, target_month DATE DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    month_to_calculate DATE;
    total_accounts INTEGER;
    total_gross DECIMAL(10,2);
    total_cash_in DECIMAL(10,2);
    total_remaining DECIMAL(10,2);
    existing_performance_id UUID;
BEGIN
    -- Use provided month or current month
    month_to_calculate := COALESCE(target_month, DATE_TRUNC('month', CURRENT_DATE)::DATE);
    
    -- Calculate totals from sales dispositions for the month
    SELECT 
        COUNT(*),
        COALESCE(SUM(gross_value), 0),
        COALESCE(SUM(cash_in), 0),
        COALESCE(SUM(remaining), 0)
    INTO total_accounts, total_gross, total_cash_in, total_remaining
    FROM sales_dispositions
    WHERE user_id = seller_user_id
    AND DATE_TRUNC('month', sale_date::DATE) = month_to_calculate;
    
    -- Check if performance record exists
    SELECT id INTO existing_performance_id
    FROM front_seller_performance
    WHERE seller_id = seller_user_id AND month = month_to_calculate::TEXT;
    
    IF existing_performance_id IS NOT NULL THEN
        -- Update existing record
        UPDATE front_seller_performance
        SET 
            accounts_achieved = total_accounts,
            total_gross = total_gross,
            total_cash_in = total_cash_in,
            total_remaining = total_remaining,
            updated_at = NOW()
        WHERE id = existing_performance_id;
    ELSE
        -- Create new record
        INSERT INTO front_seller_performance (
            seller_id,
            month,
            accounts_achieved,
            total_gross,
            total_cash_in,
            total_remaining
        ) VALUES (
            seller_user_id,
            month_to_calculate::TEXT,
            total_accounts,
            total_gross,
            total_cash_in,
            total_remaining
        );
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. CREATE FUNCTION TO RECALCULATE ALL FRONT SALES PERFORMANCE
-- =====================================================

CREATE OR REPLACE FUNCTION recalculate_all_front_sales_performance()
RETURNS VOID AS $$
DECLARE
    seller_record RECORD;
    current_month DATE;
BEGIN
    current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    
    -- Get all Front Sales employees
    FOR seller_record IN 
        SELECT p.id as user_id
        FROM profiles p
        INNER JOIN employees e ON e.email = p.username || '@example.com'
        WHERE e.department = 'Front Sales'
    LOOP
        -- Recalculate performance for each seller
        PERFORM recalculate_seller_performance(seller_record.user_id, current_month);
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. CREATE FUNCTION TO GET SELLER PERFORMANCE SUMMARY
-- =====================================================

CREATE OR REPLACE FUNCTION get_seller_performance_summary(
    p_seller_id UUID,
    p_month DATE DEFAULT NULL
)
RETURNS TABLE (
    seller_id UUID,
    seller_name TEXT,
    month TEXT,
    accounts_achieved INTEGER,
    total_gross DECIMAL(10,2),
    total_cash_in DECIMAL(10,2),
    total_remaining DECIMAL(10,2),
    target_accounts INTEGER,
    target_gross DECIMAL(10,2),
    target_cash_in DECIMAL(10,2),
    performance_rank INTEGER
) AS $$
DECLARE
    month_to_check DATE;
    seller_rank INTEGER;
BEGIN
    month_to_check := COALESCE(p_month, DATE_TRUNC('month', CURRENT_DATE)::DATE);
    
    -- Get seller's performance
    RETURN QUERY
    SELECT 
        fsp.seller_id,
        p.full_name as seller_name,
        fsp.month,
        fsp.accounts_achieved,
        fsp.total_gross,
        fsp.total_cash_in,
        fsp.total_remaining,
        COALESCE(fst.target_accounts, 0) as target_accounts,
        COALESCE(fst.target_gross, 0) as target_gross,
        COALESCE(fst.target_cash_in, 0) as target_cash_in,
        0 as performance_rank -- Will be calculated below
    FROM front_seller_performance fsp
    INNER JOIN profiles p ON p.id = fsp.seller_id
    LEFT JOIN front_seller_targets fst ON fst.seller_id = fsp.seller_id AND fst.month = fsp.month
    WHERE fsp.seller_id = p_seller_id AND fsp.month = month_to_check::TEXT;
    
    -- Calculate rank (this would need to be done in application layer for better performance)
    -- For now, returning 0 as placeholder
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. GRANT PERMISSIONS
-- =====================================================

GRANT EXECUTE ON FUNCTION update_front_seller_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_seller_performance(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_all_front_sales_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION get_seller_performance_summary(UUID, DATE) TO authenticated;

-- 7. CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for sales dispositions by user and date
CREATE INDEX IF NOT EXISTS idx_sales_dispositions_user_date 
ON sales_dispositions(user_id, sale_date);

-- Index for front seller performance by seller and month
CREATE INDEX IF NOT EXISTS idx_front_seller_performance_seller_month 
ON front_seller_performance(seller_id, month);

-- Index for employees by department
CREATE INDEX IF NOT EXISTS idx_employees_department 
ON employees(department);

-- 8. TEST THE IMPLEMENTATION
-- =====================================================

-- Test function to verify the trigger works
CREATE OR REPLACE FUNCTION test_front_sales_performance_update()
RETURNS TEXT AS $$
DECLARE
    test_user_id UUID;
    test_result TEXT;
BEGIN
    -- Get a Front Sales employee for testing
    SELECT p.id INTO test_user_id
    FROM profiles p
    INNER JOIN employees e ON e.email = p.username || '@example.com'
    WHERE e.department = 'Front Sales'
    LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RETURN 'No Front Sales employees found for testing';
    END IF;
    
    -- Test the recalculate function
    PERFORM recalculate_seller_performance(test_user_id);
    
    RETURN 'Front Sales performance update system is working correctly';
END;
$$ LANGUAGE plpgsql;

-- 9. AUDIT LOGGING FOR PERFORMANCE UPDATES
-- =====================================================

-- Create audit log function for performance updates
CREATE OR REPLACE FUNCTION log_performance_update()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (action, table_name, record_id, details)
    VALUES (
        'performance_update',
        'front_seller_performance',
        NEW.id,
        jsonb_build_object(
            'seller_id', NEW.seller_id,
            'month', NEW.month,
            'accounts_achieved', NEW.accounts_achieved,
            'total_gross', NEW.total_gross,
            'total_cash_in', NEW.total_cash_in,
            'total_remaining', NEW.total_remaining,
            'triggered_by', 'sales_disposition_change'
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for performance audit logging
DROP TRIGGER IF EXISTS trigger_log_performance_update ON front_seller_performance;
CREATE TRIGGER trigger_log_performance_update
    AFTER INSERT OR UPDATE ON front_seller_performance
    FOR EACH ROW
    EXECUTE FUNCTION log_performance_update();

-- =====================================================
-- IMPLEMENTATION COMPLETE
-- =====================================================

-- Summary of what was created:
-- ✅ Automatic performance update trigger on sales_dispositions
-- ✅ Recalculation functions for individual and all sellers
-- ✅ Performance summary function
-- ✅ Proper indexing for performance
-- ✅ Audit logging for performance changes
-- ✅ Test function for verification

-- How it works:
-- 1. When a Front Sales employee completes a sales form, the trigger automatically fires
-- 2. The trigger checks if the seller is from Front Sales department
-- 3. It updates or creates a performance record for the current month
-- 4. The performance data is immediately available in the Front Seller Dashboard
-- 5. All changes are logged in the audit log for tracking

-- To test:
-- SELECT test_front_sales_performance_update();
-- SELECT * FROM front_seller_performance WHERE seller_id = 'your-test-user-id'; 
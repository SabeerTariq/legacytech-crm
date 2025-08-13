-- =====================================================
-- UPSELLER PERFORMANCE TRACKING SCHEMA
-- =====================================================
-- This script creates tables and functions to track upseller performance

-- 1. CREATE UPSELLER TARGETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS upseller_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: YYYY-MM-DD (first day of month)
    target_accounts INTEGER NOT NULL DEFAULT 0,
    target_gross DECIMAL(15,2) NOT NULL DEFAULT 0,
    target_cash_in DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(seller_id, month)
);

-- 2. CREATE UPSELLER PERFORMANCE TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS upseller_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month TEXT NOT NULL, -- Format: YYYY-MM-DD (first day of month)
    accounts_achieved INTEGER NOT NULL DEFAULT 0,
    total_gross DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_cash_in DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_remaining DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(seller_id, month)
);

-- 3. CREATE OR UPDATE UPSELLER PERFORMANCE FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION update_upseller_performance()
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
    
    -- Check if the seller is from Upseller department
    SELECT department INTO seller_department
    FROM employees e
    INNER JOIN user_profiles p ON e.email = p.username || '@example.com'
    WHERE p.id = seller_id;
    
    -- Only update performance for Upseller employees
    IF seller_department != 'Upseller' THEN
        RETURN NEW;
    END IF;
    
    -- Get the current month (first day of the month)
    current_month := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    
    -- Check if performance record already exists for this month
    SELECT id INTO existing_performance_id
    FROM upseller_performance
    WHERE seller_id = seller_id AND month = current_month::TEXT;
    
    -- If this is a new sales disposition (INSERT)
    IF TG_OP = 'INSERT' THEN
        IF existing_performance_id IS NULL THEN
            -- Create new performance record for the month
            INSERT INTO upseller_performance (
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
            UPDATE upseller_performance
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
            UPDATE upseller_performance
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
            UPDATE upseller_performance
            SET 
                accounts_achieved = GREATEST(0, accounts_achieved - 1),
                total_gross = GREATEST(0, total_gross - OLD.gross_value),
                total_cash_in = GREATEST(0, total_cash_in - OLD.cash_in),
                total_remaining = GREATEST(0, total_remaining - OLD.remaining),
                updated_at = NOW()
            WHERE id = existing_performance_id;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. CREATE TRIGGER FOR UPSELLER PERFORMANCE
-- =====================================================
DROP TRIGGER IF EXISTS trigger_update_upseller_performance ON sales_dispositions;
CREATE TRIGGER trigger_update_upseller_performance
    AFTER INSERT OR UPDATE OR DELETE ON sales_dispositions
    FOR EACH ROW
    EXECUTE FUNCTION update_upseller_performance();

-- 5. CREATE FUNCTION TO RECALCULATE UPSELLER PERFORMANCE
-- =====================================================
CREATE OR REPLACE FUNCTION recalculate_upseller_performance(seller_user_id UUID, target_month DATE DEFAULT NULL)
RETURNS VOID AS $$
DECLARE
    month_to_recalculate DATE;
    total_accounts INTEGER;
    total_gross DECIMAL(15,2);
    total_cash_in DECIMAL(15,2);
    total_remaining DECIMAL(15,2);
BEGIN
    -- If no month specified, use current month
    IF target_month IS NULL THEN
        month_to_recalculate := DATE_TRUNC('month', CURRENT_DATE)::DATE;
    ELSE
        month_to_recalculate := target_month;
    END IF;
    
    -- Calculate totals from sales_dispositions for the specified month
    SELECT 
        COUNT(*)::INTEGER,
        COALESCE(SUM(gross_value), 0),
        COALESCE(SUM(cash_in), 0),
        COALESCE(SUM(remaining), 0)
    INTO total_accounts, total_gross, total_cash_in, total_remaining
    FROM sales_dispositions
    WHERE user_id = seller_user_id 
    AND DATE_TRUNC('month', created_at)::DATE = month_to_recalculate;
    
    -- Upsert the performance record
    INSERT INTO upseller_performance (
        seller_id,
        month,
        accounts_achieved,
        total_gross,
        total_cash_in,
        total_remaining
    ) VALUES (
        seller_user_id,
        month_to_recalculate::TEXT,
        total_accounts,
        total_gross,
        total_cash_in,
        total_remaining
    )
    ON CONFLICT (seller_id, month)
    DO UPDATE SET
        accounts_achieved = EXCLUDED.accounts_achieved,
        total_gross = EXCLUDED.total_gross,
        total_cash_in = EXCLUDED.total_cash_in,
        total_remaining = EXCLUDED.total_remaining,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- 6. CREATE FUNCTION TO RECALCULATE ALL UPSELLER PERFORMANCE
-- =====================================================
CREATE OR REPLACE FUNCTION recalculate_all_upseller_performance()
RETURNS VOID AS $$
DECLARE
    upseller_user RECORD;
BEGIN
    -- Get all upseller users
    FOR upseller_user IN 
        SELECT DISTINCT p.id as user_id
        FROM user_profiles p
        INNER JOIN employees e ON e.email = p.username || '@example.com'
        WHERE e.department = 'Upseller'
    LOOP
        -- Recalculate performance for each upseller
        PERFORM recalculate_upseller_performance(upseller_user.user_id);
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 7. CREATE FUNCTION TO GET UPSELLER TEAM PERFORMANCE SUMMARY
-- =====================================================
CREATE OR REPLACE FUNCTION get_upseller_team_performance_summary(p_month TEXT)
RETURNS TABLE (
    seller_id UUID,
    seller_name TEXT,
    accounts_achieved INTEGER,
    total_gross DECIMAL(15,2),
    total_cash_in DECIMAL(15,2),
    total_remaining DECIMAL(15,2),
    target_accounts INTEGER,
    target_gross DECIMAL(15,2),
    target_cash_in DECIMAL(15,2),
    performance_rank BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH upseller_performance AS (
        SELECT 
            up.seller_id,
            up.accounts_achieved,
            up.total_gross,
            up.total_cash_in,
            up.total_remaining,
            ut.target_accounts,
            ut.target_gross,
            ut.target_cash_in,
            ROW_NUMBER() OVER (ORDER BY up.total_cash_in DESC) as performance_rank
        FROM upseller_performance up
        LEFT JOIN upseller_targets ut ON ut.seller_id = up.seller_id AND ut.month = p_month
        WHERE up.month = p_month
    )
    SELECT 
        up.seller_id,
        e.name as seller_name,
        up.accounts_achieved,
        up.total_gross,
        up.total_cash_in,
        up.total_remaining,
        COALESCE(up.target_accounts, 0),
        COALESCE(up.target_gross, 0),
        COALESCE(up.target_cash_in, 0),
        up.performance_rank
    FROM upseller_performance up
    INNER JOIN user_profiles p ON p.id = up.seller_id
    INNER JOIN employees e ON e.email = p.username || '@example.com'
    WHERE e.department = 'Upseller'
    ORDER BY up.performance_rank;
END;
$$ LANGUAGE plpgsql;

-- 8. CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_upseller_targets_seller_month 
ON upseller_targets(seller_id, month);

CREATE INDEX IF NOT EXISTS idx_upseller_performance_seller_month 
ON upseller_performance(seller_id, month);

CREATE INDEX IF NOT EXISTS idx_employees_department_upseller 
ON employees(department) WHERE department = 'Upseller';

-- 9. GRANT PERMISSIONS
-- =====================================================
GRANT EXECUTE ON FUNCTION update_upseller_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_upseller_performance(UUID, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION recalculate_all_upseller_performance() TO authenticated;
GRANT EXECUTE ON FUNCTION get_upseller_team_performance_summary(TEXT) TO authenticated;

-- 10. ENABLE ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE upseller_targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE upseller_performance ENABLE ROW LEVEL SECURITY;

-- 11. CREATE RLS POLICIES
-- =====================================================
-- Users can view their own targets
CREATE POLICY "Users can view own upseller targets" ON upseller_targets
    FOR SELECT USING (
        seller_id IN (
            SELECT e.id FROM employees e 
            INNER JOIN user_profiles p ON e.email = p.username || '@example.com'
            WHERE p.user_id = auth.uid()
        )
    );

-- Users can update their own targets
CREATE POLICY "Users can update own upseller targets" ON upseller_targets
    FOR UPDATE USING (
        seller_id IN (
            SELECT e.id FROM employees e 
            INNER JOIN user_profiles p ON e.email = p.username || '@example.com'
            WHERE p.user_id = auth.uid()
        )
    );

-- Users can insert their own targets
CREATE POLICY "Users can insert own upseller targets" ON upseller_targets
    FOR INSERT WITH CHECK (
        seller_id IN (
            SELECT e.id FROM employees e 
            INNER JOIN user_profiles p ON e.email = p.username || '@example.com'
            WHERE p.user_id = auth.uid()
        )
    );

-- Users can view their own performance
CREATE POLICY "Users can view own upseller performance" ON upseller_performance
    FOR SELECT USING (seller_id = auth.uid());

-- Admins can view all data
CREATE POLICY "Admins can view all upseller data" ON upseller_targets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            INNER JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

CREATE POLICY "Admins can view all upseller performance" ON upseller_performance
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles ur
            INNER JOIN roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() AND r.name = 'admin'
        )
    );

-- 12. CREATE TEST DATA FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION test_upseller_performance_update()
RETURNS VOID AS $$
BEGIN
    -- This function can be used to test the performance update system
    -- You can call it manually or use it for testing purposes
    
    RAISE NOTICE 'Upseller performance update system is ready!';
    RAISE NOTICE 'Tables created: upseller_targets, upseller_performance';
    RAISE NOTICE 'Functions created: update_upseller_performance, recalculate_upseller_performance';
    RAISE NOTICE 'Trigger created: trigger_update_upseller_performance';
    RAISE NOTICE 'Team performance function: get_upseller_team_performance_summary';
    
    -- You can test by inserting a sales disposition for an upseller user
    -- The trigger will automatically update the performance table
END;
$$ LANGUAGE plpgsql;

-- 13. CREATE LOGGING FUNCTION
-- =====================================================
CREATE OR REPLACE FUNCTION log_upseller_performance_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Log performance updates for audit purposes
    INSERT INTO permission_audit_log (
        user_id,
        resource,
        action,
        permission_granted,
        context
    ) VALUES (
        COALESCE(NEW.seller_id, OLD.seller_id),
        'upseller_performance',
        TG_OP,
        true,
        jsonb_build_object(
            'month', COALESCE(NEW.month, OLD.month),
            'accounts_achieved', COALESCE(NEW.accounts_achieved, OLD.accounts_achieved),
            'total_gross', COALESCE(NEW.total_gross, OLD.total_gross),
            'total_cash_in', COALESCE(NEW.total_cash_in, OLD.total_cash_in)
        )
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 14. CREATE LOGGING TRIGGER
-- =====================================================
DROP TRIGGER IF EXISTS trigger_log_upseller_performance_update ON upseller_performance;
CREATE TRIGGER trigger_log_upseller_performance_update
    AFTER INSERT OR UPDATE ON upseller_performance
    FOR EACH ROW
    EXECUTE FUNCTION log_upseller_performance_update();

-- 15. FINAL SETUP
-- =====================================================
-- Call the test function to verify setup
SELECT test_upseller_performance_update();

-- Display the created tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('upseller_targets', 'upseller_performance')
ORDER BY table_name, ordinal_position;

-- Display the created functions
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name LIKE '%upseller%'
ORDER BY routine_name;

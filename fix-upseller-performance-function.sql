-- Fix the type mismatch in get_upseller_team_performance_summary function
-- Change performance_rank from BIGINT to INTEGER to match TypeScript expectations

-- Drop the existing function
DROP FUNCTION IF EXISTS get_upseller_team_performance_summary(p_month TEXT);

-- Recreate the function with INTEGER return type for performance_rank
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
    performance_rank INTEGER
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
            ROW_NUMBER() OVER (ORDER BY up.total_cash_in DESC)::INTEGER as performance_rank
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

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_upseller_team_performance_summary(TEXT) TO authenticated;

-- Test the function
SELECT 'Testing fixed upseller team performance function...' as status;

-- Check what the function returns for current month
SELECT 
  'Function result for current month:' as info,
  seller_id,
  seller_name,
  accounts_achieved,
  total_gross,
  performance_rank
FROM get_upseller_team_performance_summary(DATE_TRUNC('month', CURRENT_DATE)::TEXT);

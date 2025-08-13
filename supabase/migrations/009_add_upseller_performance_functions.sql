-- Add missing upseller performance functions
-- Migration: 009_add_upseller_performance_functions.sql

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS get_upseller_performance_summary(p_month TEXT) CASCADE;

-- Create the get_upseller_performance_summary function
CREATE OR REPLACE FUNCTION get_upseller_performance_summary(p_month TEXT)
RETURNS TABLE (
    employee_id UUID,
    employee_name TEXT,
    team_name TEXT,
    month TEXT,
    target_accounts INTEGER,
    target_gross DECIMAL(15,2),
    target_cash_in DECIMAL(15,2),
    achieved_accounts INTEGER,
    achieved_gross DECIMAL(15,2),
    achieved_cash_in DECIMAL(15,2),
    performance_percentage DECIMAL(5,2),
    rank_in_team BIGINT,
    rank_overall BIGINT
) AS $$
BEGIN
    RETURN QUERY
    WITH upseller_data AS (
        SELECT 
            up.seller_id,
            up.accounts_achieved,
            up.total_gross,
            up.total_cash_in,
            up.month,
            COALESCE(ut.target_accounts, 0) as target_accounts,
            COALESCE(ut.target_gross, 0) as target_gross,
            COALESCE(ut.target_cash_in, 0) as target_cash_in,
            e.full_name as employee_name,
            e.department,
            utm.team_id,
            ut.name as team_name
        FROM upseller_performance up
        INNER JOIN user_profiles p ON p.id = up.seller_id
        INNER JOIN employees e ON e.email = p.username || '@example.com'
        LEFT JOIN upseller_targets_management ut ON ut.employee_id = e.id AND ut.month = p_month
        LEFT JOIN upseller_team_members utm ON utm.employee_id = e.id
        LEFT JOIN upseller_teams ut ON ut.id = utm.team_id
        WHERE up.month = p_month
        AND e.department = 'Upseller'
    ),
    ranked_data AS (
        SELECT 
            *,
            CASE 
                WHEN target_cash_in > 0 THEN (total_cash_in / target_cash_in) * 100
                ELSE 0 
            END as calc_performance_percentage,
            ROW_NUMBER() OVER (PARTITION BY team_id ORDER BY total_cash_in DESC) as team_rank,
            ROW_NUMBER() OVER (ORDER BY total_cash_in DESC) as overall_rank
        FROM upseller_data
    )
    SELECT 
        seller_id::UUID as employee_id,
        employee_name,
        COALESCE(team_name, 'No Team') as team_name,
        month,
        target_accounts,
        target_gross,
        target_cash_in,
        accounts_achieved as achieved_accounts,
        total_gross as achieved_gross,
        total_cash_in as achieved_cash_in,
        calc_performance_percentage as performance_percentage,
        team_rank as rank_in_team,
        overall_rank as rank_overall
    FROM ranked_data
    ORDER BY total_cash_in DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_upseller_performance_summary(TEXT) TO authenticated;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_upseller_performance_month_seller 
ON upseller_performance(month, seller_id);

-- Create index for targets management
CREATE INDEX IF NOT EXISTS idx_upseller_targets_management_month_employee 
ON upseller_targets_management(month, employee_id);

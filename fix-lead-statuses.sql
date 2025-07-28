-- =====================================================
-- FIX LEAD STATUSES BEFORE ADDING CHECK CONSTRAINT
-- =====================================================

-- 1. First, let's see what status values currently exist
SELECT DISTINCT status, COUNT(*) as count 
FROM leads 
GROUP BY status 
ORDER BY status;

-- 2. Update any invalid statuses to valid ones
-- Common mappings for invalid statuses:
UPDATE leads SET status = 'new' WHERE status IS NULL OR status = '';
UPDATE leads SET status = 'contacted' WHERE status IN ('contact', 'calling', 'called');
UPDATE leads SET status = 'qualified' WHERE status IN ('qualify', 'qualified_lead', 'hot_lead');
UPDATE leads SET status = 'converted' WHERE status IN ('sale', 'sold', 'won', 'closed_won');
UPDATE leads SET status = 'lost' WHERE status IN ('rejected', 'closed_lost', 'dead');

-- 3. Check again what statuses remain
SELECT DISTINCT status, COUNT(*) as count 
FROM leads 
GROUP BY status 
ORDER BY status;

-- 4. If there are still invalid statuses, update them to 'new'
UPDATE leads SET status = 'new' 
WHERE status NOT IN ('new', 'contacted', 'qualified', 'converted', 'lost');

-- 5. Final check
SELECT DISTINCT status, COUNT(*) as count 
FROM leads 
GROUP BY status 
ORDER BY status;

-- 6. Now we can safely add the check constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'chk_leads_status' 
        AND table_name = 'leads'
    ) THEN
        ALTER TABLE leads ADD CONSTRAINT chk_leads_status 
        CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost'));
    END IF;
END $$;

-- 7. Verify the constraint was added
SELECT constraint_name, check_clause 
FROM information_schema.check_constraints 
WHERE constraint_name = 'chk_leads_status'; 
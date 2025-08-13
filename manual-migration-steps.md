# Manual Database Migration Steps

Since the `exec_sql` function doesn't exist in your database, you'll need to apply these SQL statements manually through your database management tool (pgAdmin, Supabase Dashboard, or psql).

## Step 1: Add New Columns to Employees Table

```sql
-- Add new columns to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS user_management_email TEXT;
ALTER TABLE employees ADD COLUMN IF NOT EXISTS personal_email TEXT;

-- Move existing emails to personal_email
UPDATE employees 
SET personal_email = email, user_management_email = NULL 
WHERE personal_email IS NULL;
```

## Step 2: Create Email Generation Function

```sql
CREATE OR REPLACE FUNCTION generate_employee_user_email(employee_full_name TEXT, employee_department TEXT)
RETURNS TEXT AS $$
DECLARE
  clean_name TEXT;
  dept_prefix TEXT;
  base_email TEXT;
  final_email TEXT;
  counter INTEGER := 1;
BEGIN
  -- Clean the employee name
  clean_name := LOWER(REGEXP_REPLACE(employee_full_name, '[^a-zA-Z0-9\\s]', '', 'g'));
  clean_name := REGEXP_REPLACE(TRIM(clean_name), '\\s+', '.', 'g');
  
  -- Get department prefix (first 3 letters)
  dept_prefix := LOWER(SUBSTRING(employee_department FROM 1 FOR 3));
  
  -- Create base email
  base_email := clean_name || '.' || dept_prefix || '@logicworks.com';
  
  -- Check for uniqueness and add number if needed
  final_email := base_email;
  
  WHILE EXISTS (
    SELECT 1 FROM employees 
    WHERE user_management_email = final_email
  ) LOOP
    final_email := clean_name || '.' || dept_prefix || counter || '@logicworks.com';
    counter := counter + 1;
  END LOOP;
  
  RETURN final_email;
END;
$$ LANGUAGE plpgsql;
```

## Step 3: Create Sync Function

```sql
CREATE OR REPLACE FUNCTION sync_employee_user_emails()
RETURNS VOID AS $$
DECLARE
  emp_record RECORD;
BEGIN
  FOR emp_record IN 
    SELECT id, full_name, department 
    FROM employees 
    WHERE user_management_email IS NULL
  LOOP
    UPDATE employees 
    SET user_management_email = generate_employee_user_email(emp_record.full_name, emp_record.department)
    WHERE id = emp_record.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
```

## Step 4: Create Linking Status View

```sql
CREATE OR REPLACE VIEW employee_user_linking_status AS
SELECT 
  e.id as employee_id,
  e.full_name as employee_name,
  e.email as original_email,
  e.personal_email,
  e.user_management_email as system_email,
  e.department,
  up.user_id as profile_user_id,
  up.email as profile_email,
  CASE 
    WHEN up.user_id IS NOT NULL THEN 'LINKED'
    WHEN e.user_management_email IS NOT NULL THEN 'NEEDS_ACCOUNT_CREATION'
    ELSE 'NEEDS_EMAIL_GENERATION'
  END as linking_status
FROM employees e
LEFT JOIN user_profiles up ON up.employee_id = e.id
ORDER BY e.full_name;
```

## Step 5: Fix Team Performance Function

```sql
-- Drop all existing versions
DROP FUNCTION IF EXISTS get_team_performance_summary(p_month DATE) CASCADE;
DROP FUNCTION IF EXISTS get_team_performance_summary(p_month TEXT) CASCADE;
DROP FUNCTION IF EXISTS get_team_performance_summary(p_month TIMESTAMP) CASCADE;

-- Create clean version
CREATE OR REPLACE FUNCTION get_team_performance_summary(p_month DATE)
RETURNS TABLE (
  seller_id UUID,
  seller_name TEXT,
  accounts_achieved INTEGER,
  total_gross NUMERIC,
  total_cash_in NUMERIC,
  total_remaining NUMERIC,
  performance_rank BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fsp.seller_id,
    COALESCE(e.full_name, up.display_name, 'Unknown User') as seller_name,
    fsp.accounts_achieved,
    fsp.total_gross,
    fsp.total_cash_in,
    fsp.total_remaining,
    ROW_NUMBER() OVER (ORDER BY fsp.accounts_achieved DESC, fsp.total_gross DESC) as performance_rank
  FROM front_seller_performance fsp
  LEFT JOIN user_profiles up ON up.user_id = fsp.seller_id
  LEFT JOIN employees e ON e.id = up.employee_id
  WHERE fsp.month = p_month
  AND (e.department = 'Front Sales' OR up.email LIKE '%.sal@logicworks.com' OR up.email LIKE '%.fro@logicworks.com')
  ORDER BY fsp.accounts_achieved DESC, fsp.total_gross DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## How to Apply These Changes

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste each SQL block above
4. Execute them one by one

### Option 2: psql Command Line
```bash
psql -h your-host -U your-user -d your-database -f migration.sql
```

### Option 3: pgAdmin
1. Open pgAdmin
2. Connect to your database
3. Open Query Tool
4. Paste and execute each SQL block

## After Migration

Once you've applied these SQL statements, you can run:

```bash
# Generate emails for employees
node generate-emails-for-employees.js

# Create user accounts
node create-front-sales-users.js

# Test the system
node test-new-email-linking.js
```

## Verification

After applying the migration, you can verify it worked by running:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'employees' 
AND column_name IN ('user_management_email', 'personal_email');

-- Test email generation
SELECT generate_employee_user_email('Test Employee', 'Front Sales');

-- Check the view
SELECT * FROM employee_user_linking_status LIMIT 5;
``` 
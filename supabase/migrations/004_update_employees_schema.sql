-- Update Employees Schema Migration
-- This updates the employees table to match the expected schema for user management

-- Add full_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'full_name') THEN
        ALTER TABLE employees ADD COLUMN full_name TEXT;
        -- Copy existing name data to full_name
        UPDATE employees SET full_name = name WHERE full_name IS NULL;
        -- Make full_name NOT NULL after copying data
        ALTER TABLE employees ALTER COLUMN full_name SET NOT NULL;
    END IF;
END $$;

-- Add job_title column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'job_title') THEN
        ALTER TABLE employees ADD COLUMN job_title TEXT;
        -- Copy existing position data to job_title
        UPDATE employees SET job_title = position WHERE job_title IS NULL;
    END IF;
END $$;

-- Add contact_number column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'contact_number') THEN
        ALTER TABLE employees ADD COLUMN contact_number TEXT;
        -- Copy existing phone data to contact_number
        UPDATE employees SET contact_number = phone WHERE contact_number IS NULL;
    END IF;
END $$;

-- Add date_of_joining column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'date_of_joining') THEN
        ALTER TABLE employees ADD COLUMN date_of_joining DATE DEFAULT CURRENT_DATE;
    END IF;
END $$;

-- Create index on full_name for better performance
CREATE INDEX IF NOT EXISTS idx_employees_full_name ON employees(full_name); 
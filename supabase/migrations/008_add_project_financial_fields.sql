-- Add financial fields to projects table for upseller dashboard
-- Migration: 008_add_project_financial_fields.sql

-- Add total_amount and amount_paid columns to projects table
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0.00;

-- Add index for better performance on financial queries
CREATE INDEX IF NOT EXISTS idx_projects_assigned_to ON projects(assigned_to);
CREATE INDEX IF NOT EXISTS idx_projects_financial ON projects(total_amount, amount_paid);

-- Update existing projects to have default values
UPDATE projects 
SET total_amount = COALESCE(total_amount, 0.00),
    amount_paid = COALESCE(amount_paid, 0.00)
WHERE total_amount IS NULL OR amount_paid IS NULL;

-- Add constraint to ensure amount_paid cannot exceed total_amount
ALTER TABLE projects 
ADD CONSTRAINT check_amount_paid_not_exceed_total 
CHECK (amount_paid <= total_amount);

-- Add constraint to ensure amounts are non-negative
ALTER TABLE projects 
ADD CONSTRAINT check_amounts_non_negative 
CHECK (total_amount >= 0 AND amount_paid >= 0);

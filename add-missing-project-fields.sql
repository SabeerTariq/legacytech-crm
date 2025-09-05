-- Add missing fields to projects table for AllProjects view
-- This migration adds the fields that the frontend expects but are missing from the current schema

USE logicworks_crm;

-- First, add missing fields to customers table
ALTER TABLE customers 
ADD COLUMN full_name VARCHAR(255) DEFAULT NULL AFTER name,
ADD COLUMN business_name VARCHAR(255) DEFAULT NULL AFTER full_name;

-- Update existing customers to populate the new fields
UPDATE customers SET 
  full_name = COALESCE(name, 'N/A'),
  business_name = COALESCE(company, 'N/A')
WHERE full_name IS NULL OR business_name IS NULL;

-- Add missing fields to projects table
ALTER TABLE projects 
ADD COLUMN client VARCHAR(255) DEFAULT NULL AFTER description,
ADD COLUMN assigned_pm_id VARCHAR(36) DEFAULT NULL AFTER status,
ADD COLUMN due_date DATE DEFAULT NULL AFTER assigned_pm_id,
ADD COLUMN total_amount DECIMAL(12,2) DEFAULT 0.00 AFTER due_date,
ADD COLUMN amount_paid DECIMAL(12,2) DEFAULT 0.00 AFTER total_amount,
ADD COLUMN services JSON DEFAULT NULL AFTER amount_paid;

-- Add indexes for better performance
CREATE INDEX idx_projects_assigned_pm_id ON projects(assigned_pm_id);
CREATE INDEX idx_projects_due_date ON projects(due_date);
CREATE INDEX idx_projects_status ON projects(status);

-- Update existing projects to have default values
UPDATE projects SET 
  client = 'N/A',
  total_amount = 0.00,
  amount_paid = 0.00,
  services = '[]'
WHERE client IS NULL OR total_amount IS NULL OR amount_paid IS NULL OR services IS NULL;

-- Set due_date to end_date if available, otherwise start_date
UPDATE projects SET due_date = COALESCE(end_date, start_date) WHERE due_date IS NULL;

-- Add foreign key constraint for assigned_pm_id if employees table exists
-- Note: This will fail if there are existing invalid assigned_pm_id values
-- You may need to clean up data first or make this constraint optional
-- ALTER TABLE projects ADD CONSTRAINT fk_projects_assigned_pm_id 
--   FOREIGN KEY (assigned_pm_id) REFERENCES employees(id) ON DELETE SET NULL;

-- Verify the changes
DESCRIBE projects;
DESCRIBE customers;

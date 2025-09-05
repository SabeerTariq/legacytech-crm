-- ============================================================================
-- Simplified MySQL Schema for Testing
-- ============================================================================

-- Schema for MySQL migration

-- Core tables with essential structure
CREATE TABLE `employees` (
  `id` varchar(36) NOT NULL,
  `department` text NOT NULL,
  `email` text NOT NULL,
  `performance` json DEFAULT (JSON_OBJECT()),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `full_name` text,
  `father_name` text,
  `date_of_birth` date,
  `gender` text,
  `marital_status` text,
  `cnic_number` text,
  `current_residential_address` text,
  `permanent_address` text,
  `contact_number` text,
  `personal_email_address` text,
  `total_dependents_covered` int,
  `job_title` text,
  `date_of_joining` date,
  `reporting_manager` text,
  `work_module` text,
  `work_hours` text,
  `bank_name` text,
  `account_holder_name` text,
  `account_number` text,
  `iban_number` text,
  `user_management_email` text,
  `personal_email` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_employees_email` (`email`),
  UNIQUE KEY `uk_employees_cnic` (`cnic_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `leads` (
  `id` varchar(36) NOT NULL,
  `client_name` text NOT NULL,
  `email_address` text NOT NULL,
  `contact_number` text,
  `city_state` text,
  `business_description` text,
  `services_required` text,
  `budget` text,
  `additional_info` text,
  `user_id` varchar(36),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `date` date,
  `status` ENUM('new','converted') DEFAULT 'new',
  `source` text,
  `price` decimal(10,2) DEFAULT 0,
  `priority` text,
  `lead_score` int,
  `last_contact` timestamp,
  `next_follow_up` date,
  `converted_at` timestamp,
  `sales_disposition_id` varchar(36),
  `agent` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `projects` (
  `id` varchar(36) NOT NULL,
  `name` text NOT NULL,
  `client` text NOT NULL,
  `description` text,
  `due_date` date NOT NULL,
  `status` ENUM('unassigned','assigned','in_progress','review','completed','on_hold') DEFAULT 'unassigned',
  `progress` int DEFAULT 0,
  `user_id` varchar(36) NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lead_id` varchar(36),
  `sales_disposition_id` varchar(36),
  `budget` decimal(10,2) DEFAULT 0,
  `services` json DEFAULT (JSON_ARRAY()),
  `project_manager` text,
  `assigned_pm_id` varchar(36),
  `assignment_date` timestamp,
  `project_type` text DEFAULT 'one-time',
  `is_upsell` boolean DEFAULT FALSE,
  `parent_project_id` varchar(36),
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `amount_paid` decimal(10,2) DEFAULT 0.00,
  `payment_plan_id` varchar(36),
  `payment_source_id` varchar(36),
  `is_recurring` boolean DEFAULT FALSE,
  `recurring_frequency` varchar(255),
  `next_payment_date` date,
  `total_installments` int DEFAULT 1,
  `current_installment` int DEFAULT 1,
  `installment_frequency` varchar(255),
  `installment_amount` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Performance indexes
CREATE INDEX idx_employees_department ON employees(department);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_job_title ON employees(job_title);
CREATE INDEX idx_employees_date_of_joining ON employees(date_of_joining);
CREATE INDEX idx_employees_reporting_manager ON employees(reporting_manager);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_leads_date ON leads(date);
CREATE INDEX idx_leads_source ON leads(source);
CREATE INDEX idx_leads_priority ON leads(priority);
CREATE INDEX idx_leads_agent ON leads(agent);

CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_due_date ON projects(due_date);
CREATE INDEX idx_projects_assigned_pm_id ON projects(assigned_pm_id);
CREATE INDEX idx_projects_lead_id ON projects(lead_id);
CREATE INDEX idx_projects_is_upsell ON projects(is_upsell);

-- Full-text search
CREATE FULLTEXT INDEX ft_leads_client_name ON leads(client_name);
CREATE FULLTEXT INDEX ft_projects_name ON projects(name);
CREATE FULLTEXT INDEX ft_employees_full_name ON employees(full_name);

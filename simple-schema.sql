-- Simple MySQL Schema for Migration
-- Compatible with MySQL 5.7+ and MariaDB

CREATE TABLE `employees` (
  `id` varchar(36) NOT NULL,
  `department` text,
  `email` text,
  `performance` text,
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `leads` (
  `id` varchar(36) NOT NULL,
  `client_name` text,
  `email_address` text,
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
  `status` varchar(50) DEFAULT 'new',
  `source` text,
  `price` decimal(10,2) DEFAULT 0,
  `priority` text,
  `lead_score` int,
  `last_contact` timestamp NULL,
  `next_follow_up` date NULL,
  `converted_at` timestamp NULL,
  `sales_disposition_id` varchar(36),
  `agent` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `projects` (
  `id` varchar(36) NOT NULL,
  `name` text,
  `client` text,
  `description` text,
  `due_date` date,
  `status` varchar(50) DEFAULT 'unassigned',
  `progress` int DEFAULT 0,
  `user_id` varchar(36),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lead_id` varchar(36),
  `sales_disposition_id` varchar(36),
  `budget` decimal(10,2) DEFAULT 0,
  `services` text,
  `project_manager` text,
  `assigned_pm_id` varchar(36),
  `assignment_date` timestamp NULL,
  `project_type` text DEFAULT 'one-time',
  `is_upsell` tinyint(1) DEFAULT 0,
  `parent_project_id` varchar(36),
  `total_amount` decimal(10,2) DEFAULT 0.00,
  `amount_paid` decimal(10,2) DEFAULT 0.00,
  `payment_plan_id` varchar(36),
  `payment_source_id` varchar(36),
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurring_frequency` varchar(255),
  `next_payment_date` date,
  `total_installments` int DEFAULT 1,
  `current_installment` int DEFAULT 1,
  `installment_frequency` varchar(255),
  `installment_amount` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `sales_dispositions` (
  `id` varchar(36) NOT NULL,
  `customer_name` text,
  `phone_number` text,
  `sale_date` date,
  `amount` decimal(10,2),
  `user_id` varchar(36),
  `company` varchar(100),
  `sales_source` varchar(100),
  `seller` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `services` (
  `id` varchar(36) NOT NULL,
  `name` text,
  `description` text,
  `price` decimal(10,2),
  `category` text,
  `service_type` text,
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurring_frequency` varchar(100),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_profiles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36),
  `display_name` text,
  `email` text,
  `employee_id` varchar(36),
  `is_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `roles` (
  `id` varchar(36) NOT NULL,
  `name` text,
  `description` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `user_roles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36),
  `role_id` varchar(36),
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

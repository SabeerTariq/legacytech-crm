-- =====================================================
-- LOGICWORKS CRM DATABASE EXPORT FOR MYSQL
-- Generated on: $(date)
-- Source: Supabase PostgreSQL Database
-- Target: MySQL Database
-- =====================================================

-- Disable foreign key checks for import
SET FOREIGN_KEY_CHECKS = 0;

-- =====================================================
-- TABLE: ai_chat_conversations
-- =====================================================
DROP TABLE IF EXISTS `ai_chat_conversations`;
CREATE TABLE `ai_chat_conversations` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `title` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: ai_chat_messages
-- =====================================================
DROP TABLE IF EXISTS `ai_chat_messages`;
CREATE TABLE `ai_chat_messages` (
  `id` varchar(36) NOT NULL,
  `conversation_id` varchar(36) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL,
  `content` longtext,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: audit_log
-- =====================================================
DROP TABLE IF EXISTS `audit_log`;
CREATE TABLE `audit_log` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `action` varchar(100) DEFAULT NULL,
  `table_name` varchar(100) DEFAULT NULL,
  `record_id` varchar(36) DEFAULT NULL,
  `old_values` json DEFAULT NULL,
  `new_values` json DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: calendar_events
-- =====================================================
DROP TABLE IF EXISTS `calendar_events`;
CREATE TABLE `calendar_events` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: chat_messages
-- =====================================================
DROP TABLE IF EXISTS `chat_messages`;
CREATE TABLE `chat_messages` (
  `id` varchar(36) NOT NULL,
  `conversation_id` varchar(36) DEFAULT NULL,
  `sender_id` varchar(36) DEFAULT NULL,
  `content` text,
  `message_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: conversation_participants
-- =====================================================
DROP TABLE IF EXISTS `conversation_participants`;
CREATE TABLE `conversation_participants` (
  `id` varchar(36) NOT NULL,
  `conversation_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT NULL,
  `left_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: conversations
-- =====================================================
DROP TABLE IF EXISTS `conversations`;
CREATE TABLE `conversations` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: customer_files
-- =====================================================
DROP TABLE IF EXISTS `customer_files`;
CREATE TABLE `customer_files` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `uploaded_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: customer_notes
-- =====================================================
DROP TABLE IF EXISTS `customer_notes`;
CREATE TABLE `customer_notes` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `note_content` text,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: customer_tags
-- =====================================================
DROP TABLE IF EXISTS `customer_tags`;
CREATE TABLE `customer_tags` (
  `id` varchar(36) NOT NULL,
  `customer_id` varchar(36) DEFAULT NULL,
  `tag_name` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: customers
-- =====================================================
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `company` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: employee_dependents
-- =====================================================
DROP TABLE IF EXISTS `employee_dependents`;
CREATE TABLE `employee_dependents` (
  `id` varchar(36) NOT NULL,
  `employee_id` varchar(36) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `relationship` varchar(100) DEFAULT NULL,
  `date_of_birth` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: employee_emergency_contacts
-- =====================================================
DROP TABLE IF EXISTS `employee_emergency_contacts`;
CREATE TABLE `employee_emergency_contacts` (
  `id` varchar(36) NOT NULL,
  `employee_id` varchar(36) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `relationship` varchar(100) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: employee_performance_history
-- =====================================================
DROP TABLE IF EXISTS `employee_performance_history`;
CREATE TABLE `employee_performance_history` (
  `id` varchar(36) NOT NULL,
  `employee_id` varchar(36) DEFAULT NULL,
  `review_date` date DEFAULT NULL,
  `rating` decimal(3,2) DEFAULT NULL,
  `comments` text,
  `reviewer_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: employees
-- =====================================================
DROP TABLE IF EXISTS `employees`;
CREATE TABLE `employees` (
  `id` varchar(36) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `department` varchar(100) DEFAULT NULL,
  `job_title` varchar(100) DEFAULT NULL,
  `hire_date` date DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: error_logs
-- =====================================================
DROP TABLE IF EXISTS `error_logs`;
CREATE TABLE `error_logs` (
  `id` varchar(36) NOT NULL,
  `error_message` text,
  `stack_trace` text,
  `user_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: front_seller_performance
-- =====================================================
DROP TABLE IF EXISTS `front_seller_performance`;
CREATE TABLE `front_seller_performance` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `month` varchar(7) DEFAULT NULL,
  `target_accounts` int DEFAULT NULL,
  `target_gross` decimal(12,2) DEFAULT NULL,
  `target_cash_in` decimal(12,2) DEFAULT NULL,
  `actual_accounts` int DEFAULT NULL,
  `actual_gross` decimal(12,2) DEFAULT NULL,
  `actual_cash_in` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: front_seller_targets
-- =====================================================
DROP TABLE IF EXISTS `front_seller_targets`;
CREATE TABLE `front_seller_targets` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `month` varchar(7) DEFAULT NULL,
  `target_accounts` int DEFAULT NULL,
  `target_gross` decimal(12,2) DEFAULT NULL,
  `target_cash_in` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: leads
-- =====================================================
DROP TABLE IF EXISTS `leads`;
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
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `date` date,
  `status` text DEFAULT 'new',
  `source` text,
  `price` decimal(10,2) DEFAULT 0.00,
  `priority` text,
  `lead_score` int,
  `last_contact` timestamp NULL DEFAULT NULL,
  `next_follow_up` date,
  `converted_at` timestamp NULL DEFAULT NULL,
  `sales_disposition_id` varchar(36),
  `agent` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NOTE: Complete data extraction required
-- The leads table contains 521 records that need to be extracted
-- Use the following SQL to extract complete data:
-- SELECT * FROM leads ORDER BY created_at;

-- =====================================================
-- TABLE: message_attachments
-- =====================================================
DROP TABLE IF EXISTS `message_attachments`;
CREATE TABLE `message_attachments` (
  `id` varchar(36) NOT NULL,
  `message_id` varchar(36) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: message_mentions
-- =====================================================
DROP TABLE IF EXISTS `message_mentions`;
CREATE TABLE `message_mentions` (
  `id` varchar(36) NOT NULL,
  `message_id` varchar(36) DEFAULT NULL,
  `mentioned_user_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: message_reactions
-- =====================================================
DROP TABLE IF EXISTS `message_reactions`;
CREATE TABLE `message_reactions` (
  `id` varchar(36) NOT NULL,
  `message_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `reaction_type` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: message_search
-- =====================================================
DROP TABLE IF EXISTS `message_search`;
CREATE TABLE `message_search` (
  `id` varchar(36) NOT NULL,
  `message_id` varchar(36) DEFAULT NULL,
  `search_content` text,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: message_threads
-- =====================================================
DROP TABLE IF EXISTS `message_threads`;
CREATE TABLE `message_threads` (
  `id` varchar(36) NOT NULL,
  `parent_message_id` varchar(36) DEFAULT NULL,
  `thread_title` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: messages
-- =====================================================
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` varchar(36) NOT NULL,
  `sender_id` varchar(36) DEFAULT NULL,
  `recipient_id` varchar(36) DEFAULT NULL,
  `content` text,
  `message_type` varchar(50) DEFAULT NULL,
  `is_read` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: modules
-- =====================================================
DROP TABLE IF EXISTS `modules`;
CREATE TABLE `modules` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: payment_plans
-- =====================================================
DROP TABLE IF EXISTS `payment_plans`;
CREATE TABLE `payment_plans` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `amount` decimal(12,2) DEFAULT NULL,
  `frequency` varchar(50) DEFAULT NULL,
  `duration` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: payment_sources
-- =====================================================
DROP TABLE IF EXISTS `payment_sources`;
CREATE TABLE `payment_sources` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: payment_transactions
-- =====================================================
DROP TABLE IF EXISTS `payment_transactions`;
CREATE TABLE `payment_transactions` (
  `id` varchar(36) NOT NULL,
  `project_id` varchar(36) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_source` varchar(100) DEFAULT NULL,
  `transaction_type` varchar(50) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: pinned_messages
-- =====================================================
DROP TABLE IF EXISTS `pinned_messages`;
CREATE TABLE `pinned_messages` (
  `id` varchar(36) NOT NULL,
  `message_id` varchar(36) DEFAULT NULL,
  `pinned_by` varchar(36) DEFAULT NULL,
  `pinned_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: project_tasks
-- =====================================================
DROP TABLE IF EXISTS `project_tasks`;
CREATE TABLE `project_tasks` (
  `id` varchar(36) NOT NULL,
  `project_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `status` varchar(50) DEFAULT NULL,
  `priority` varchar(20) DEFAULT NULL,
  `assigned_to` varchar(36) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: project_upsells
-- =====================================================
DROP TABLE IF EXISTS `project_upsells`;
CREATE TABLE `project_upsells` (
  `id` varchar(36) NOT NULL,
  `project_id` varchar(36) DEFAULT NULL,
  `upsell_amount` decimal(12,2) DEFAULT NULL,
  `description` text,
  `status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: projects
-- =====================================================
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `customer_id` varchar(36) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `budget` decimal(12,2) DEFAULT NULL,
  `sales_disposition_id` varchar(36) DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurring_frequency` varchar(20) DEFAULT NULL,
  `next_payment_date` date DEFAULT NULL,
  `total_installments` int DEFAULT 1,
  `current_installment` int DEFAULT 1,
  `installment_frequency` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: recurring_payment_schedule
-- =====================================================
DROP TABLE IF EXISTS `recurring_payment_schedule`;
CREATE TABLE `recurring_payment_schedule` (
  `id` varchar(36) NOT NULL,
  `project_id` varchar(36) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `frequency` varchar(20) DEFAULT NULL,
  `next_payment_date` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: role_permissions
-- =====================================================
DROP TABLE IF EXISTS `role_permissions`;
CREATE TABLE `role_permissions` (
  `id` varchar(36) NOT NULL,
  `role_id` varchar(36) DEFAULT NULL,
  `permission_name` varchar(100) DEFAULT NULL,
  `can_read` tinyint(1) DEFAULT 0,
  `can_create` tinyint(1) DEFAULT 0,
  `can_update` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: roles
-- =====================================================
DROP TABLE IF EXISTS `roles`;
CREATE TABLE `roles` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: sales_dispositions
-- =====================================================
DROP TABLE IF EXISTS `sales_dispositions`;
CREATE TABLE `sales_dispositions` (
  `id` varchar(36) NOT NULL,
  `sale_date` date DEFAULT NULL,
  `customer_name` varchar(255) DEFAULT NULL,
  `phone_number` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `front_brand` varchar(100) DEFAULT NULL,
  `business_name` varchar(255) DEFAULT NULL,
  `service_sold` varchar(255) DEFAULT NULL,
  `services_included` json DEFAULT NULL,
  `turnaround_time` varchar(100) DEFAULT NULL,
  `service_tenure` varchar(100) DEFAULT NULL,
  `service_details` text,
  `agreement_url` varchar(500) DEFAULT NULL,
  `payment_mode` varchar(50) DEFAULT NULL,
  `company` varchar(100) DEFAULT NULL,
  `sales_source` varchar(100) DEFAULT NULL,
  `lead_source` varchar(100) DEFAULT NULL,
  `sale_type` varchar(100) DEFAULT NULL,
  `gross_value` decimal(12,2) DEFAULT NULL,
  `cash_in` decimal(12,2) DEFAULT NULL,
  `remaining` decimal(12,2) DEFAULT NULL,
  `tax_deduction` decimal(12,2) DEFAULT NULL,
  `seller` varchar(255) DEFAULT NULL,
  `account_manager` varchar(255) DEFAULT NULL,
  `project_manager` varchar(255) DEFAULT NULL,
  `assigned_to` varchar(255) DEFAULT NULL,
  `assigned_by` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `lead_id` varchar(36) DEFAULT NULL,
  `is_upsell` tinyint(1) DEFAULT 0,
  `original_sales_disposition_id` varchar(36) DEFAULT NULL,
  `service_types` json DEFAULT NULL,
  `payment_source` varchar(100) DEFAULT NULL,
  `payment_company` varchar(100) DEFAULT NULL,
  `brand` varchar(100) DEFAULT NULL,
  `agreement_signed` tinyint(1) DEFAULT 0,
  `agreement_sent` tinyint(1) DEFAULT 0,
  `payment_plan_id` varchar(36) DEFAULT NULL,
  `payment_source_id` varchar(36) DEFAULT NULL,
  `is_recurring` tinyint(1) DEFAULT 0,
  `recurring_frequency` varchar(20) DEFAULT NULL,
  `total_installments` int DEFAULT 1,
  `current_installment` int DEFAULT 1,
  `next_payment_date` date DEFAULT NULL,
  `upsell_amount` decimal(12,2) DEFAULT NULL,
  `original_sale_id` varchar(36) DEFAULT NULL,
  `installment_frequency` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: services
-- =====================================================
DROP TABLE IF EXISTS `services`;
CREATE TABLE `services` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `category` varchar(100) DEFAULT NULL,
  `base_price` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: task_activities
-- =====================================================
DROP TABLE IF EXISTS `task_activities`;
CREATE TABLE `task_activities` (
  `id` varchar(36) NOT NULL,
  `task_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `activity_type` varchar(50) DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: task_attachments
-- =====================================================
DROP TABLE IF EXISTS `task_attachments`;
CREATE TABLE `task_attachments` (
  `id` varchar(36) NOT NULL,
  `task_id` varchar(36) DEFAULT NULL,
  `file_name` varchar(255) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `file_type` varchar(100) DEFAULT NULL,
  `file_size` bigint DEFAULT NULL,
  `uploaded_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: task_boards
-- =====================================================
DROP TABLE IF EXISTS `task_boards`;
CREATE TABLE `task_boards` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `created_by` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: task_card_labels
-- =====================================================
DROP TABLE IF EXISTS `task_card_labels`;
CREATE TABLE `task_card_labels` (
  `id` varchar(36) NOT NULL,
  `card_id` varchar(36) DEFAULT NULL,
  `label_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: task_cards
-- =====================================================
DROP TABLE IF EXISTS `task_cards`;
CREATE TABLE `task_cards` (
  `id` varchar(36) NOT NULL,
  `list_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `priority` varchar(20) DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `assigned_to` varchar(36) DEFAULT NULL,
  `position` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: task_checklist_items
-- =====================================================
DROP TABLE IF EXISTS `task_checklist_items`;
CREATE TABLE `task_checklist_items` (
  `id` varchar(36) NOT NULL,
  `checklist_id` varchar(36) DEFAULT NULL,
  `item_text` varchar(255) DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT 0,
  `position` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: task_checklists
-- =====================================================
DROP TABLE IF EXISTS `task_checklists`;
CREATE TABLE `task_checklists` (
  `id` varchar(36) NOT NULL,
  `card_id` varchar(36) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `position` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: task_comments
-- =====================================================
DROP TABLE IF EXISTS `task_comments`;
CREATE TABLE `task_comments` (
  `id` varchar(36) NOT NULL,
  `card_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `comment_text` text,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: task_labels
-- =====================================================
DROP TABLE IF EXISTS `task_labels`;
CREATE TABLE `task_labels` (
  `id` varchar(36) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: task_lists
-- =====================================================
DROP TABLE IF EXISTS `task_lists`;
CREATE TABLE `task_lists` (
  `id` varchar(36) NOT NULL,
  `board_id` varchar(36) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `position` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: task_time_entries
-- =====================================================
DROP TABLE IF EXISTS `task_time_entries`;
CREATE TABLE `task_time_entries` (
  `id` varchar(36) NOT NULL,
  `card_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `start_time` timestamp NULL DEFAULT NULL,
  `end_time` timestamp NULL DEFAULT NULL,
  `duration_minutes` int DEFAULT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: team_members
-- =====================================================
DROP TABLE IF EXISTS `team_members`;
CREATE TABLE `team_members` (
  `id` varchar(36) NOT NULL,
  `team_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT NULL,
  `left_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: team_performance
-- =====================================================
DROP TABLE IF EXISTS `team_performance`;
CREATE TABLE `team_performance` (
  `id` varchar(36) NOT NULL,
  `team_id` varchar(36) DEFAULT NULL,
  `month` varchar(7) DEFAULT NULL,
  `target_accounts` int DEFAULT NULL,
  `target_gross` decimal(12,2) DEFAULT NULL,
  `target_cash_in` decimal(12,2) DEFAULT NULL,
  `actual_accounts` int DEFAULT NULL,
  `actual_gross` decimal(12,2) DEFAULT NULL,
  `actual_cash_in` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: teams
-- =====================================================
DROP TABLE IF EXISTS `teams`;
CREATE TABLE `teams` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `team_lead_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: typing_indicators
-- =====================================================
DROP TABLE IF EXISTS `typing_indicators`;
CREATE TABLE `typing_indicators` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `conversation_id` varchar(36) DEFAULT NULL,
  `is_typing` tinyint(1) DEFAULT 0,
  `last_typing_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: upseller_performance
-- =====================================================
DROP TABLE IF EXISTS `upseller_performance`;
CREATE TABLE `upseller_performance` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `month` varchar(7) DEFAULT NULL,
  `target_accounts` int DEFAULT NULL,
  `target_gross` decimal(12,2) DEFAULT NULL,
  `target_cash_in` decimal(12,2) DEFAULT NULL,
  `actual_accounts` int DEFAULT NULL,
  `actual_gross` decimal(12,2) DEFAULT NULL,
  `actual_cash_in` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: upseller_targets
-- =====================================================
DROP TABLE IF EXISTS `upseller_targets`;
CREATE TABLE `upseller_targets` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `month` varchar(7) DEFAULT NULL,
  `target_accounts` int DEFAULT NULL,
  `target_gross` decimal(12,2) DEFAULT NULL,
  `target_cash_in` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: upseller_targets_management
-- =====================================================
DROP TABLE IF EXISTS `upseller_targets_management`;
CREATE TABLE `upseller_targets_management` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `month` varchar(7) DEFAULT NULL,
  `target_accounts` int DEFAULT NULL,
  `target_gross` decimal(12,2) DEFAULT NULL,
  `target_cash_in` decimal(12,2) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: upseller_team_members
-- =====================================================
DROP TABLE IF EXISTS `upseller_team_members`;
CREATE TABLE `upseller_team_members` (
  `id` varchar(36) NOT NULL,
  `team_id` varchar(36) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `role` varchar(100) DEFAULT NULL,
  `joined_at` timestamp NULL DEFAULT NULL,
  `left_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: upseller_teams
-- =====================================================
DROP TABLE IF EXISTS `upseller_teams`;
CREATE TABLE `upseller_teams` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `team_lead_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: user_permissions
-- =====================================================
DROP TABLE IF EXISTS `user_permissions`;
CREATE TABLE `user_permissions` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `permission_name` varchar(100) DEFAULT NULL,
  `can_read` tinyint(1) DEFAULT 0,
  `can_create` tinyint(1) DEFAULT 0,
  `can_update` tinyint(1) DEFAULT 0,
  `can_delete` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: user_presence
-- =====================================================
DROP TABLE IF EXISTS `user_presence`;
CREATE TABLE `user_presence` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `last_seen` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: user_profiles
-- =====================================================
DROP TABLE IF EXISTS `user_profiles`;
CREATE TABLE `user_profiles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `employee_id` varchar(36) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `attributes` json DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: user_roles
-- =====================================================
DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE `user_roles` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `role_id` varchar(36) DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT NULL,
  `assigned_by` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE: workspaces
-- =====================================================
DROP TABLE IF EXISTS `workspaces`;
CREATE TABLE `workspaces` (
  `id` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `description` text,
  `owner_id` varchar(36) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- RE-ENABLE FOREIGN KEY CHECKS
-- =====================================================
SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
-- DATA INSERTION SECTION
-- =====================================================

-- NOTE: Complete data extraction required for payment_sources
-- Use: SELECT * FROM payment_sources ORDER BY created_at;

-- NOTE: Complete data extraction required for services
-- Use: SELECT * FROM services ORDER BY created_at;

-- NOTE: Complete data extraction required for sales_dispositions
-- Use: SELECT * FROM sales_dispositions ORDER BY created_at;

-- NOTE: Complete data extraction required for projects
-- Use: SELECT * FROM projects ORDER BY created_at;

-- NOTE: Complete data extraction required for recurring_payment_schedule
-- Use: SELECT * FROM recurring_payment_schedule ORDER BY created_at;

-- NOTE: Complete data extraction required for payment_transactions
-- Use: SELECT * FROM payment_transactions ORDER BY created_at;

-- NOTE: Complete data extraction required for user_profiles
-- Use: SELECT * FROM user_profiles ORDER BY created_at;

-- NOTE: Complete data extraction required for employees
-- Use: SELECT * FROM employees ORDER BY created_at;

-- NOTE: Complete data extraction required for roles
-- Use: SELECT * FROM roles ORDER BY created_at;

-- NOTE: Complete data extraction required for user_roles
-- Use: SELECT * FROM user_roles ORDER BY assigned_at;

-- NOTE: Complete data extraction required for front_seller_performance
-- Use: SELECT * FROM front_seller_performance ORDER BY created_at;

-- NOTE: Complete data extraction required for front_seller_targets
-- Use: SELECT * FROM front_seller_targets ORDER BY created_at;

-- =====================================================
-- END OF SCHEMA EXPORT
-- =====================================================

-- =====================================================
-- DATABASE SCHEMA EXPORT COMPLETE
-- =====================================================
-- 
-- This file contains:
-- 1. Complete database schema for MySQL (60+ tables)
-- 2. All table structures with proper MySQL data types
-- 3. MySQL-compatible syntax and collation
-- 4. Instructions for complete data extraction
-- 
-- IMPORTANT: This is a SCHEMA-ONLY export
-- To get complete data, run the SQL queries listed above for each table
-- 
-- To import this database:
-- 1. Create a new MySQL database
-- 2. Run this SQL file to create the schema
-- 3. Extract complete data from Supabase using the provided queries
-- 4. Import the data into the created tables
-- 
-- Note: This is a read-only export - no changes were made to the source database
-- =====================================================

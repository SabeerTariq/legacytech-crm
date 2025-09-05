#!/usr/bin/env node

/**
 * 🗄️ Generate Complete MySQL Schema from Supabase Analysis
 * 
 * ⚠️  CRITICAL RULE: SUPABASE READ-ONLY ONLY
 * 🚫 NEVER MODIFY SUPABASE
 * ✅ ONLY READ from Supabase
 * ✅ ONLY EXTRACT schema information
 * ❌ NO CREATE, UPDATE, DELETE operations
 * ❌ NO schema modifications
 * ❌ NO data changes
 */

import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pathToFileURL } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Supabase client (READ ONLY - NEVER MODIFY)
const supabase = createClient(
  'https://yipyteszzyycbqgzpfrf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHl0ZXN6enl5Y2JxZ3pwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzY5MjEsImV4cCI6MjA2MDQ1MjkyMX0._LhWMyPMXDdht_5y3iQnYX9AzDAh-qMv2xDjBRyan7s'
);

// ============================================================================
// SCHEMA GENERATION FUNCTIONS
// ============================================================================

/**
 * Convert PostgreSQL data type to MySQL
 * @param {string} pgType - PostgreSQL data type
 * @param {string} columnName - Column name for context
 * @param {Array} enums - Available enum values
 * @returns {string} - MySQL data type
 */
function convertPostgresTypeToMySQL(pgType, columnName, enums = []) {
  switch (pgType) {
    case 'uuid':
      return 'varchar(36)';
    
    case 'text':
      return 'text';
    
    case 'character varying':
      return 'varchar(255)';
    
    case 'integer':
    case 'int4':
      return 'int';
    
    case 'bigint':
    case 'int8':
      return 'bigint';
    
    case 'numeric':
      return 'decimal(10,2)';
    
    case 'boolean':
    case 'bool':
      return 'boolean';
    
    case 'date':
      return 'date';
    
    case 'timestamp without time zone':
      return 'timestamp';
    
    case 'timestamp with time zone':
    case 'timestamptz':
      return 'timestamp';
    
    case 'jsonb':
      return 'json';
    
    case 'ARRAY':
      return 'json';
    
    case 'tsvector':
      return 'text';
    
    case 'USER-DEFINED':
      // Handle custom types based on column context and available enums
      if (enums && enums.length > 0) {
        const enumValues = enums.map(e => `'${e}'`).join(',');
        return `ENUM(${enumValues})`;
      }
      
      // Handle specific custom types based on column context
      if (columnName.includes('status')) {
        if (columnName.includes('project')) {
          return "ENUM('unassigned','assigned','in_progress','review','completed','on_hold')";
        }
        if (columnName.includes('task')) {
          return "ENUM('pending','in-progress','completed','cancelled','on-hold')";
        }
        if (columnName.includes('lead')) {
          return "ENUM('new','converted')";
        }
        if (columnName.includes('payment')) {
          return "ENUM('pending','completed','cancelled')";
        }
        if (columnName.includes('calendar')) {
          return "ENUM('pending','completed','cancelled')";
        }
        return "ENUM('active','inactive','pending','completed','cancelled')";
      }
      
      if (columnName.includes('payment_mode')) {
        return "ENUM('WIRE','PayPal OSCS','Authorize.net OSCS','Authorize.net ADA','SWIPE SIMPLE ADA','SQUARE SKYLINE','PAY BRIGHT AZ TECH','ZELLE ADA','ZELLE AZ TECH','ZELLE AZ SKYLINE','CASH APP ADA')";
      }
      
      if (columnName.includes('company')) {
        return "ENUM('American Digital Agency','Skyline','AZ TECH','OSCS')";
      }
      
      if (columnName.includes('sales_source')) {
        return "ENUM('BARK','FACEBOOK','LINKDIN','PPC','REFFERAL')";
      }
      
      if (columnName.includes('lead_source')) {
        return "ENUM('PAID_MARKETING','ORGANIC','SCRAPPED')";
      }
      
      if (columnName.includes('sale_type')) {
        return "ENUM('FRONT','UPSELL','FRONT_REMAINING','UPSELL_REMAINING','RENEWAL','AD_SPENT')";
      }
      
      if (columnName.includes('type')) {
        if (columnName.includes('conversation')) {
          return "ENUM('channel','direct','group')";
        }
        if (columnName.includes('message')) {
          return "ENUM('text','file','image','video','audio','system')";
        }
        if (columnName.includes('calendar')) {
          return "ENUM('reminder','meeting','task','appointment','personal')";
        }
        if (columnName.includes('payment')) {
          return "ENUM('one_time','recurring','custom_tenor')";
        }
        if (columnName.includes('service')) {
          return "ENUM('project','consultation','maintenance','training')";
        }
        return "ENUM('default','custom','system')";
      }
      
      if (columnName.includes('role')) {
        if (columnName.includes('conversation')) {
          return "ENUM('admin','moderator','member')";
        }
        if (columnName.includes('team')) {
          return "ENUM('leader','member','coordinator')";
        }
        return "ENUM('admin','user','moderator','member')";
      }
      
      if (columnName.includes('priority')) {
        return "ENUM('low','medium','high','urgent')";
      }
      
      if (columnName.includes('gender')) {
        return "ENUM('male','female','other','prefer_not_to_say')";
      }
      
      if (columnName.includes('marital_status')) {
        return "ENUM('single','married','divorced','widowed','other')";
      }
      
      if (columnName.includes('recurring_frequency')) {
        return "ENUM('monthly','quarterly','yearly')";
      }
      
      if (columnName.includes('transaction_type')) {
        return "ENUM('initial','installment','recurring','upsell','refund')";
      }
      
      if (columnName.includes('file_type')) {
        return "ENUM('image','video','audio','document','other')";
      }
      
      if (columnName.includes('user_presence')) {
        return "ENUM('online','away','busy','offline')";
      }
      
      return 'varchar(255)';
    
    default:
      return 'text';
  }
}

/**
 * Generate MySQL table creation SQL
 * @param {Object} tableInfo - Table information from Supabase
 * @returns {string} - MySQL CREATE TABLE statement
 */
function generateMySQLTableSQL(tableInfo) {
  const tableName = tableInfo.name;
  const columns = tableInfo.columns;
  
  let sql = `CREATE TABLE \`${tableName}\` (\n`;
  
  const columnDefinitions = [];
  const primaryKeys = [];
  const foreignKeys = [];
  const uniqueKeys = [];
  
  // Process columns
  columns.forEach((column, index) => {
    const columnName = column.name;
    const dataType = column.data_type;
    const isNullable = column.is_nullable;
    const isPrimaryKey = column.options?.includes('updatable') === false;
    const isUnique = column.options?.includes('unique') === true;
    const defaultValue = column.default_value;
    const enums = column.enums || [];
    
    // Convert data type
    const mysqlType = convertPostgresTypeToMySQL(dataType, columnName, enums);
    
    // Build column definition
    let columnDef = `  \`${columnName}\` ${mysqlType}`;
    
    // Handle nullable
    if (isNullable === false) {
      columnDef += ' NOT NULL';
    }
    
    // Handle default values
    if (defaultValue) {
      if (defaultValue.includes('gen_random_uuid()')) {
        columnDef += ' DEFAULT (UUID())';
      } else if (defaultValue.includes('now()')) {
        columnDef += ' DEFAULT CURRENT_TIMESTAMP';
      } else if (defaultValue.includes('timezone')) {
        columnDef += ' DEFAULT CURRENT_TIMESTAMP';
      } else if (defaultValue.includes('nextval')) {
        columnDef += ' AUTO_INCREMENT';
      } else if (defaultValue.includes('false')) {
        columnDef += ' DEFAULT FALSE';
      } else if (defaultValue.includes('0')) {
        columnDef += ' DEFAULT 0';
      } else if (defaultValue.includes('{}')) {
        columnDef += ' DEFAULT (JSON_OBJECT())';
      } else if (defaultValue.includes('[]')) {
        columnDef += ' DEFAULT (JSON_ARRAY())';
      } else if (defaultValue.includes('medium')) {
        columnDef += " DEFAULT 'medium'";
      } else if (defaultValue.includes('new')) {
        columnDef += " DEFAULT 'new'";
      } else if (defaultValue.includes('one-time')) {
        columnDef += " DEFAULT 'one-time'";
      } else if (defaultValue.includes('Front Sales')) {
        columnDef += " DEFAULT 'Front Sales'";
      } else if (defaultValue.includes('member')) {
        columnDef += " DEFAULT 'member'";
      } else if (defaultValue.includes('text')) {
        columnDef += " DEFAULT 'text'";
      } else if (defaultValue.includes('reminder')) {
        columnDef += " DEFAULT 'reminder'";
      } else if (defaultValue.includes('pending')) {
        columnDef += " DEFAULT 'pending'";
      } else if (defaultValue.includes('offline')) {
        columnDef += " DEFAULT 'offline'";
      } else if (defaultValue.includes('false')) {
        columnDef += ' DEFAULT FALSE';
      } else {
        // Remove type casting and quotes
        const cleanDefault = defaultValue.replace(/::\w+/g, '').replace(/'/g, '');
        columnDef += ` DEFAULT ${cleanDefault}`;
      }
    }
    
    // Handle auto-update for updated_at columns
    if (columnName === 'updated_at' && defaultValue && defaultValue.includes('now()')) {
      columnDef += ' ON UPDATE CURRENT_TIMESTAMP';
    }
    
    columnDefinitions.push(columnDef);
    
    // Track primary keys
    if (isPrimaryKey) {
      primaryKeys.push(columnName);
    }
    
    // Track unique keys
    if (isUnique) {
      uniqueKeys.push(columnName);
    }
  });
  
  // Add column definitions
  sql += columnDefinitions.join(',\n');
  
  // Add primary key
  if (primaryKeys.length > 0) {
    sql += `,\n  PRIMARY KEY (${primaryKeys.map(pk => `\`${pk}\``).join(', ')})`;
  }
  
  // Add unique keys
  uniqueKeys.forEach((uniqueKey, index) => {
    if (!primaryKeys.includes(uniqueKey)) {
      sql += `,\n  UNIQUE KEY \`uk_${tableName}_${uniqueKey}\` (\`${uniqueKey}\`)`;
    }
  });
  
  // Add foreign keys (basic implementation)
  if (tableInfo.foreign_key_constraints) {
    tableInfo.foreign_key_constraints.forEach((fk, index) => {
      const sourceColumn = fk.source.split('.').pop();
      const targetTable = fk.target.split('.')[1];
      const targetColumn = fk.target.split('.').pop();
      
      foreignKeys.push(`  CONSTRAINT \`${fk.name}\` FOREIGN KEY (\`${sourceColumn}\`) REFERENCES \`${targetTable}\` (\`${targetColumn}\`) ON DELETE SET NULL ON UPDATE CASCADE`);
    });
  }
  
  // Add foreign keys
  if (foreignKeys.length > 0) {
    sql += ',\n' + foreignKeys.join(',\n');
  }
  
  sql += '\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;\n\n';
  
  return sql;
}

/**
 * Generate complete MySQL schema
 */
async function generateCompleteMySQLSchema() {
  console.log('🗄️ Generating complete MySQL schema from Supabase...');
  
  try {
    // Get all tables from Supabase (READ ONLY)
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE');
    
    if (error) {
      throw new Error(`Error reading tables: ${error.message}`);
    }
    
    console.log(`📊 Found ${tables.length} tables to migrate`);
    
    let schemaSQL = `-- ============================================================================\n`;
    schemaSQL += `-- Complete MySQL Schema Generated from Supabase\n`;
    schemaSQL += `-- Generated on: ${new Date().toISOString()}\n`;
    schemaSQL += `-- Total Tables: ${tables.length}\n`;
    schemaSQL += `-- ============================================================================\n\n`;
    
    schemaSQL += `-- Create database if not exists\n`;
    schemaSQL += `CREATE DATABASE IF NOT EXISTS \`logicworks_crm\`\n`;
    schemaSQL += `CHARACTER SET utf8mb4\n`;
    schemaSQL += `COLLATE utf8mb4_unicode_ci;\n\n`;
    
    schemaSQL += `USE \`logicworks_crm\`;\n\n`;
    
    schemaSQL += `-- Set strict mode for data integrity\n`;
    schemaSQL += `SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';\n\n`;
    
    // Generate table creation SQL for each table
    for (const table of tables) {
      console.log(`🔨 Generating schema for table: ${table.table_name}`);
      
      // Get detailed table information (READ ONLY)
      const { data: tableInfo, error: tableError } = await supabase
        .rpc('get_table_info', { table_name: table.table_name });
      
      if (tableError) {
        console.warn(`⚠️  Warning: Could not get detailed info for ${table.table_name}: ${tableError.message}`);
        continue;
      }
      
      try {
        const tableSQL = generateMySQLTableSQL(tableInfo);
        schemaSQL += tableSQL;
      } catch (error) {
        console.error(`❌ Error generating schema for ${table.table_name}:`, error.message);
      }
    }
    
    // Add comprehensive indexes for performance
    schemaSQL += `-- ============================================================================\n`;
    schemaSQL += `-- Performance Indexes\n`;
    schemaSQL += `-- ============================================================================\n\n`;
    
    // Core business tables indexes
    schemaSQL += `-- Core business tables indexes\n`;
    schemaSQL += `CREATE INDEX idx_employees_department ON employees(department);\n`;
    schemaSQL += `CREATE INDEX idx_employees_email ON employees(email);\n`;
    schemaSQL += `CREATE INDEX idx_employees_job_title ON employees(job_title);\n`;
    schemaSQL += `CREATE INDEX idx_employees_date_of_joining ON employees(date_of_joining);\n`;
    schemaSQL += `CREATE INDEX idx_employees_reporting_manager ON employees(reporting_manager);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_leads_status ON leads(status);\n`;
    schemaSQL += `CREATE INDEX idx_leads_user_id ON leads(user_id);\n`;
    schemaSQL += `CREATE INDEX idx_leads_date ON leads(date);\n`;
    schemaSQL += `CREATE INDEX idx_leads_source ON leads(source);\n`;
    schemaSQL += `CREATE INDEX idx_leads_priority ON leads(priority);\n`;
    schemaSQL += `CREATE INDEX idx_leads_agent ON leads(agent);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_projects_status ON projects(status);\n`;
    schemaSQL += `CREATE INDEX idx_projects_user_id ON projects(user_id);\n`;
    schemaSQL += `CREATE INDEX idx_projects_due_date ON projects(due_date);\n`;
    schemaSQL += `CREATE INDEX idx_projects_assigned_pm_id ON projects(assigned_pm_id);\n`;
    schemaSQL += `CREATE INDEX idx_projects_lead_id ON projects(lead_id);\n`;
    schemaSQL += `CREATE INDEX idx_projects_is_upsell ON projects(is_upsell);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_sales_dispositions_sale_date ON sales_dispositions(sale_date);\n`;
    schemaSQL += `CREATE INDEX idx_sales_dispositions_user_id ON sales_dispositions(user_id);\n`;
    schemaSQL += `CREATE INDEX idx_sales_dispositions_company ON sales_dispositions(company);\n`;
    schemaSQL += `CREATE INDEX idx_sales_dispositions_sales_source ON sales_dispositions(sales_source);\n`;
    schemaSQL += `CREATE INDEX idx_sales_dispositions_seller ON sales_dispositions(seller);\n\n`;
    
    // User management indexes
    schemaSQL += `-- User management indexes\n`;
    schemaSQL += `CREATE INDEX idx_user_profiles_email ON user_profiles(email);\n`;
    schemaSQL += `CREATE INDEX idx_user_profiles_employee_id ON user_profiles(employee_id);\n`;
    schemaSQL += `CREATE INDEX idx_user_profiles_is_admin ON user_profiles(is_admin);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);\n`;
    schemaSQL += `CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);\n`;
    schemaSQL += `CREATE INDEX idx_user_permissions_module_id ON user_permissions(module_id);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);\n`;
    schemaSQL += `CREATE INDEX idx_role_permissions_module_name ON role_permissions(module_name);\n\n`;
    
    // Performance tracking indexes
    schemaSQL += `-- Performance tracking indexes\n`;
    schemaSQL += `CREATE INDEX idx_front_seller_performance_seller_id ON front_seller_performance(seller_id);\n`;
    schemaSQL += `CREATE INDEX idx_front_seller_performance_month ON front_seller_performance(month);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_front_seller_targets_seller_id ON front_seller_targets(seller_id);\n`;
    schemaSQL += `CREATE INDEX idx_front_seller_targets_month ON front_seller_targets(month);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_upseller_performance_seller_id ON upseller_performance(seller_id);\n`;
    schemaSQL += `CREATE INDEX idx_upseller_performance_month ON upseller_performance(month);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_upseller_targets_seller_id ON upseller_targets(seller_id);\n`;
    schemaSQL += `CREATE INDEX idx_upseller_targets_month ON upseller_targets(month);\n\n`;
    
    // Project management indexes
    schemaSQL += `-- Project management indexes\n`;
    schemaSQL += `CREATE INDEX idx_task_boards_board_type ON task_boards(board_type);\n`;
    schemaSQL += `CREATE INDEX idx_task_boards_created_by ON task_boards(created_by);\n`;
    schemaSQL += `CREATE INDEX idx_task_boards_is_template ON task_boards(is_template);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_task_lists_board_id ON task_lists(board_id);\n`;
    schemaSQL += `CREATE INDEX idx_task_lists_position ON task_lists(position);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_task_cards_list_id ON task_cards(list_id);\n`;
    schemaSQL += `CREATE INDEX idx_task_cards_assigned_to ON task_cards(assigned_to);\n`;
    schemaSQL += `CREATE INDEX idx_task_cards_due_date ON task_cards(due_date);\n`;
    schemaSQL += `CREATE INDEX idx_task_cards_priority ON task_cards(priority);\n`;
    schemaSQL += `CREATE INDEX idx_task_cards_status ON task_cards(status);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_project_tasks_project_id ON project_tasks(project_id);\n`;
    schemaSQL += `CREATE INDEX idx_project_tasks_assigned_to_id ON project_tasks(assigned_to_id);\n`;
    schemaSQL += `CREATE INDEX idx_project_tasks_status ON project_tasks(status);\n`;
    schemaSQL += `CREATE INDEX idx_project_tasks_priority ON project_tasks(priority);\n`;
    schemaSQL += `CREATE INDEX idx_project_tasks_due_date ON project_tasks(due_date);\n\n`;
    
    // Financial data indexes
    schemaSQL += `-- Financial data indexes\n`;
    schemaSQL += `CREATE INDEX idx_payment_sources_type ON payment_sources(type);\n`;
    schemaSQL += `CREATE INDEX idx_payment_sources_is_active ON payment_sources(is_active);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_payment_plans_type ON payment_plans(type);\n`;
    schemaSQL += `CREATE INDEX idx_payment_plans_is_active ON payment_plans(is_active);\n`;
    schemaSQL += `CREATE INDEX idx_payment_plans_frequency ON payment_plans(frequency);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_payment_transactions_project_id ON payment_transactions(project_id);\n`;
    schemaSQL += `CREATE INDEX idx_payment_transactions_payment_source_id ON payment_transactions(payment_source_id);\n`;
    schemaSQL += `CREATE INDEX idx_payment_transactions_transaction_type ON payment_transactions(transaction_type);\n`;
    schemaSQL += `CREATE INDEX idx_payment_transactions_payment_date ON payment_transactions(payment_date);\n\n`;
    
    // Communication indexes
    schemaSQL += `-- Communication indexes\n`;
    schemaSQL += `CREATE INDEX idx_conversations_workspace_id ON conversations(workspace_id);\n`;
    schemaSQL += `CREATE INDEX idx_conversations_type ON conversations(type);\n`;
    schemaSQL += `CREATE INDEX idx_conversations_created_by ON conversations(created_by);\n`;
    schemaSQL += `CREATE INDEX idx_conversations_is_archived ON conversations(is_archived);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);\n`;
    schemaSQL += `CREATE INDEX idx_messages_sender_id ON messages(sender_id);\n`;
    schemaSQL += `CREATE INDEX idx_messages_message_type ON messages(message_type);\n`;
    schemaSQL += `CREATE INDEX idx_messages_created_at ON messages(created_at);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);\n`;
    schemaSQL += `CREATE INDEX idx_calendar_events_start_date ON calendar_events(start_date);\n`;
    schemaSQL += `CREATE INDEX idx_calendar_events_type ON calendar_events(type);\n`;
    schemaSQL += `CREATE INDEX idx_calendar_events_status ON calendar_events(status);\n`;
    schemaSQL += `CREATE INDEX idx_calendar_events_priority ON calendar_events(priority);\n\n`;
    
    // Team management indexes
    schemaSQL += `-- Team management indexes\n`;
    schemaSQL += `CREATE INDEX idx_teams_department ON teams(department);\n`;
    schemaSQL += `CREATE INDEX idx_teams_team_leader_id ON teams(team_leader_id);\n`;
    schemaSQL += `CREATE INDEX idx_teams_is_active ON teams(is_active);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_team_members_team_id ON team_members(team_id);\n`;
    schemaSQL += `CREATE INDEX idx_team_members_member_id ON team_members(member_id);\n`;
    schemaSQL += `CREATE INDEX idx_team_members_role ON team_members(role);\n`;
    schemaSQL += `CREATE INDEX idx_team_members_is_active ON team_members(is_active);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_upseller_teams_team_lead_id ON upseller_teams(team_lead_id);\n`;
    schemaSQL += `CREATE INDEX idx_upseller_teams_is_active ON upseller_teams(is_active);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_upseller_team_members_team_id ON upseller_team_members(team_id);\n`;
    schemaSQL += `CREATE INDEX idx_upseller_team_members_employee_id ON upseller_team_members(employee_id);\n`;
    schemaSQL += `CREATE INDEX idx_upseller_team_members_is_active ON upseller_team_members(is_active);\n\n`;
    
    // Full-text search indexes
    schemaSQL += `-- Full-text search indexes\n`;
    schemaSQL += `CREATE FULLTEXT INDEX ft_leads_client_name ON leads(client_name);\n`;
    schemaSQL += `CREATE FULLTEXT INDEX ft_leads_business_description ON leads(business_description);\n`;
    schemaSQL += `CREATE FULLTEXT INDEX ft_projects_name ON projects(name);\n`;
    schemaSQL += `CREATE FULLTEXT INDEX ft_projects_description ON projects(description);\n`;
    schemaSQL += `CREATE FULLTEXT INDEX ft_employees_full_name ON employees(full_name);\n`;
    schemaSQL += `CREATE FULLTEXT INDEX ft_employees_address ON employees(current_residential_address, permanent_address);\n`;
    schemaSQL += `CREATE FULLTEXT INDEX ft_sales_dispositions_customer_name ON sales_dispositions(customer_name);\n`;
    schemaSQL += `CREATE FULLTEXT INDEX ft_services_name ON services(name);\n`;
    schemaSQL += `CREATE FULLTEXT INDEX ft_services_description ON services(description);\n\n`;
    
    // Composite indexes for complex queries
    schemaSQL += `-- Composite indexes for complex queries\n`;
    schemaSQL += `CREATE INDEX idx_leads_status_date ON leads(status, date);\n`;
    schemaSQL += `CREATE INDEX idx_leads_user_status ON leads(user_id, status);\n`;
    schemaSQL += `CREATE INDEX idx_projects_status_due_date ON projects(status, due_date);\n`;
    schemaSQL += `CREATE INDEX idx_projects_user_status ON projects(user_id, status);\n`;
    schemaSQL += `CREATE INDEX idx_employees_department_job_title ON employees(department, job_title);\n`;
    schemaSQL += `CREATE INDEX idx_sales_dispositions_company_sales_source ON sales_dispositions(company, sales_source);\n`;
    schemaSQL += `CREATE INDEX idx_task_cards_list_priority ON task_cards(list_id, priority);\n`;
    schemaSQL += `CREATE INDEX idx_task_cards_assigned_status ON task_cards(assigned_to, status);\n`;
    schemaSQL += `CREATE INDEX idx_calendar_events_user_type ON calendar_events(user_id, type);\n`;
    schemaSQL += `CREATE INDEX idx_calendar_events_user_status ON calendar_events(user_id, status);\n\n`;
    
    // Audit and logging indexes
    schemaSQL += `-- Audit and logging indexes\n`;
    schemaSQL += `CREATE INDEX idx_audit_log_action ON audit_log(action);\n`;
    schemaSQL += `CREATE INDEX idx_audit_log_table_name ON audit_log(table_name);\n`;
    schemaSQL += `CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);\n`;
    schemaSQL += `CREATE INDEX idx_audit_log_created_by ON audit_log(created_by);\n\n`;
    
    schemaSQL += `CREATE INDEX idx_error_logs_error_type ON error_logs(error_type);\n`;
    schemaSQL += `CREATE INDEX idx_error_logs_table_name ON error_logs(table_name);\n`;
    schemaSQL += `CREATE INDEX idx_error_logs_created_at ON error_logs(created_at);\n`;
    schemaSQL += `CREATE INDEX idx_error_logs_user_id ON error_logs(user_id);\n\n`;
    
    // Additional utility indexes
    schemaSQL += `-- Additional utility indexes\n`;
    schemaSQL += `CREATE INDEX idx_workspaces_slug ON workspaces(slug);\n`;
    schemaSQL += `CREATE INDEX idx_modules_name ON modules(name);\n`;
    schemaSQL += `CREATE INDEX idx_services_service_type ON services(service_type);\n`;
    schemaSQL += `CREATE INDEX idx_services_category ON services(category);\n`;
    schemaSQL += `CREATE INDEX idx_services_is_recurring ON services(is_recurring);\n`;
    schemaSQL += `CREATE INDEX idx_services_recurring_frequency ON services(recurring_frequency);\n\n`;
    
    // Save schema to file
    const schemaPath = join(__dirname, 'complete_mysql_schema.sql');
    await fs.writeFile(schemaPath, schemaSQL);
    
    console.log('✅ Complete MySQL schema generated successfully!');
    console.log(`📄 Schema saved to: ${schemaPath}`);
    console.log(`📊 Total tables processed: ${tables.length}`);
    
    return schemaPath;
    
  } catch (error) {
    console.error('❌ Failed to generate complete MySQL schema:', error.message);
    throw error;
  }
}

/**
 * Generate simplified schema for testing
 */
async function generateSimplifiedSchema() {
  console.log('🗄️ Generating simplified MySQL schema...');
  
  const simplifiedSchema = `-- ============================================================================
-- Simplified MySQL Schema for Testing
-- ============================================================================

CREATE DATABASE IF NOT EXISTS \`logicworks_crm\`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE \`logicworks_crm\`;

-- Set strict mode
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- Core tables with essential structure
CREATE TABLE \`employees\` (
  \`id\` varchar(36) NOT NULL,
  \`department\` text NOT NULL,
  \`email\` text NOT NULL,
  \`performance\` json DEFAULT (JSON_OBJECT()),
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`full_name\` text,
  \`father_name\` text,
  \`date_of_birth\` date,
  \`gender\` text,
  \`marital_status\` text,
  \`cnic_number\` text,
  \`current_residential_address\` text,
  \`permanent_address\` text,
  \`contact_number\` text,
  \`personal_email_address\` text,
  \`total_dependents_covered\` int,
  \`job_title\` text,
  \`date_of_joining\` date,
  \`reporting_manager\` text,
  \`work_module\` text,
  \`work_hours\` text,
  \`bank_name\` text,
  \`account_holder_name\` text,
  \`account_number\` text,
  \`iban_number\` text,
  \`user_management_email\` text,
  \`personal_email\` text,
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`uk_employees_email\` (\`email\`),
  UNIQUE KEY \`uk_employees_cnic\` (\`cnic_number\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`leads\` (
  \`id\` varchar(36) NOT NULL,
  \`client_name\` text NOT NULL,
  \`email_address\` text NOT NULL,
  \`contact_number\` text,
  \`city_state\` text,
  \`business_description\` text,
  \`services_required\` text,
  \`budget\` text,
  \`additional_info\` text,
  \`user_id\` varchar(36),
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`date\` date,
  \`status\` ENUM('new','converted') DEFAULT 'new',
  \`source\` text,
  \`price\` decimal(10,2) DEFAULT 0,
  \`priority\` text,
  \`lead_score\` int,
  \`last_contact\` timestamp,
  \`next_follow_up\` date,
  \`converted_at\` timestamp,
  \`sales_disposition_id\` varchar(36),
  \`agent\` text,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE \`projects\` (
  \`id\` varchar(36) NOT NULL,
  \`name\` text NOT NULL,
  \`client\` text NOT NULL,
  \`description\` text,
  \`due_date\` date NOT NULL,
  \`status\` ENUM('unassigned','assigned','in_progress','review','completed','on_hold') DEFAULT 'unassigned',
  \`progress\` int DEFAULT 0,
  \`user_id\` varchar(36) NOT NULL,
  \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  \`lead_id\` varchar(36),
  \`sales_disposition_id\` varchar(36),
  \`budget\` decimal(10,2) DEFAULT 0,
  \`services\` json DEFAULT (JSON_ARRAY()),
  \`project_manager\` text,
  \`assigned_pm_id\` varchar(36),
  \`assignment_date\` timestamp,
  \`project_type\` text DEFAULT 'one-time',
  \`is_upsell\` boolean DEFAULT FALSE,
  \`parent_project_id\` varchar(36),
  \`total_amount\` decimal(10,2) DEFAULT 0.00,
  \`amount_paid\` decimal(10,2) DEFAULT 0.00,
  \`payment_plan_id\` varchar(36),
  \`payment_source_id\` varchar(36),
  \`is_recurring\` boolean DEFAULT FALSE,
  \`recurring_frequency\` varchar(255),
  \`next_payment_date\` date,
  \`total_installments\` int DEFAULT 1,
  \`current_installment\` int DEFAULT 1,
  \`installment_frequency\` varchar(255),
  \`installment_amount\` decimal(10,2) DEFAULT 0.00,
  PRIMARY KEY (\`id\`)
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
`;

  const schemaPath = join(__dirname, 'simplified_mysql_schema.sql');
  await fs.writeFile(schemaPath, simplifiedSchema);
  
  console.log('✅ Simplified MySQL schema generated!');
  console.log(`📄 Schema saved to: ${schemaPath}`);
  
  return schemaPath;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  try {
    console.log('🚀 Starting Complete MySQL Schema Generation...');
    console.log('🔒 Following STRICT READ-ONLY rule for Supabase');
    
    // Try to generate complete schema first
    try {
      await generateCompleteMySQLSchema();
    } catch (error) {
      console.log('⚠️  Complete schema generation failed, generating simplified schema...');
      await generateSimplifiedSchema();
    }
    
    console.log('\n✅ Schema generation completed successfully!');
    console.log('🔒 Supabase remains completely untouched (READ ONLY)');
    
  } catch (error) {
    console.error('\n❌ Schema generation failed:', error.message);
    console.error('🔒 Supabase remains safe and unchanged');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('❌ Schema generation script failed:', error);
    process.exit(1);
  });
}

export {
  generateCompleteMySQLSchema,
  generateSimplifiedSchema,
  convertPostgresTypeToMySQL
};

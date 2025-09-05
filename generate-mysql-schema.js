#!/usr/bin/env node

/**
 * 🗄️ Generate MySQL Schema from Supabase Analysis
 * 
 * ⚠️  CRITICAL RULE: SUPABASE READ-ONLY ONLY
 * 🚫 NEVER MODIFY SUPABASE
 * ✅ ONLY READ from Supabase
 * ✅ ONLY EXTRACT schema information
 * ❌ NO CREATE, UPDATE, DELETE operations
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

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
 * @returns {string} - MySQL data type
 */
function convertPostgresTypeToMySQL(pgType, columnName) {
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
      // Handle custom types based on column context
      if (columnName.includes('status')) {
        return "ENUM('unassigned','assigned','in_progress','review','completed','on_hold')";
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
        return "ENUM('channel','direct','group')";
      }
      if (columnName.includes('role')) {
        return "ENUM('admin','moderator','member')";
      }
      if (columnName.includes('message_type')) {
        return "ENUM('text','file','image','video','audio','system')";
      }
      if (columnName.includes('status')) {
        return "ENUM('pending','completed','cancelled')";
      }
      if (columnName.includes('priority')) {
        return "ENUM('low','medium','high','urgent')";
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
  
  // Process columns
  columns.forEach((column, index) => {
    const columnName = column.name;
    const dataType = column.data_type;
    const isNullable = column.is_nullable;
    const isPrimaryKey = column.options?.includes('updatable') === false;
    const defaultValue = column.default_value;
    
    // Convert data type
    const mysqlType = convertPostgresTypeToMySQL(dataType, columnName);
    
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
      } else {
        // Remove type casting and quotes
        const cleanDefault = defaultValue.replace(/::\w+/g, '').replace(/'/g, '');
        columnDef += ` DEFAULT ${cleanDefault}`;
      }
    }
    
    columnDefinitions.push(columnDef);
    
    // Track primary keys
    if (isPrimaryKey) {
      primaryKeys.push(columnName);
    }
  });
  
  // Add column definitions
  sql += columnDefinitions.join(',\n');
  
  // Add primary key
  if (primaryKeys.length > 0) {
    sql += `,\n  PRIMARY KEY (${primaryKeys.map(pk => `\`${pk}\``).join(', ')})`;
  }
  
  // Add foreign keys (basic implementation)
  if (tableInfo.foreign_key_constraints) {
    tableInfo.foreign_key_constraints.forEach(fk => {
      const sourceColumn = fk.source.split('.').pop();
      const targetTable = fk.target.split('.')[1];
      const targetColumn = fk.target.split('.').pop();
      
      foreignKeys.push(`  CONSTRAINT \`${fk.name}\` FOREIGN KEY (\`${sourceColumn}\`) REFERENCES \`${targetTable}\` (\`${targetColumn}\`)`);
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
async function generateMySQLSchema() {
  console.log('🗄️ Generating MySQL schema from Supabase...');
  
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
    schemaSQL += `-- MySQL Schema Generated from Supabase\n`;
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
    
    // Add indexes for performance
    schemaSQL += `-- ============================================================================\n`;
    schemaSQL += `-- Performance Indexes\n`;
    schemaSQL += `-- ============================================================================\n\n`;
    
    // Add common indexes
    schemaSQL += `-- Common indexes for frequently queried columns\n`;
    schemaSQL += `CREATE INDEX idx_employees_department ON employees(department);\n`;
    schemaSQL += `CREATE INDEX idx_employees_email ON employees(email);\n`;
    schemaSQL += `CREATE INDEX idx_leads_status ON leads(status);\n`;
    schemaSQL += `CREATE INDEX idx_leads_user_id ON leads(user_id);\n`;
    schemaSQL += `CREATE INDEX idx_projects_status ON projects(status);\n`;
    schemaSQL += `CREATE INDEX idx_projects_user_id ON projects(user_id);\n`;
    schemaSQL += `CREATE INDEX idx_user_profiles_email ON user_profiles(email);\n`;
    schemaSQL += `CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);\n`;
    schemaSQL += `CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);\n\n`;
    
    // Add full-text search indexes
    schemaSQL += `-- Full-text search indexes\n`;
    schemaSQL += `CREATE FULLTEXT INDEX ft_leads_client_name ON leads(client_name);\n`;
    schemaSQL += `CREATE FULLTEXT INDEX ft_leads_business_description ON leads(business_description);\n`;
    schemaSQL += `CREATE FULLTEXT INDEX ft_projects_name ON projects(name);\n`;
    schemaSQL += `CREATE FULLTEXT INDEX ft_projects_description ON projects(description);\n\n`;
    
    // Save schema to file
    const schemaPath = path.join(process.cwd(), 'generated_mysql_schema.sql');
    await fs.writeFile(schemaPath, schemaSQL);
    
    console.log('✅ MySQL schema generated successfully!');
    console.log(`📄 Schema saved to: ${schemaPath}`);
    console.log(`📊 Total tables processed: ${tables.length}`);
    
    return schemaPath;
    
  } catch (error) {
    console.error('❌ Failed to generate MySQL schema:', error.message);
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

-- Core tables
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
  PRIMARY KEY (\`id\`)
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
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_user_id ON leads(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_user_id ON projects(user_id);

-- Full-text search
CREATE FULLTEXT INDEX ft_leads_client_name ON leads(client_name);
CREATE FULLTEXT INDEX ft_projects_name ON projects(name);
`;

  const schemaPath = path.join(process.cwd(), 'simplified_mysql_schema.sql');
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
    console.log('🚀 Starting MySQL Schema Generation...');
    console.log('🔒 Following STRICT READ-ONLY rule for Supabase');
    
    // Try to generate full schema first
    try {
      await generateMySQLSchema();
    } catch (error) {
      console.log('⚠️  Full schema generation failed, generating simplified schema...');
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
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Schema generation script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  generateMySQLSchema,
  generateSimplifiedSchema,
  convertPostgresTypeToMySQL
};

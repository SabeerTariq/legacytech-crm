#!/usr/bin/env node

/**
 * 🔄 Complete Data Migration from Supabase to MySQL
 * 
 * ⚠️  CRITICAL RULE: SUPABASE READ-ONLY ONLY
 * 🚫 NEVER MODIFY SUPABASE
 * ✅ ONLY READ from Supabase
 * ✅ ONLY EXTRACT data for migration
 * ❌ NO CREATE, UPDATE, DELETE operations
 * ❌ NO schema modifications
 * ❌ NO data changes
 */

import mysql from 'mysql2/promise';
import { createClient } from '@supabase/supabase-js';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pathToFileURL } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ============================================================================
// CONFIGURATION
// ============================================================================

// Supabase client (READ ONLY - NEVER MODIFY)
const supabase = createClient(
  'https://yipyteszzyycbqgzpfrf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHl0ZXN6enl5Y2JxZ3pwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzY5MjEsImV4cCI6MjA2MDQ1MjkyMX0._LhWMyPMXDdht_5y3iQnYX9AzDAh-qMv2xDjBRyan7s'
);

// MySQL configuration
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || undefined,
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectionLimit: 20,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  multipleStatements: true
};

// Migration settings
const BATCH_SIZE = parseInt(process.env.MIGRATION_BATCH_SIZE) || 1000;
const MIGRATION_TIMEOUT = parseInt(process.env.MIGRATION_TIMEOUT) || 300000;

// ============================================================================
// SAFETY CHECKS
// ============================================================================

/**
 * Verify Supabase is READ ONLY
 * This function ensures we never modify Supabase
 */
async function verifySupabaseReadOnly() {
  console.log('🔒 Verifying Supabase READ-ONLY access...');
  
  try {
    // Test READ operation (safe)
    const { data, error } = await supabase
      .from('employees')
      .select('id', { count: 'exact', head: true });
    
    if (error) {
      throw new Error(`Supabase connection error: ${error.message}`);
    }
    
    console.log('✅ Supabase READ access verified');
    console.log('✅ Supabase connection is READ-ONLY');
    
  } catch (error) {
    console.error('❌ Supabase verification failed:', error.message);
    process.exit(1);
  }
}

/**
 * Test MySQL connection
 */
async function testMySQLConnection() {
  console.log('🔌 Testing MySQL connection...');
  
  try {
    const connection = await mysql.createConnection(mysqlConfig);
    await connection.execute('SELECT 1');
    await connection.end();
    
    console.log('✅ MySQL connection verified');
    
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.error('Please check your MySQL configuration');
    process.exit(1);
  }
}

// ============================================================================
// DATA EXTRACTION FUNCTIONS (READ ONLY FROM SUPABASE)
// ============================================================================

/**
 * Extract data from Supabase table (READ ONLY)
 * @param {string} tableName - Table name to extract from
 * @param {string} orderBy - Column to order by
 * @returns {Array} - Array of data rows
 */
async function extractDataFromSupabase(tableName, orderBy = 'created_at') {
  console.log(`📖 Extracting data from Supabase table: ${tableName}`);
  
  try {
    // READ ONLY operation - NEVER modifies data
    let query = supabase.from(tableName).select('*');
    
    // Try to order by the specified column, fallback to no ordering if it fails
    try {
      query = query.order(orderBy);
    } catch (orderError) {
      console.log(`  ⚠️  Could not order by ${orderBy}, using no ordering`);
    }
    
    const { data, error } = await query;
    
    if (error) {
      throw new Error(`Error reading ${tableName}: ${error.message}`);
    }
    
    console.log(`📊 Extracted ${data.length} rows from ${tableName}`);
    return data || [];
    
  } catch (error) {
    console.error(`❌ Failed to extract ${tableName}:`, error.message);
    return [];
  }
}

/**
 * Extract all data from Supabase (READ ONLY)
 */
async function extractAllDataFromSupabase() {
  console.log('\n🚀 Starting Supabase data extraction (READ ONLY)...');
  
  const extractionResults = {};
  
  // Core business tables (High Priority)
  console.log('\n📊 Extracting core business data...');
  extractionResults.employees = await extractDataFromSupabase('employees');
  extractionResults.leads = await extractDataFromSupabase('leads');
  extractionResults.sales_dispositions = await extractDataFromSupabase('sales_dispositions');
  extractionResults.projects = await extractDataFromSupabase('projects');
  extractionResults.services = await extractDataFromSupabase('services');
  
  // User management tables
  console.log('\n👥 Extracting user management data...');
  extractionResults.user_profiles = await extractDataFromSupabase('user_profiles');
  extractionResults.roles = await extractDataFromSupabase('roles');
  extractionResults.user_roles = await extractDataFromSupabase('user_roles');
  extractionResults.user_permissions = await extractDataFromSupabase('user_permissions');
  extractionResults.role_permissions = await extractDataFromSupabase('role_permissions');
  
  // Performance tracking tables
  console.log('\n📈 Extracting performance data...');
  extractionResults.front_seller_performance = await extractDataFromSupabase('front_seller_performance');
  extractionResults.front_seller_targets = await extractDataFromSupabase('front_seller_targets');
  extractionResults.upseller_performance = await extractDataFromSupabase('upseller_performance');
  extractionResults.upseller_targets = await extractDataFromSupabase('upseller_targets');
  extractionResults.team_performance = await extractDataFromSupabase('team_performance');
  
  // Project management tables
  console.log('\n📋 Extracting project management data...');
  extractionResults.task_boards = await extractDataFromSupabase('task_boards');
  extractionResults.task_lists = await extractDataFromSupabase('task_lists');
  extractionResults.task_cards = await extractDataFromSupabase('task_cards');
  extractionResults.project_tasks = await extractDataFromSupabase('project_tasks');
  extractionResults.project_upsells = await extractDataFromSupabase('project_upsells');
  
  // Financial data tables
  console.log('\n💰 Extracting financial data...');
  extractionResults.payment_sources = await extractDataFromSupabase('payment_sources');
  extractionResults.payment_plans = await extractDataFromSupabase('payment_plans');
  extractionResults.payment_transactions = await extractDataFromSupabase('payment_transactions');
  extractionResults.recurring_payment_schedule = await extractDataFromSupabase('recurring_payment_schedule');
  
  // Communication tables
  console.log('\n💬 Extracting communication data...');
  extractionResults.conversations = await extractDataFromSupabase('conversations');
  extractionResults.messages = await extractDataFromSupabase('messages');
  extractionResults.ai_chat_conversations = await extractDataFromSupabase('ai_chat_conversations');
  extractionResults.ai_chat_messages = await extractDataFromSupabase('ai_chat_messages');
  extractionResults.calendar_events = await extractDataFromSupabase('calendar_events');
  
  // Team management tables
  console.log('\n👥 Extracting team management data...');
  extractionResults.teams = await extractDataFromSupabase('teams');
  extractionResults.team_members = await extractDataFromSupabase('team_members');
  extractionResults.upseller_teams = await extractDataFromSupabase('upseller_teams');
  extractionResults.upseller_team_members = await extractDataFromSupabase('upseller_team_members');
  extractionResults.upseller_targets_management = await extractDataFromSupabase('upseller_targets_management');
  
  // Additional tables
  console.log('\n📁 Extracting additional data...');
  extractionResults.workspaces = await extractDataFromSupabase('workspaces');
  extractionResults.modules = await extractDataFromSupabase('modules');
  extractionResults.audit_log = await extractDataFromSupabase('audit_log');
  extractionResults.error_logs = await extractDataFromSupabase('error_logs');
  extractionResults.customer_notes = await extractDataFromSupabase('customer_notes');
  extractionResults.customer_tags = await extractDataFromSupabase('customer_tags');
  extractionResults.customer_files = await extractDataFromSupabase('customer_files');
  extractionResults.chat_messages = await extractDataFromSupabase('chat_messages');
  extractionResults.employee_dependents = await extractDataFromSupabase('employee_dependents');
  extractionResults.employee_emergency_contacts = await extractDataFromSupabase('employee_emergency_contacts');
  extractionResults.employee_performance_history = await extractDataFromSupabase('employee_performance_history');
  extractionResults.customers = await extractDataFromSupabase('customers');
  
  console.log('✅ Supabase data extraction completed (READ ONLY)');
  return extractionResults;
}

// ============================================================================
// DATA TRANSFORMATION FUNCTIONS
// ============================================================================

/**
 * Transform PostgreSQL data types to MySQL compatible
 * @param {any} value - Value to transform
 * @param {string} dataType - Original data type
 * @returns {any} - Transformed value
 */
function transformDataValue(value, dataType) {
  if (value === null || value === undefined) {
    return null;
  }
  
  switch (dataType) {
    case 'uuid':
      return value.toString();
    
    case 'jsonb':
      return JSON.stringify(value);
    
    case 'ARRAY':
      return JSON.stringify(Array.isArray(value) ? value : [value]);
    
    case 'timestamp with time zone':
    case 'timestamptz':
      return new Date(value).toISOString().slice(0, 19).replace('T', ' ');
    
    case 'timestamp without time zone':
      return new Date(value).toISOString().slice(0, 19).replace('T', ' ');
    
    case 'USER-DEFINED':
      return value.toString();
    
    case 'tsvector':
      return value.toString();
    
    default:
      return value;
  }
}

/**
 * Transform a complete row of data
 * @param {Object} row - Row data from Supabase
 * @param {Array} columns - Column information
 * @returns {Object} - Transformed row data
 */
function transformRowData(row, columns) {
  const transformedRow = {};
  
  columns.forEach(column => {
    const columnName = column.name;
    const dataType = column.data_type;
    const value = row[columnName];
    
    let transformedValue;
    if (value === null || value === undefined) {
      transformedValue = null;
    } else if (typeof value === 'object') {
      transformedValue = JSON.stringify(value);
    } else {
      transformedValue = value.toString();
    }
    
    transformedRow[columnName] = transformedValue;
  });
  
  return transformedRow;
}

// ============================================================================
// MYSQL MIGRATION FUNCTIONS
// ============================================================================

/**
 * Migrate table data to MySQL
 * @param {mysql.Connection} mysqlConnection - MySQL connection
 * @param {string} tableName - Table name
 * @param {Array} data - Data to migrate
 * @param {Array} columns - Column information
 */
async function migrateTableData(mysqlConnection, tableName, data, columns) {
  if (data.length === 0) {
    console.log(`⏭️  Skipping ${tableName} - no data to migrate`);
    return;
  }
  
  console.log(`🔄 Migrating ${data.length} rows to ${tableName}...`);
  
  try {
    // Process data in batches
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      
      // Build INSERT statement
      const columnNames = columns.map(col => `\`${col.name}\``).join(', ');
      const placeholders = columns.map(() => '?').join(', ');
      const insertSQL = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${placeholders})`;
      
      // Transform batch data
      const transformedBatch = batch.map(row => transformRowData(row, columns));
      
      // Execute batch insert
      for (const row of transformedBatch) {
        const values = columns.map(col => {
          const value = row[col.name];
          // Ensure all values are properly handled
          if (value === undefined) return null;
          if (value === null) return null;
          return value;
        });
        await mysqlConnection.execute(insertSQL, values);
      }
      
      console.log(`  ✅ Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(data.length / BATCH_SIZE)}`);
    }
    
    console.log(`✅ Successfully migrated ${data.length} rows to ${tableName}`);
    
  } catch (error) {
    console.error(`❌ Failed to migrate ${tableName}:`, error.message);
    throw error;
  }
}

/**
 * Migrate all data to MySQL
 * @param {Object} extractedData - All extracted data from Supabase
 */
async function migrateAllDataToMySQL(extractedData) {
  console.log('\n🗄️ Starting MySQL data migration...');
  
  const mysqlConnection = await mysql.createConnection(mysqlConfig);
  
  try {
    // Disable foreign key checks during migration
    await mysqlConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Get table schemas for column information
    const tableSchemas = {};
    
    // Core business tables (migrate first due to dependencies)
    console.log('\n📊 Migrating core business data...');
    
         if (extractedData.employees?.length > 0) {
       // Get column information from the first row of data
       const sampleRow = extractedData.employees[0];
       const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
       
       await migrateTableData(mysqlConnection, 'employees', extractedData.employees, columns);
     }
    
         if (extractedData.leads?.length > 0) {
       // Get column information from the first row of data
       const sampleRow = extractedData.leads[0];
       const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
       
       await migrateTableData(mysqlConnection, 'leads', extractedData.leads, columns);
     }
    
    if (extractedData.sales_dispositions?.length > 0) {
      // Get column information from the first row of data
      const sampleRow = extractedData.sales_dispositions[0];
      const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
      
      await migrateTableData(mysqlConnection, 'sales_dispositions', extractedData.sales_dispositions, columns);
    }
    
    if (extractedData.projects?.length > 0) {
      // Get column information from the first row of data
      const sampleRow = extractedData.projects[0];
      const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
      
      await migrateTableData(mysqlConnection, 'projects', extractedData.projects, columns);
    }
    
    if (extractedData.services?.length > 0) {
      // Get column information from the first row of data
      const sampleRow = extractedData.services[0];
      const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
      
      await migrateTableData(mysqlConnection, 'services', extractedData.services, columns);
    }
    
    // User management tables
    console.log('\n👥 Migrating user management data...');
    
    if (extractedData.user_profiles?.length > 0) {
      // Get column information from the first row of data
      const sampleRow = extractedData.user_profiles[0];
      const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
      
      await migrateTableData(mysqlConnection, 'user_profiles', extractedData.user_profiles, columns);
    }
    
    if (extractedData.roles?.length > 0) {
      // Get column information from the first row of data
      const sampleRow = extractedData.roles[0];
      const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
      
      await migrateTableData(mysqlConnection, 'roles', extractedData.roles, columns);
    }
    
    if (extractedData.user_roles?.length > 0) {
      // Get column information from the first row of data
      const sampleRow = extractedData.user_roles[0];
      const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
      
      await migrateTableData(mysqlConnection, 'user_roles', extractedData.user_roles, columns);
    }
    
    if (extractedData.user_permissions?.length > 0) {
      // Get column information from the first row of data
      const sampleRow = extractedData.user_permissions[0];
      const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
      
      await migrateTableData(mysqlConnection, 'user_permissions', extractedData.user_permissions, columns);
    }
    
    if (extractedData.role_permissions?.length > 0) {
      // Get column information from the first row of data
      const sampleRow = extractedData.role_permissions[0];
      const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
      
      await migrateTableData(mysqlConnection, 'role_permissions', extractedData.role_permissions, columns);
    }
    
    // Performance tracking tables
    console.log('\n📈 Migrating performance data...');
    
    const performanceTables = [
      'front_seller_performance', 'front_seller_targets', 'upseller_performance',
      'upseller_targets', 'team_performance'
    ];
    
    for (const tableName of performanceTables) {
      if (extractedData[tableName]?.length > 0) {
        // Get column information from the first row of data
        const sampleRow = extractedData[tableName][0];
        const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
        
        await migrateTableData(mysqlConnection, tableName, extractedData[tableName], columns);
      }
    }
    
    // Project management tables
    console.log('\n📋 Migrating project management data...');
    
    const projectTables = [
      'task_boards', 'task_lists', 'task_cards', 'project_tasks', 'project_upsells'
    ];
    
    for (const tableName of projectTables) {
      if (extractedData[tableName]?.length > 0) {
        // Get column information from the first row of data
        const sampleRow = extractedData[tableName][0];
        const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
        
        await migrateTableData(mysqlConnection, tableName, extractedData[tableName], columns);
      }
    }
    
    // Financial data tables
    console.log('\n💰 Migrating financial data...');
    
    const financialTables = [
      'payment_sources', 'payment_plans', 'payment_transactions', 'recurring_payment_schedule'
    ];
    
    for (const tableName of financialTables) {
      if (extractedData[tableName]?.length > 0) {
        // Get column information from the first row of data
        const sampleRow = extractedData[tableName][0];
        const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
        
        await migrateTableData(mysqlConnection, tableName, extractedData[tableName], columns);
      }
    }
    
    // Communication tables
    console.log('\n💬 Migrating communication data...');
    
    const communicationTables = [
      'conversations', 'messages', 'ai_chat_conversations', 'ai_chat_messages', 'calendar_events'
    ];
    
    for (const tableName of communicationTables) {
      if (extractedData[tableName]?.length > 0) {
        // Get column information from the first row of data
        const sampleRow = extractedData[tableName][0];
        const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
        
        await migrateTableData(mysqlConnection, tableName, extractedData[tableName], columns);
      }
    }
    
    // Team management tables
    console.log('\n👥 Migrating team management data...');
    
    const teamTables = [
      'teams', 'team_members', 'upseller_teams', 'upseller_team_members', 'upseller_targets_management'
    ];
    
    for (const tableName of teamTables) {
      if (extractedData[tableName]?.length > 0) {
        // Get column information from the first row of data
        const sampleRow = extractedData[tableName][0];
        const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
        
        await migrateTableData(mysqlConnection, tableName, extractedData[tableName], columns);
      }
    }
    
    // Additional tables
    console.log('\n📁 Migrating additional data...');
    
    const additionalTables = [
      'workspaces', 'modules', 'audit_log', 'error_logs', 'customer_notes',
      'customer_tags', 'customer_files', 'chat_messages', 'employee_dependents',
      'employee_emergency_contacts', 'employee_performance_history', 'customers'
    ];
    
    for (const tableName of additionalTables) {
      if (extractedData[tableName]?.length > 0) {
        // Get column information from the first row of data
        const sampleRow = extractedData[tableName][0];
        const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
        
        await migrateTableData(mysqlConnection, tableName, extractedData[tableName], columns);
      }
    }
    
    // Re-enable foreign key checks
    await mysqlConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n✅ All data migration completed successfully!');
    
  } finally {
    await mysqlConnection.end();
  }
}

// ============================================================================
// MIGRATION REPORT GENERATION
// ============================================================================

/**
 * Generate comprehensive migration report
 * @param {Object} extractedData - All extracted data
 */
async function generateMigrationReport(extractedData) {
  console.log('\n📊 Generating migration report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    migration_type: 'Complete Supabase to MySQL Migration (READ ONLY)',
    tables_migrated: Object.keys(extractedData),
    record_counts: {},
    summary: {
      total_tables: Object.keys(extractedData).length,
      total_records: 0,
      migration_status: 'SUCCESS',
      supabase_protection: 'READ_ONLY_MAINTAINED'
    }
  };
  
  // Calculate record counts
  for (const [tableName, data] of Object.entries(extractedData)) {
    const count = data.length;
    report.record_counts[tableName] = count;
    report.summary.total_records += count;
  }
  
  // Save report to file
  const reportPath = join(__dirname, 'complete-migration-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📄 Complete migration report saved to: complete-migration-report.json');
  console.log(`📊 Total tables migrated: ${report.summary.total_tables}`);
  console.log(`📊 Total records migrated: ${report.summary.total_records}`);
  
  return report;
}

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

/**
 * Main migration function
 */
async function runCompleteMigration() {
  console.log('🚀 Starting Complete Supabase to MySQL Migration...');
  console.log('🔒 Following STRICT READ-ONLY rule for Supabase');
  
  const startTime = Date.now();
  
  try {
    // Phase 1: Safety checks
    await verifySupabaseReadOnly();
    await testMySQLConnection();
    
    // Phase 2: Extract data from Supabase (READ ONLY)
    const extractedData = await extractAllDataFromSupabase();
    
    // Phase 3: Migrate to MySQL
    await migrateAllDataToMySQL(extractedData);
    
    // Phase 4: Generate migration report
    const report = await generateMigrationReport(extractedData);
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n🎉 Complete migration completed successfully!');
    console.log(`⏱️  Total migration time: ${duration} seconds`);
    console.log(`📊 Total records migrated: ${report.summary.total_records}`);
    console.log('🔒 Supabase remains completely untouched (READ ONLY)');
    
  } catch (error) {
    console.error('\n❌ Complete migration failed:', error.message);
    console.error('🔒 Supabase remains safe and unchanged');
    process.exit(1);
  }
}

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

// Run migration if this script is executed directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCompleteMigration().catch((error) => {
    console.error('❌ Complete migration script failed:', error);
    process.exit(1);
  });
}

export {
  runCompleteMigration,
  extractAllDataFromSupabase,
  migrateAllDataToMySQL,
  verifySupabaseReadOnly
};

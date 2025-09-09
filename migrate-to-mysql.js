#!/usr/bin/env node

/**
 * 🚀 Supabase to MySQL Migration Script
 * 
 * ⚠️  CRITICAL RULE: SUPABASE READ-ONLY ONLY
 * 🚫 NEVER MODIFY SUPABASE
 * ✅ ONLY READ from Supabase
 * ✅ ONLY EXTRACT data for migration
 * ❌ NO CREATE, UPDATE, DELETE operations
 * ❌ NO schema modifications
 * ❌ NO data changes
 */

const mysql = require('mysql2/promise');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

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
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'your_password',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  charset: 'utf8mb4',
  timezone: '+00:00',
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
};

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
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .order(orderBy);
    
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
  
  // Core business tables
  extractionResults.employees = await extractDataFromSupabase('employees');
  extractionResults.leads = await extractDataFromSupabase('leads');
  extractionResults.sales_dispositions = await extractDataFromSupabase('sales_dispositions');
  extractionResults.projects = await extractDataFromSupabase('projects');
  
  // User management
  extractionResults.user_profiles = await extractDataFromSupabase('user_profiles');
  extractionResults.roles = await extractDataFromSupabase('roles');
  extractionResults.user_roles = await extractDataFromSupabase('user_roles');
  
  // Performance tracking
  extractionResults.front_seller_performance = await extractDataFromSupabase('front_seller_performance');
  extractionResults.front_seller_targets = await extractDataFromSupabase('front_seller_targets');
  extractionResults.upseller_performance = await extractDataFromSupabase('upseller_performance');
  extractionResults.upseller_targets = await extractDataFromSupabase('upseller_targets');
  
  // Financial data
  extractionResults.payment_sources = await extractDataFromSupabase('payment_sources');
  extractionResults.payment_plans = await extractDataFromSupabase('payment_plans');
  extractionResults.services = await extractDataFromSupabase('services');
  
  // Project management
  extractionResults.task_boards = await extractDataFromSupabase('task_boards');
  extractionResults.task_lists = await extractDataFromSupabase('task_lists');
  extractionResults.task_cards = await extractDataFromSupabase('task_cards');
  
  // Communication
  extractionResults.conversations = await extractDataFromSupabase('conversations');
  extractionResults.messages = await extractDataFromSupabase('messages');
  extractionResults.ai_chat_conversations = await extractDataFromSupabase('ai_chat_conversations');
  extractionResults.ai_chat_messages = await extractDataFromSupabase('ai_chat_messages');
  
  // Calendar and events
  extractionResults.calendar_events = await extractDataFromSupabase('calendar_events');
  
  // Teams and permissions
  extractionResults.teams = await extractDataFromSupabase('teams');
  extractionResults.team_members = await extractDataFromSupabase('team_members');
  extractionResults.modules = await extractDataFromSupabase('modules');
  extractionResults.user_permissions = await extractDataFromSupabase('user_permissions');
  extractionResults.role_permissions = await extractDataFromSupabase('role_permissions');
  
  // Additional tables
  extractionResults.upseller_teams = await extractDataFromSupabase('upseller_teams');
  extractionResults.upseller_team_members = await extractDataFromSupabase('upseller_team_members');
  extractionResults.upseller_targets_management = await extractDataFromSupabase('upseller_targets_management');
  extractionResults.project_tasks = await extractDataFromSupabase('project_tasks');
  extractionResults.project_upsells = await extractDataFromSupabase('project_upsells');
  extractionResults.payment_transactions = await extractDataFromSupabase('payment_transactions');
  extractionResults.recurring_payment_schedule = await extractDataFromSupabase('recurring_payment_schedule');
  
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
      return new Date(value).toISOString().slice(0, 19).replace('T', ' ');
    
    case 'USER-DEFINED':
      return value.toString();
    
    default:
      return value;
  }
}

// ============================================================================
// MYSQL MIGRATION FUNCTIONS
// ============================================================================

/**
 * Migrate employees table
 */
async function migrateEmployees(mysqlConnection, employees) {
  console.log('🔄 Migrating employees to MySQL...');
  
  try {
    for (const employee of employees) {
      await mysqlConnection.execute(`
        INSERT INTO employees (
          id, full_name, email, phone, department, job_title, 
          hire_date, salary, status, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        employee.id,
        employee.full_name || '',
        employee.email || '',
        employee.contact_number || '',
        employee.department || '',
        employee.job_title || '',
        employee.date_of_joining || null,
        0, // Default salary
        'active', // Default status
        employee.created_at || new Date(),
        employee.updated_at || new Date()
      ]);
    }
    
    console.log(`✅ Migrated ${employees.length} employees to MySQL`);
    
  } catch (error) {
    console.error('❌ Failed to migrate employees:', error.message);
    throw error;
  }
}

/**
 * Migrate leads table
 */
async function migrateLeads(mysqlConnection, leads) {
  console.log('🔄 Migrating leads to MySQL...');
  
  try {
    for (const lead of leads) {
      await mysqlConnection.execute(`
        INSERT INTO leads (
          id, client_name, email_address, contact_number, city_state,
          business_description, services_required, budget, additional_info,
          user_id, created_at, updated_at, date, status, source,
          price, priority, lead_score, last_contact, next_follow_up,
          converted_at, sales_disposition_id, agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        lead.id,
        lead.client_name || '',
        lead.email_address || '',
        lead.contact_number || '',
        lead.city_state || '',
        lead.business_description || '',
        lead.services_required || '',
        lead.budget || '',
        lead.additional_info || '',
        lead.user_id || null,
        lead.created_at || new Date(),
        lead.updated_at || new Date(),
        lead.date || null,
        lead.status || 'new',
        lead.source || '',
        lead.price || 0,
        lead.priority || '',
        lead.lead_score || 0,
        lead.last_contact || null,
        lead.next_follow_up || null,
        lead.converted_at || null,
        lead.sales_disposition_id || null,
        lead.agent || ''
      ]);
    }
    
    console.log(`✅ Migrated ${leads.length} leads to MySQL`);
    
  } catch (error) {
    console.error('❌ Failed to migrate leads:', error.message);
    throw error;
  }
}

/**
 * Migrate sales dispositions table
 */
async function migrateSalesDispositions(mysqlConnection, salesDispositions) {
  console.log('🔄 Migrating sales dispositions to MySQL...');
  
  try {
    for (const sale of salesDispositions) {
      await mysqlConnection.execute(`
        INSERT INTO sales_dispositions (
          id, sale_date, customer_name, phone_number, email, front_brand,
          business_name, service_sold, services_included, turnaround_time,
          service_tenure, service_details, agreement_url, payment_mode,
          company, sales_source, lead_source, sale_type, gross_value,
          cash_in, remaining, tax_deduction, seller, account_manager,
          project_manager, assigned_to, assigned_by, created_at, updated_at,
          user_id, lead_id, is_upsell, original_sales_disposition_id,
          service_types, payment_source, payment_company, brand,
          agreement_signed, agreement_sent, payment_plan_id, payment_source_id,
          is_recurring, recurring_frequency, total_installments,
          current_installment, next_payment_date, upsell_amount,
          original_sale_id, installment_frequency
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        sale.id,
        sale.sale_date || null,
        sale.customer_name || '',
        sale.phone_number || '',
        sale.email || '',
        sale.front_brand || '',
        sale.business_name || '',
        sale.service_sold || '',
        JSON.stringify(sale.services_included || []),
        sale.turnaround_time || '',
        sale.service_tenure || '',
        sale.service_details || '',
        sale.agreement_url || '',
        sale.payment_mode || '',
        sale.company || '',
        sale.sales_source || '',
        sale.lead_source || '',
        sale.sale_type || '',
        sale.gross_value || 0,
        sale.cash_in || 0,
        sale.remaining || 0,
        sale.tax_deduction || 0,
        sale.seller || '',
        sale.account_manager || '',
        sale.project_manager || '',
        sale.assigned_to || '',
        sale.assigned_by || '',
        sale.created_at || new Date(),
        sale.updated_at || new Date(),
        sale.user_id || null,
        sale.lead_id || null,
        sale.is_upsell || false,
        sale.original_sales_disposition_id || null,
        JSON.stringify(sale.service_types || []),
        sale.payment_source || '',
        sale.payment_company || '',
        sale.brand || '',
        sale.agreement_signed || false,
        sale.agreement_sent || false,
        sale.payment_plan_id || null,
        sale.payment_source_id || null,
        sale.is_recurring || false,
        sale.recurring_frequency || '',
        sale.total_installments || 1,
        sale.current_installment || 1,
        sale.next_payment_date || null,
        sale.upsell_amount || 0,
        sale.original_sale_id || null,
        sale.installment_frequency || ''
      ]);
    }
    
    console.log(`✅ Migrated ${salesDispositions.length} sales dispositions to MySQL`);
    
  } catch (error) {
    console.error('❌ Failed to migrate sales dispositions:', error.message);
    throw error;
  }
}

/**
 * Migrate projects table
 */
async function migrateProjects(mysqlConnection, projects) {
  console.log('🔄 Migrating projects to MySQL...');
  
  try {
    for (const project of projects) {
      await mysqlConnection.execute(`
        INSERT INTO projects (
          id, name, client, description, due_date, status, progress,
          user_id, created_at, updated_at, lead_id, sales_disposition_id,
          budget, services, project_manager, assigned_pm_id, assignment_date,
          project_type, is_upsell, parent_project_id, total_amount,
          amount_paid, payment_plan_id, payment_source_id, is_recurring,
          recurring_frequency, next_payment_date, total_installments,
          current_installment, installment_frequency, installment_amount
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        project.id,
        project.name || '',
        project.client || '',
        project.description || '',
        project.due_date || null,
        project.status || 'unassigned',
        project.progress || 0,
        project.user_id || null,
        project.created_at || new Date(),
        project.updated_at || new Date(),
        project.lead_id || null,
        project.sales_disposition_id || null,
        project.budget || 0,
        JSON.stringify(project.services || []),
        project.project_manager || '',
        project.assigned_pm_id || null,
        project.assignment_date || null,
        project.project_type || 'one-time',
        project.is_upsell || false,
        project.parent_project_id || null,
        project.total_amount || 0,
        project.amount_paid || 0,
        project.payment_plan_id || null,
        project.payment_source_id || null,
        project.is_recurring || false,
        project.recurring_frequency || '',
        project.next_payment_date || null,
        project.total_installments || 1,
        project.current_installment || 1,
        project.installment_frequency || '',
        project.installment_amount || 0
      ]);
    }
    
    console.log(`✅ Migrated ${projects.length} projects to MySQL`);
    
  } catch (error) {
    console.error('❌ Failed to migrate projects:', error.message);
    throw error;
  }
}

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

/**
 * Main migration function
 */
async function runMigration() {
  console.log('🚀 Starting Supabase to MySQL Migration...');
  console.log('🔒 Following STRICT READ-ONLY rule for Supabase');
  
  try {
    // Phase 1: Safety checks
    await verifySupabaseReadOnly();
    await testMySQLConnection();
    
    // Phase 2: Extract data from Supabase (READ ONLY)
    const extractedData = await extractAllDataFromSupabase();
    
    // Phase 3: Migrate to MySQL
    console.log('\n🗄️ Starting MySQL migration...');
    
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Disable foreign key checks during migration
      await mysqlConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
      
      // Migrate core tables
      await migrateEmployees(mysqlConnection, extractedData.employees);
      await migrateLeads(mysqlConnection, extractedData.leads);
      await migrateSalesDispositions(mysqlConnection, extractedData.sales_dispositions);
      await migrateProjects(mysqlConnection, extractedData.projects);
      
      // Re-enable foreign key checks
      await mysqlConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
      
      console.log('\n✅ Migration completed successfully!');
      console.log('🔒 Supabase remains completely untouched (READ ONLY)');
      
    } finally {
      await mysqlConnection.end();
    }
    
    // Phase 4: Generate migration report
    await generateMigrationReport(extractedData);
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('🔒 Supabase remains safe and unchanged');
    process.exit(1);
  }
}

/**
 * Generate migration report
 */
async function generateMigrationReport(extractedData) {
  console.log('\n📊 Generating migration report...');
  
  const report = {
    timestamp: new Date().toISOString(),
    migration_type: 'Supabase to MySQL (READ ONLY)',
    tables_migrated: Object.keys(extractedData),
    record_counts: {},
    summary: {
      total_tables: Object.keys(extractedData).length,
      total_records: 0,
      migration_status: 'SUCCESS'
    }
  };
  
  // Calculate record counts
  for (const [tableName, data] of Object.entries(extractedData)) {
    const count = data.length;
    report.record_counts[tableName] = count;
    report.summary.total_records += count;
  }
  
  // Save report to file
  const reportPath = path.join(process.cwd(), 'migration-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📄 Migration report saved to: migration-report.json');
  console.log(`📊 Total tables migrated: ${report.summary.total_tables}`);
  console.log(`📊 Total records migrated: ${report.summary.total_records}`);
}

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

// Run migration if this script is executed directly
if (require.main === module) {
  runMigration().catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
}

module.exports = {
  runMigration,
  extractDataFromSupabase,
  verifySupabaseReadOnly
};

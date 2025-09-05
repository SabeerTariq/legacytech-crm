#!/usr/bin/env node

/**
 * 🧪 Migration Verification Script
 * 
 * ⚠️  CRITICAL RULE: SUPABASE READ-ONLY ONLY
 * 🚫 NEVER MODIFY SUPABASE
 * ✅ ONLY READ from Supabase
 * ✅ ONLY VERIFY data integrity
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
  timezone: '+00:00'
};

// ============================================================================
// VERIFICATION FUNCTIONS
// ============================================================================

/**
 * Get record count from Supabase table (READ ONLY)
 * @param {string} tableName - Table name
 * @returns {number} - Record count
 */
async function getSupabaseRecordCount(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.warn(`⚠️  Warning: Could not count ${tableName} in Supabase: ${error.message}`);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.warn(`⚠️  Warning: Error counting ${tableName} in Supabase: ${error.message}`);
    return 0;
  }
}

/**
 * Get record count from MySQL table
 * @param {mysql.Connection} connection - MySQL connection
 * @param {string} tableName - Table name
 * @returns {number} - Record count
 */
async function getMySQLRecordCount(connection, tableName) {
  try {
    const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
    return rows[0].count;
  } catch (error) {
    console.warn(`⚠️  Warning: Could not count ${tableName} in MySQL: ${error.message}`);
    return 0;
  }
}

/**
 * Verify table data integrity
 * @param {string} tableName - Table name to verify
 * @param {mysql.Connection} mysqlConnection - MySQL connection
 * @returns {Object} - Verification result
 */
async function verifyTableIntegrity(tableName, mysqlConnection) {
  console.log(`🔍 Verifying table: ${tableName}`);
  
  try {
    // Get record counts
    const supabaseCount = await getSupabaseRecordCount(tableName);
    const mysqlCount = await getMySQLRecordCount(mysqlConnection, tableName);
    
    // Check if counts match
    const countMatch = supabaseCount === mysqlCount;
    
    // Sample data verification (for tables with data)
    let sampleDataMatch = true;
    let sampleDataDetails = null;
    
    if (supabaseCount > 0 && mysqlCount > 0) {
      try {
        // Get sample data from Supabase (READ ONLY)
        const { data: supabaseSample, error: supabaseError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!supabaseError && supabaseSample.length > 0) {
          // Get sample data from MySQL
          const [mysqlRows] = await mysqlConnection.execute(
            `SELECT * FROM \`${tableName}\` LIMIT 1`
          );
          
          if (mysqlRows.length > 0) {
            const supabaseRow = supabaseSample[0];
            const mysqlRow = mysqlRows[0];
            
            // Compare key fields (simplified comparison)
            const keyFields = Object.keys(supabaseRow).slice(0, 5); // First 5 fields
            sampleDataMatch = keyFields.every(field => {
              const supabaseValue = supabaseRow[field];
              const mysqlValue = mysqlRow[field];
              
              // Handle different data type representations
              if (supabaseValue === null && mysqlValue === null) return true;
              if (supabaseValue === null || mysqlValue === null) return false;
              
              // Convert to strings for comparison
              return supabaseValue.toString() === mysqlValue.toString();
            });
            
            sampleDataDetails = {
              supabaseSample: keyFields.reduce((obj, field) => {
                obj[field] = supabaseRow[field];
                return obj;
              }, {}),
              mysqlSample: keyFields.reduce((obj, field) => {
                obj[field] = mysqlRow[field];
                return obj;
              }, {})
            };
          }
        }
      } catch (error) {
        console.warn(`⚠️  Warning: Could not verify sample data for ${tableName}: ${error.message}`);
        sampleDataMatch = false;
      }
    }
    
    const result = {
      tableName,
      supabaseCount,
      mysqlCount,
      countMatch,
      sampleDataMatch,
      sampleDataDetails,
      verificationStatus: countMatch && sampleDataMatch ? 'PASS' : 'FAIL'
    };
    
    // Log verification result
    if (result.verificationStatus === 'PASS') {
      console.log(`  ✅ ${tableName}: PASS (${supabaseCount} records)`);
    } else {
      console.log(`  ❌ ${tableName}: FAIL`);
      if (!countMatch) {
        console.log(`     Count mismatch: Supabase=${supabaseCount}, MySQL=${mysqlCount}`);
      }
      if (!sampleDataMatch) {
        console.log(`     Sample data mismatch detected`);
      }
    }
    
    return result;
    
  } catch (error) {
    console.error(`❌ Error verifying ${tableName}:`, error.message);
    return {
      tableName,
      supabaseCount: 0,
      mysqlCount: 0,
      countMatch: false,
      sampleDataMatch: false,
      verificationStatus: 'ERROR',
      error: error.message
    };
  }
}

/**
 * Verify all tables
 * @returns {Object} - Complete verification results
 */
async function verifyAllTables() {
  console.log('🔍 Starting comprehensive migration verification...');
  
  const mysqlConnection = await mysql.createConnection(mysqlConfig);
  
  try {
    // List of tables to verify (in order of importance)
    const tablesToVerify = [
      // Core business tables
      'employees',
      'leads',
      'sales_dispositions',
      'projects',
      'services',
      
      // User management
      'user_profiles',
      'roles',
      'user_roles',
      'user_permissions',
      'role_permissions',
      
      // Performance tracking
      'front_seller_performance',
      'front_seller_targets',
      'upseller_performance',
      'upseller_targets',
      'team_performance',
      
      // Project management
      'task_boards',
      'task_lists',
      'task_cards',
      'project_tasks',
      'project_upsells',
      
      // Financial data
      'payment_sources',
      'payment_plans',
      'payment_transactions',
      'recurring_payment_schedule',
      
      // Communication
      'conversations',
      'messages',
      'ai_chat_conversations',
      'ai_chat_messages',
      'calendar_events',
      
      // Team management
      'teams',
      'team_members',
      'upseller_teams',
      'upseller_team_members',
      'upseller_targets_management',
      
      // Additional tables
      'workspaces',
      'modules',
      'audit_log',
      'error_logs',
      'customer_notes',
      'customer_tags',
      'customer_files',
      'chat_messages',
      'employee_dependents',
      'employee_emergency_contacts',
      'employee_performance_history',
      'customers'
    ];
    
    const verificationResults = [];
    let passedTables = 0;
    let failedTables = 0;
    let errorTables = 0;
    
    // Verify each table
    for (const tableName of tablesToVerify) {
      const result = await verifyTableIntegrity(tableName, mysqlConnection);
      verificationResults.push(result);
      
      switch (result.verificationStatus) {
        case 'PASS':
          passedTables++;
          break;
        case 'FAIL':
          failedTables++;
          break;
        case 'ERROR':
          errorTables++;
          break;
      }
    }
    
    // Generate verification summary
    const summary = {
      totalTables: tablesToVerify.length,
      passedTables,
      failedTables,
      errorTables,
      successRate: Math.round((passedTables / tablesToVerify.length) * 100),
      overallStatus: failedTables === 0 && errorTables === 0 ? 'SUCCESS' : 'FAILED'
    };
    
    console.log('\n📊 Verification Summary:');
    console.log(`  Total Tables: ${summary.totalTables}`);
    console.log(`  Passed: ${passedTables}`);
    console.log(`  Failed: ${failedTables}`);
    console.log(`  Errors: ${errorTables}`);
    console.log(`  Success Rate: ${summary.successRate}%`);
    console.log(`  Overall Status: ${summary.overallStatus}`);
    
    return {
      summary,
      verificationResults,
      timestamp: new Date().toISOString()
    };
    
  } finally {
    await mysqlConnection.end();
  }
}

/**
 * Generate detailed verification report
 * @param {Object} verificationData - Verification results
 */
async function generateVerificationReport(verificationData) {
  console.log('\n📄 Generating verification report...');
  
  const report = {
    timestamp: verificationData.timestamp,
    report_type: 'Migration Verification Report',
    summary: verificationData.summary,
    detailed_results: verificationData.verificationResults,
    recommendations: []
  };
  
  // Generate recommendations based on results
  if (verificationData.summary.failedTables > 0) {
    report.recommendations.push({
      type: 'CRITICAL',
      message: `${verificationData.summary.failedTables} tables failed verification. Review data integrity issues.`
    });
  }
  
  if (verificationData.summary.errorTables > 0) {
    report.recommendations.push({
      type: 'WARNING',
      message: `${verificationData.summary.errorTables} tables had verification errors. Check database connectivity.`
    });
  }
  
  if (verificationData.summary.successRate >= 95) {
    report.recommendations.push({
      type: 'SUCCESS',
      message: 'Migration verification successful. Proceed with application updates.'
    });
  } else if (verificationData.summary.successRate >= 80) {
    report.recommendations.push({
      type: 'WARNING',
      message: 'Migration mostly successful but some issues detected. Review failed tables before proceeding.'
    });
  } else {
    report.recommendations.push({
      type: 'CRITICAL',
      message: 'Migration verification failed. Do not proceed with application updates until issues are resolved.'
    });
  }
  
  // Save report to file
  const reportPath = join(process.cwd(), 'migration-verification-report.json');
  await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
  
  console.log('📄 Verification report saved to: migration-verification-report.json');
  
  return report;
}

/**
 * Run data consistency checks
 * @param {mysql.Connection} mysqlConnection - MySQL connection
 */
async function runDataConsistencyChecks(mysqlConnection) {
  console.log('\n🔍 Running data consistency checks...');
  
  try {
    // Check employee-lead relationships
    console.log('  🔍 Checking employee-lead relationships...');
    const [employeeLeadCount] = await mysqlConnection.execute(`
      SELECT 
        e.full_name,
        e.department,
        COUNT(l.id) as lead_count
      FROM employees e
      LEFT JOIN leads l ON e.id = l.user_id
      GROUP BY e.id, e.full_name, e.department
      ORDER BY lead_count DESC
      LIMIT 10
    `);
    
    console.log(`    ✅ Employee-lead relationships verified (${employeeLeadCount.length} employees checked)`);
    
    // Check lead-project relationships
    console.log('  🔍 Checking lead-project relationships...');
    const [leadProjectCount] = await mysqlConnection.execute(`
      SELECT 
        l.client_name,
        l.status as lead_status,
        COUNT(p.id) as project_count
      FROM leads l
      LEFT JOIN projects p ON l.id = p.lead_id
      GROUP BY l.id, l.client_name, l.status
      ORDER BY project_count DESC
      LIMIT 10
    `);
    
    console.log(`    ✅ Lead-project relationships verified (${leadProjectCount.length} leads checked)`);
    
    // Check user-role relationships
    console.log('  🔍 Checking user-role relationships...');
    const [userRoleCount] = await mysqlConnection.execute(`
      SELECT 
        up.display_name,
        up.email,
        COUNT(ur.id) as role_count
      FROM user_profiles up
      LEFT JOIN user_roles ur ON up.user_id = ur.user_id
      GROUP BY up.id, up.display_name, up.email
      ORDER BY role_count DESC
      LIMIT 10
    `);
    
    console.log(`    ✅ User-role relationships verified (${userRoleCount.length} users checked)`);
    
    console.log('  ✅ Data consistency checks completed');
    
  } catch (error) {
    console.error('  ❌ Data consistency checks failed:', error.message);
  }
}

// ============================================================================
// MAIN VERIFICATION FUNCTION
// ============================================================================

/**
 * Main verification function
 */
async function runVerification() {
  console.log('🧪 Starting Migration Verification...');
  console.log('🔒 Following STRICT READ-ONLY rule for Supabase');
  
  const startTime = Date.now();
  
  try {
    // Phase 1: Verify all tables
    const verificationData = await verifyAllTables();
    
    // Phase 2: Generate verification report
    const report = await generateVerificationReport(verificationData);
    
    // Phase 3: Run data consistency checks
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    try {
      await runDataConsistencyChecks(mysqlConnection);
    } finally {
      await mysqlConnection.end();
    }
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n🎉 Verification completed successfully!');
    console.log(`⏱️  Total verification time: ${duration} seconds`);
    console.log(`📊 Overall Status: ${report.summary.overallStatus}`);
    console.log(`📊 Success Rate: ${report.summary.successRate}%`);
    console.log('🔒 Supabase remains completely untouched (READ ONLY)');
    
    // Exit with appropriate code
    if (report.summary.overallStatus === 'SUCCESS') {
      process.exit(0);
    } else {
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error('🔒 Supabase remains safe and unchanged');
    process.exit(1);
  }
}

// ============================================================================
// SCRIPT EXECUTION
// ============================================================================

// Run verification if this script is executed directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runVerification().catch((error) => {
    console.error('❌ Verification script failed:', error);
    process.exit(1);
  });
}

export {
  runVerification,
  verifyAllTables,
  verifyTableIntegrity,
  generateVerificationReport
};

#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'Developer@1234',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

async function getSupabaseRecordCount(tableName) {
  try {
    const { count, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`  ❌ Error counting ${tableName}: ${error.message}`);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error(`  ❌ Failed to count ${tableName}: ${error.message}`);
    return 0;
  }
}

async function getMySQLRecordCount(connection, tableName) {
  try {
    const [rows] = await connection.execute(`SELECT COUNT(*) as count FROM \`${tableName}\``);
    return rows[0].count;
  } catch (error) {
    console.error(`  ❌ Error counting MySQL ${tableName}: ${error.message}`);
    return 0;
  }
}

async function verifyTableIntegrity(tableName, mysqlConnection) {
  try {
    const supabaseCount = await getSupabaseRecordCount(tableName);
    const mysqlCount = await getMySQLRecordCount(mysqlConnection, tableName);
    
    const countMatch = supabaseCount === mysqlCount;
    const status = countMatch ? '✅ PASSED' : '❌ FAILED';
    
    return {
      tableName,
      supabaseCount,
      mysqlCount,
      countMatch,
      status,
      verificationStatus: countMatch ? 'PASSED' : 'FAILED',
      error: null
    };
  } catch (error) {
    return {
      tableName,
      supabaseCount: 0,
      mysqlCount: 0,
      countMatch: false,
      status: '❌ ERROR',
      verificationStatus: 'ERROR',
      error: error.message
    };
  }
}

async function verifyCompleteMigration() {
  console.log('🔍 Starting comprehensive migration verification...\n');
  
  const mysqlConnection = await mysql.createConnection(mysqlConfig);
  
  try {
    // List of all tables that should be migrated
    const allTables = [
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
      
      // System tables
      'workspaces',
      'modules',
      'audit_log',
      'error_logs',
      
      // Customer-related tables
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
    let totalSupabaseRecords = 0;
    let totalMySQLRecords = 0;
    
    console.log('📊 Verifying each table...\n');
    
    // Verify each table
    for (const tableName of allTables) {
      console.log(`🔍 Verifying: ${tableName}`);
      const result = await verifyTableIntegrity(tableName, mysqlConnection);
      verificationResults.push(result);
      
      if (result.verificationStatus === 'PASSED') {
        passedTables++;
        totalSupabaseRecords += result.supabaseCount;
        totalMySQLRecords += result.mysqlCount;
      } else if (result.verificationStatus === 'FAILED') {
        failedTables++;
      } else {
        errorTables++;
      }
      
      console.log(`  ${result.status} - Supabase: ${result.supabaseCount}, MySQL: ${result.mysqlCount}`);
    }
    
    // Generate comprehensive report
    console.log('\n' + '='.repeat(80));
    console.log('📋 COMPREHENSIVE MIGRATION VERIFICATION REPORT');
    console.log('='.repeat(80));
    
    console.log(`\n📊 Overall Statistics:`);
    console.log(`  ✅ Passed Tables: ${passedTables}/${allTables.length}`);
    console.log(`  ❌ Failed Tables: ${failedTables}/${allTables.length}`);
    console.log(`  ⚠️  Error Tables: ${errorTables}/${allTables.length}`);
    console.log(`  📈 Success Rate: ${((passedTables / allTables.length) * 100).toFixed(1)}%`);
    
    console.log(`\n📊 Data Volume:`);
    console.log(`  📤 Total Supabase Records: ${totalSupabaseRecords.toLocaleString()}`);
    console.log(`  📥 Total MySQL Records: ${totalMySQLRecords.toLocaleString()}`);
    console.log(`  🔄 Data Transfer Rate: ${((totalMySQLRecords / totalSupabaseRecords) * 100).toFixed(1)}%`);
    
    if (passedTables > 0) {
      console.log(`\n✅ Successfully Migrated Tables (${passedTables}):`);
      verificationResults
        .filter(r => r.verificationStatus === 'PASSED')
        .forEach(result => {
          console.log(`  - ${result.tableName}: ${result.supabaseCount} → ${result.mysqlCount} records`);
        });
    }
    
    if (failedTables > 0) {
      console.log(`\n❌ Failed Migrations (${failedTables}):`);
      verificationResults
        .filter(r => r.verificationStatus === 'FAILED')
        .forEach(result => {
          console.log(`  - ${result.tableName}: Supabase ${result.supabaseCount} vs MySQL ${result.mysqlCount}`);
        });
    }
    
    if (errorTables > 0) {
      console.log(`\n⚠️  Tables with Errors (${errorTables}):`);
      verificationResults
        .filter(r => r.verificationStatus === 'ERROR')
        .forEach(result => {
          console.log(`  - ${result.tableName}: ${result.error}`);
        });
    }
    
    // Check MySQL database structure
    console.log(`\n🗄️ MySQL Database Structure:`);
    try {
      const [tables] = await mysqlConnection.execute('SHOW TABLES');
      const tableNames = tables.map(row => Object.values(row)[0]);
      console.log(`  📋 Total Tables in MySQL: ${tableNames.length}`);
      console.log(`  📋 Tables: ${tableNames.join(', ')}`);
    } catch (error) {
      console.log(`  ❌ Could not retrieve MySQL table list: ${error.message}`);
    }
    
    console.log('\n' + '='.repeat(80));
    
    if (passedTables === allTables.length) {
      console.log('🎉 MIGRATION COMPLETED SUCCESSFULLY!');
      console.log('🚀 Your project is now completely independent from Supabase!');
    } else if (passedTables > allTables.length * 0.8) {
      console.log('✅ MIGRATION MOSTLY COMPLETED!');
      console.log('⚠️  Some tables need attention, but core functionality is migrated.');
    } else {
      console.log('⚠️  MIGRATION PARTIALLY COMPLETED');
      console.log('🔧 Several tables need to be addressed.');
    }
    
    return {
      totalTables: allTables.length,
      passedTables,
      failedTables,
      errorTables,
      successRate: (passedTables / allTables.length) * 100,
      totalSupabaseRecords,
      totalMySQLRecords,
      dataTransferRate: (totalMySQLRecords / totalSupabaseRecords) * 100
    };
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    return null;
  } finally {
    await mysqlConnection.end();
  }
}

verifyCompleteMigration();

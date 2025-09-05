#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function listRemainingTables() {
  try {
    console.log('🔍 Listing all tables in Supabase to identify remaining migrations...\n');
    
    // List of tables already migrated
    const migratedTables = [
      'employees',
      'leads', 
      'sales_dispositions',
      'projects',
      'services',
      'user_profiles',
      'roles',
      'user_roles'
    ];
    
    console.log('✅ Already migrated tables:');
    migratedTables.forEach(table => console.log(`  - ${table}`));
    
    console.log('\n🔍 Checking for additional tables...\n');
    
    // Try to access common table names that might exist
    const potentialTables = [
      // Performance tracking
      'front_seller_performance',
      'front_seller_targets', 
      'upseller_performance',
      'upseller_targets',
      'team_performance',
      
      // User management
      'user_permissions',
      'role_permissions',
      'permissions',
      
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
      'customers',
      'clients',
      'contacts',
      'opportunities',
      'quotes',
      'invoices',
      'payments',
      'expenses',
      'reports',
      'notifications',
      'settings',
      'configurations'
    ];
    
    const existingTables = [];
    const nonExistentTables = [];
    
    for (const tableName of potentialTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.code === '42P01') {
            nonExistentTables.push(tableName);
          } else {
            console.log(`  ⚠️  ${tableName}: ${error.message}`);
          }
        } else {
          existingTables.push(tableName);
          console.log(`  ✅ ${tableName} - EXISTS (${data?.length || 0} sample rows)`);
        }
      } catch (err) {
        console.log(`  ❌ ${tableName}: ${err.message}`);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`  ✅ Already migrated: ${migratedTables.length} tables`);
    console.log(`  🔍 Found additional: ${existingTables.length} tables`);
    console.log(`  ❌ Not found: ${nonExistentTables.length} tables`);
    
    if (existingTables.length > 0) {
      console.log('\n🚀 Next tables to migrate:');
      existingTables.forEach(table => console.log(`  - ${table}`));
    }
    
    return existingTables;
    
  } catch (error) {
    console.error('❌ Failed to list tables:', error.message);
    return [];
  }
}

listRemainingTables();

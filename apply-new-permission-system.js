#!/usr/bin/env node

/**
 * Script to apply the new permission system migration
 * This will update the database with the improved RBAC/ABAC schema
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🚀 Starting permission system migration...');
  
  try {
    // Read the migration SQL file
    const migrationPath = path.join(__dirname, 'supabase/migrations/001_improved_permissions_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Reading migration file...');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          throw error;
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        // Some errors might be expected (like table already exists)
        if (error.message.includes('already exists') || 
            error.message.includes('does not exist')) {
          console.log(`⚠️  Statement ${i + 1} skipped (expected): ${error.message}`);
          continue;
        }
        throw error;
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
    // Verify the migration
    await verifyMigration();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

async function verifyMigration() {
  console.log('🔍 Verifying migration...');
  
  try {
    // Check if new tables exist
    const tables = ['roles', 'user_roles', 'permissions', 'permission_audit_log'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`❌ Table ${table} verification failed:`, error);
        throw error;
      }
      
      console.log(`✅ Table ${table} exists and is accessible`);
    }
    
    // Check if default roles were created
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('name')
      .in('name', ['super_admin', 'admin', 'manager', 'front_sales', 'employee']);
    
    if (rolesError) {
      console.error('❌ Failed to verify default roles:', rolesError);
      throw rolesError;
    }
    
    console.log(`✅ Found ${roles.length} default roles`);
    
    // Check if permissions were created
    const { data: permissions, error: permError } = await supabase
      .from('permissions')
      .select('resource, action')
      .limit(5);
    
    if (permError) {
      console.error('❌ Failed to verify permissions:', permError);
      throw permError;
    }
    
    console.log(`✅ Found ${permissions.length} permissions`);
    
    console.log('🎉 Migration verification completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration verification failed:', error);
    throw error;
  }
}

async function migrateExistingUsers() {
  console.log('👥 Migrating existing users to new system...');
  
  try {
    // Get all existing auth users
    const { data: users, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Failed to list users:', error);
      return;
    }
    
    console.log(`📊 Found ${users.users.length} existing users`);
    
    for (const user of users.users) {
      try {
        // Check if user profile already exists
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (existingProfile) {
          console.log(`⏭️  User ${user.email} already has a profile, skipping...`);
          continue;
        }
        
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            user_id: user.id,
            email: user.email,
            display_name: user.user_metadata?.full_name || user.email,
            attributes: user.user_metadata || {},
          });
        
        if (profileError) {
          console.error(`❌ Failed to create profile for ${user.email}:`, profileError);
          continue;
        }
        
        // Assign default employee role
        const { data: employeeRole } = await supabase
          .from('roles')
          .select('id')
          .eq('name', 'employee')
          .single();
        
        if (employeeRole) {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role_id: employeeRole.id,
            });
          
          if (roleError) {
            console.error(`❌ Failed to assign role to ${user.email}:`, roleError);
          } else {
            console.log(`✅ Created profile and assigned role for ${user.email}`);
          }
        }
        
      } catch (error) {
        console.error(`❌ Error processing user ${user.email}:`, error);
      }
    }
    
    console.log('🎉 User migration completed!');
    
  } catch (error) {
    console.error('❌ User migration failed:', error);
  }
}

async function main() {
  console.log('🔧 LogicWorks CRM Permission System Migration');
  console.log('============================================');
  
  await applyMigration();
  await migrateExistingUsers();
  
  console.log('');
  console.log('🎉 Permission system migration completed successfully!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('1. Update your frontend components to use the new permission hooks');
  console.log('2. Test the permission system thoroughly');
  console.log('3. Assign appropriate roles to your users');
  console.log('4. Monitor the permission audit logs');
  console.log('');
  console.log('📚 Documentation:');
  console.log('- Check USER_MANAGEMENT_ANALYSIS_REPORT.md for current system analysis');
  console.log('- Check IMPROVED_USER_MANAGEMENT_PLAN.md for implementation details');
  console.log('');
}

// Run the migration
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { applyMigration, verifyMigration, migrateExistingUsers }; 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testCascadeConstraints() {
  console.log('🧪 Testing CASCADE DELETE Constraints\n');

  try {
    // 1. Check current foreign key constraints
    console.log('1. Checking current foreign key constraints...');
    const { data: constraints, error: constraintsError } = await supabaseAdmin.rpc(
      'exec_sql',
      { sql: `
        SELECT 
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            rc.delete_rule,
            rc.update_rule
        FROM 
            information_schema.table_constraints AS tc 
            JOIN information_schema.key_column_usage AS kcu
              ON tc.constraint_name = kcu.constraint_name
              AND tc.table_schema = kcu.table_schema
            JOIN information_schema.referential_constraints AS rc
              ON tc.constraint_name = rc.constraint_name
            JOIN information_schema.constraint_column_usage AS ccu
              ON ccu.constraint_name = tc.constraint_name
              AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' 
            AND tc.table_schema = 'public'
            AND ccu.table_name = 'users'
        ORDER BY tc.table_name;
      ` }
    );

    if (constraintsError) {
      console.log('❌ Error checking constraints:', constraintsError.message);
    } else {
      console.log('✅ Foreign key constraints found:', constraints?.length || 0);
      constraints?.forEach(constraint => {
        console.log(`  - ${constraint.table_name}.${constraint.column_name} -> ${constraint.foreign_table_name}.${constraint.foreign_column_name}`);
        console.log(`    Delete Rule: ${constraint.delete_rule}`);
        console.log(`    Update Rule: ${constraint.update_rule}`);
        console.log('');
      });
    }

    // 2. Create a test user to verify cascade delete
    console.log('2. Creating test user for cascade delete verification...');
    const testEmail = `test-cascade-${Date.now()}@logicworks.com`;
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true
    });

    if (authError) {
      console.log('❌ Error creating test user:', authError.message);
      return;
    }

    const testUserId = authData.user.id;
    console.log('✅ Test user created:', testUserId);

    // 3. Create related data for the test user
    console.log('3. Creating related data for test user...');
    
    // Create user profile
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        user_id: testUserId,
        email: testEmail,
        display_name: 'Test User',
        is_active: true,
        attributes: {
          role: 'user',
          department: 'Test',
          permissions: {}
        }
      });

    if (profileError) {
      console.log('❌ Error creating user profile:', profileError.message);
    } else {
      console.log('✅ User profile created');
    }

    // Create user role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: testUserId,
        role_id: 'ae936867-cbed-466c-bdef-778f05da133d' // Front Seller role
      });

    if (roleError) {
      console.log('❌ Error creating user role:', roleError.message);
    } else {
      console.log('✅ User role created');
    }

    // Create user permissions
    const { error: permsError } = await supabaseAdmin
      .from('user_permissions')
      .insert({
        user_id: testUserId,
        module_name: 'dashboard',
        can_create: true,
        can_read: true,
        can_update: true,
        can_delete: true,
        screen_visible: true
      });

    if (permsError) {
      console.log('❌ Error creating user permissions:', permsError.message);
    } else {
      console.log('✅ User permissions created');
    }

    // 4. Verify data exists before deletion
    console.log('4. Verifying data exists before deletion...');
    
    const { data: beforeData, error: beforeError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUserId);

    if (beforeError) {
      console.log('❌ Error checking data before deletion:', beforeError.message);
    } else {
      console.log('✅ Data exists before deletion:', beforeData?.length || 0, 'records');
    }

    // 5. Delete the test user and verify cascade delete
    console.log('5. Deleting test user and verifying cascade delete...');
    
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(testUserId);

    if (deleteError) {
      console.log('❌ Error deleting test user:', deleteError.message);
    } else {
      console.log('✅ Test user deleted');
    }

    // 6. Verify cascade delete worked
    console.log('6. Verifying cascade delete worked...');
    
    const { data: afterData, error: afterError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('user_id', testUserId);

    if (afterError) {
      console.log('❌ Error checking data after deletion:', afterError.message);
    } else {
      console.log('✅ Data after deletion:', afterData?.length || 0, 'records');
      if (afterData?.length === 0) {
        console.log('✅ CASCADE DELETE working correctly!');
      } else {
        console.log('❌ CASCADE DELETE not working - data still exists');
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testCascadeConstraints(); 
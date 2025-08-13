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

async function testTriggerIssue() {
  console.log('🧪 Testing Trigger Issue\n');

  try {
    // 1. Check if trigger exists
    console.log('1. Checking trigger...');
    const { data: triggerData, error: triggerError } = await supabaseAdmin.rpc(
      'exec_sql',
      { sql: `
        SELECT 
          trigger_name,
          event_manipulation,
          event_object_table
        FROM information_schema.triggers 
        WHERE trigger_name = 'create_user_profile_trigger'
      ` }
    );

    if (triggerError) {
      console.log('❌ Error checking trigger:', triggerError.message);
    } else {
      console.log('✅ Trigger check result:', triggerData);
    }

    // 2. Check user_profiles table structure
    console.log('\n2. Checking user_profiles table...');
    const { data: tableData, error: tableError } = await supabaseAdmin.rpc(
      'exec_sql',
      { sql: `
        SELECT 
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'user_profiles'
        ORDER BY ordinal_position
      ` }
    );

    if (tableError) {
      console.log('❌ Error checking table:', tableError.message);
    } else {
      console.log('✅ Table structure:', tableData);
    }

    // 3. Try to create a user without the trigger
    console.log('\n3. Testing user creation without trigger...');
    
    // First, disable the trigger
    const { error: disableError } = await supabaseAdmin.rpc(
      'exec_sql',
      { sql: 'DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;' }
    );

    if (disableError) {
      console.log('❌ Error disabling trigger:', disableError.message);
    } else {
      console.log('✅ Trigger disabled');
    }

    // Try to create a test user
    const testEmail = `test-${Date.now()}@logicworks.com`;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true
    });

    if (authError) {
      console.log('❌ Auth creation error:', authError.message);
    } else {
      console.log('✅ User created successfully:', authData.user.id);
      
      // Clean up
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.log('✅ Test user cleaned up');
    }

    // 4. Re-enable the trigger
    console.log('\n4. Re-enabling trigger...');
    const { error: enableError } = await supabaseAdmin.rpc(
      'exec_sql',
      { sql: `
        CREATE TRIGGER create_user_profile_trigger
          AFTER INSERT ON auth.users
          FOR EACH ROW
          EXECUTE FUNCTION create_user_profile_trigger();
      ` }
    );

    if (enableError) {
      console.log('❌ Error re-enabling trigger:', enableError.message);
    } else {
      console.log('✅ Trigger re-enabled');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testTriggerIssue(); 
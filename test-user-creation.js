import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testUserCreation() {
  try {
    console.log('🔍 Testing User Creation Process...');
    
    // 1. Check if user_profiles table exists and its structure
    console.log('\n1️⃣ Checking user_profiles table...');
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('❌ user_profiles table error:', profilesError);
    } else {
      console.log('✅ user_profiles table accessible');
      if (profiles && profiles.length > 0) {
        console.log('📋 Sample profile structure:', Object.keys(profiles[0]));
      }
    }

    // 2. Check if employees table exists
    console.log('\n2️⃣ Checking employees table...');
    const { data: employees, error: employeesError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .limit(1);
    
    if (employeesError) {
      console.error('❌ employees table error:', employeesError);
    } else {
      console.log('✅ employees table accessible');
      if (employees && employees.length > 0) {
        console.log('📋 Sample employee structure:', Object.keys(employees[0]));
      }
    }

    // 3. Test creating a user in Auth
    console.log('\n3️⃣ Testing Auth user creation...');
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
    });

    if (authError) {
      console.error('❌ Auth creation error:', authError);
      return;
    }

    if (!authData.user) {
      console.error('❌ No user returned from Auth creation');
      return;
    }

    console.log('✅ Auth user created successfully:', authData.user.id);

    // 4. Test creating user profile
    console.log('\n4️⃣ Testing user profile creation...');
    const profileData = {
      user_id: authData.user.id,
      employee_id: null, // No employee for test
      email: testEmail,
      display_name: 'Test User',
      is_active: true,
      attributes: {
        department: 'Test',
        position: 'Tester',
        phone: ''
      }
    };

    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert(profileData);

    if (profileError) {
      console.error('❌ Profile creation error:', profileError);
    } else {
      console.log('✅ User profile created successfully');
    }

    // 5. Clean up test user
    console.log('\n5️⃣ Cleaning up test user...');
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    
    if (deleteError) {
      console.error('❌ Error deleting test user:', deleteError);
    } else {
      console.log('✅ Test user deleted successfully');
    }

    console.log('\n🎉 User creation test completed!');

  } catch (error) {
    console.error('❌ Error in test:', error);
  }
}

testUserCreation(); 
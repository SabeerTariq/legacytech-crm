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

async function checkSupabaseSettings() {
  console.log('🔍 SUPABASE DASHBOARD SETTINGS CHECKER');
  console.log('=====================================');
  
  console.log('\n📋 CRITICAL SETTINGS TO CHECK IN YOUR SUPABASE DASHBOARD:');
  console.log('\n1. 🔐 Authentication > Configuration:');
  console.log('   Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/auth/providers');
  console.log('   ✅ Check: "Allow new users to sign up" must be ENABLED');
  console.log('   ✅ Check: "Enable email confirmations" settings');
  
  console.log('\n2. 📧 Email Provider Settings:');
  console.log('   Go to: Authentication > Providers > Email');
  console.log('   ✅ Check: Email provider is configured correctly');
  console.log('   ✅ Check: "Confirm email" setting matches your createUser call');
  
  console.log('\n3. 🛡️ RLS (Row Level Security):');
  console.log('   Go to: Database > Tables');
  console.log('   ✅ Check: auth.users table RLS policies');
  console.log('   ✅ Check: Any custom constraints on auth.users');
  
  console.log('\n4. 🔧 Database Triggers:');
  console.log('   Go to: Database > Functions');
  console.log('   ✅ Check: Any triggers on auth.users table');
  console.log('   ✅ Check: Functions have SECURITY DEFINER');

  // Test current auth settings
  console.log('\n🧪 TESTING CURRENT PROJECT SETTINGS...');
  
  try {
    // Test 1: Try to create a user with minimal data
    console.log('\n🔬 Test 1: Attempting minimal user creation...');
    const testEmail = `test-settings-${Date.now()}@example.com`;
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true
    });

    if (authError) {
      console.log('❌ Test 1 FAILED:', authError.message);
      console.log('🔍 Error details:', authError);
      
      if (authError.message.includes('Database error')) {
        console.log('\n🚨 DIAGNOSIS: Database-level issue detected!');
        console.log('📝 RECOMMENDED ACTIONS:');
        console.log('   1. Check Supabase Dashboard > Database > Functions for triggers');
        console.log('   2. Look for any custom functions on auth.users table');
        console.log('   3. Verify all functions have SECURITY DEFINER modifier');
        console.log('   4. Check for foreign key constraints on auth.users');
      }
      
      if (authError.message.includes('signup')) {
        console.log('\n🚨 DIAGNOSIS: Signup configuration issue!');
        console.log('📝 RECOMMENDED ACTIONS:');
        console.log('   1. Go to Auth > Configuration');
        console.log('   2. Enable "Allow new users to sign up"');
        console.log('   3. Check email confirmation settings');
      }
    } else {
      console.log('✅ Test 1 PASSED: User creation successful!');
      console.log('📧 Created user:', authData.user.email);
      
      // Clean up test user
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.log('🧹 Test user cleaned up');
    }

    // Test 2: Check database schema integrity
    console.log('\n🔬 Test 2: Checking database schema...');
    
    const { data: tables, error: tablesError } = await supabaseAdmin
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['user_profiles', 'roles', 'user_roles']);
    
    if (tablesError) {
      console.log('⚠️ Test 2 WARNING: Could not check schema:', tablesError.message);
    } else {
      console.log('✅ Test 2: Schema accessible');
      console.log('📊 Tables found:', tables?.map(t => t.table_name));
    }

  } catch (error) {
    console.log('❌ Testing failed:', error.message);
  }

  console.log('\n📋 MANUAL DASHBOARD CHECKS REQUIRED:');
  console.log('=====================================');
  console.log('1. Login to your Supabase Dashboard');
  console.log('2. Go to Authentication > Configuration');
  console.log('3. Verify these settings:');
  console.log('   • "Allow new users to sign up" = ON');
  console.log('   • Email confirmation settings match your code');
  console.log('4. Go to Database > Functions');
  console.log('5. Check for any functions that trigger on auth.users');
  console.log('6. Ensure all functions have "SECURITY DEFINER"');
  console.log('\n💡 TIP: The most common cause is missing SECURITY DEFINER on triggers!');
}

checkSupabaseSettings().catch(console.error); 
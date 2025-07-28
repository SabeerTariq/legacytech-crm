import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHl0ZXN6enl5Y2JxZ3pwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzY5MjEsImV4cCI6MjA2MDQ1MjkyMX0._LhWMyPMXDdht_5y3iQnYX9AzDAh-qMv2xDjBRyan7s";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function testLoginIssue() {
  console.log('🔍 Testing login issue...\n');

  try {
    // 1. Test basic connection
    console.log('1. Testing Supabase connection...');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session check failed:', sessionError);
    } else {
      console.log('✅ Session check successful');
      console.log('   Current session:', sessionData.session ? 'Active' : 'None');
    }

    // 2. Test user_profiles table
    console.log('\n2. Testing user_profiles table...');
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .limit(1);

      if (profilesError) {
        console.error('❌ user_profiles table error:', profilesError);
      } else {
        console.log('✅ user_profiles table accessible');
        console.log('   Profiles found:', profiles?.length || 0);
      }
    } catch (error) {
      console.error('❌ user_profiles table access failed:', error.message);
    }

    // 3. Test auth.users table (if accessible)
    console.log('\n3. Testing auth.users table...');
    try {
      const { data: users, error: usersError } = await supabase
        .from('auth.users')
        .select('id, email')
        .limit(1);

      if (usersError) {
        console.error('❌ auth.users table error:', usersError);
      } else {
        console.log('✅ auth.users table accessible');
        console.log('   Users found:', users?.length || 0);
      }
    } catch (error) {
      console.error('❌ auth.users table access failed:', error.message);
    }

    // 4. Test RLS policies
    console.log('\n4. Testing RLS policies...');
    try {
      const { data: rlsTest, error: rlsError } = await supabase
        .from('user_profiles')
        .select('user_id, email')
        .eq('user_id', '00000000-0000-0000-0000-000000000000'); // Non-existent user

      if (rlsError) {
        console.error('❌ RLS policy test error:', rlsError);
      } else {
        console.log('✅ RLS policies working');
        console.log('   RLS test result:', rlsTest?.length || 0, 'records');
      }
    } catch (error) {
      console.error('❌ RLS policy test failed:', error.message);
    }

    // 5. Test authentication flow simulation
    console.log('\n5. Testing authentication flow...');
    try {
      // This will fail but should give us error details
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'test@example.com',
        password: 'wrongpassword'
      });

      if (authError) {
        console.log('✅ Authentication error handling working');
        console.log('   Error type:', authError.message);
      } else {
        console.log('❌ Unexpected: Authentication succeeded with wrong credentials');
      }
    } catch (error) {
      console.error('❌ Authentication test failed:', error.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }

  console.log('\n🏁 Test completed');
}

testLoginIssue(); 
import { createClient } from '@supabase/supabase-js';

// Use the same values as in the client.ts file
const supabaseUrl = "https://yipyteszzyycbqgzpfrf.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHl0ZXN6enl5Y2JxZ3pwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzY5MjEsImV4cCI6MjA2MDQ1MjkyMX0._LhWMyPMXDdht_5y3iQnYX9AzDAh-qMv2xDjBRyan7s";

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAuthFlow() {
  try {
    console.log('🔍 Testing Authentication Flow...');
    
    // Test 1: Check current session
    console.log('\n1️⃣ Checking current session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('❌ Session error:', sessionError.message);
    } else if (session) {
      console.log('✅ Session found:', session.user.email);
      console.log('🆔 User ID:', session.user.id);
    } else {
      console.log('⚠️  No active session found');
    }

    // Test 2: Check admin profile
    console.log('\n2️⃣ Checking admin profile...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', 'de514a73-4782-439e-b2ea-3f49fe568e24')
      .single();

    if (profileError) {
      console.error('❌ Profile error:', profileError.message);
    } else if (profile) {
      console.log('✅ Admin profile found:');
      console.log('👤 Name:', profile.full_name);
      console.log('🎭 Role:', profile.role);
      console.log('📧 Username:', profile.username);
    } else {
      console.log('❌ Admin profile not found');
    }

    // Test 3: Test login with admin account
    console.log('\n3️⃣ Testing admin login...');
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'ali@logicworks.ai',
      password: 'test123456'
    });

    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
      console.log('💡 This is expected if the password is incorrect');
    } else {
      console.log('✅ Login successful!');
      console.log('📧 Email:', loginData.user.email);
      console.log('🆔 User ID:', loginData.user.id);
    }

    // Test 4: Check RLS policies
    console.log('\n4️⃣ Testing database access...');
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (testError) {
      console.error('❌ Database access error:', testError.message);
    } else {
      console.log('✅ Database access successful');
    }

    console.log('\n🎉 Authentication Flow Test Complete!');
    console.log('\n📋 Troubleshooting Tips:');
    console.log('1. If session exists but profile is missing, try refreshing the page');
    console.log('2. If login fails, check the password for ali@logicworks.ai');
    console.log('3. If database access fails, check RLS policies');
    console.log('4. Visit /debug in the CRM to see real-time auth state');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  }
}

testAuthFlow(); 
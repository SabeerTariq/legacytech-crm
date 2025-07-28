import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHl0ZXN6enl5Y2JxZ3pwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzY5MjEsImV4cCI6MjA2MDQ1MjkyMX0._LhWMyPMXDdht_5y3iQnYX9AzDAh-qMv2xDjBRyan7s";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function createTestUser() {
  console.log('🔧 Creating test user...\n');

  const testEmail = 'test@logicworks.com';
  const testPassword = 'TestPassword123!';

  try {
    // Check if user already exists
    console.log('1. Checking if user exists...');
    const { data: existingUser, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (existingUser.user) {
      console.log('✅ User already exists and can sign in');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
      console.log(`   User ID: ${existingUser.user.id}`);
      return;
    }

    // Create new user
    console.log('2. Creating new user...');
    const { data: newUser, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          full_name: 'Test User',
          department: 'Testing',
          position: 'Tester'
        }
      }
    });

    if (signUpError) {
      console.error('❌ Error creating user:', signUpError.message);
      return;
    }

    if (newUser.user) {
      console.log('✅ User created successfully!');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
      console.log(`   User ID: ${newUser.user.id}`);
      console.log('\n🎯 You can now use these credentials to test the login:');
      console.log(`   Email: ${testEmail}`);
      console.log(`   Password: ${testPassword}`);
    } else {
      console.log('❌ User creation failed - no user data returned');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createTestUser(); 
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

async function testSimpleUserCreation() {
  console.log('🧪 Testing Simple User Creation\n');

  try {
    // Test creating a user with minimal data
    const testEmail = `test-${Date.now()}@logicworks.com`;
    console.log('Creating user with email:', testEmail);

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: 'TestPassword123!',
      email_confirm: true,
      user_metadata: {
        test: true
      }
    });

    if (authError) {
      console.log('❌ Auth creation error:', authError.message);
      console.log('Error details:', JSON.stringify(authError, null, 2));
    } else {
      console.log('✅ User created successfully:', authData.user.id);
      
      // Check if user profile was created
      const { data: profileData, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('user_id', authData.user.id)
        .single();

      if (profileError) {
        console.log('❌ Profile check error:', profileError.message);
      } else {
        console.log('✅ User profile found:', profileData);
      }

      // Clean up
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      console.log('✅ Test user cleaned up');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testSimpleUserCreation(); 
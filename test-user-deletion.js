import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testUserDeletion() {
  console.log('🧪 Testing User Deletion...\n');

  try {
    // 1. Check current state
    console.log('1. Checking current state...');
    
    const { data: authUser, error: authError } = await supabaseAdmin
      .from('auth.users')
      .select('id, email, created_at')
      .eq('email', 'shahbaz.khan@logicworks.com')
      .single();

    if (authError) {
      console.log('❌ User not found in auth.users:', authError.message);
    } else {
      console.log('✅ User found in auth.users:', authUser);
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, email, created_at')
      .eq('email', 'shahbaz.khan@logicworks.com')
      .single();

    if (profileError) {
      console.log('❌ User not found in user_profiles:', profileError.message);
    } else {
      console.log('✅ User found in user_profiles:', profile);
    }

    // 2. Test safe delete function
    console.log('\n2. Testing safe delete function...');
    
    const { data: deleteResult, error: deleteError } = await supabaseAdmin.rpc('safe_delete_user', {
      user_email: 'shahbaz.khan@logicworks.com'
    });

    if (deleteError) {
      console.log('❌ Safe delete error:', deleteError);
    } else {
      console.log('✅ Safe delete result:', deleteResult);
    }

    // 3. Verify deletion
    console.log('\n3. Verifying deletion...');
    
    const { data: authUserAfter, error: authErrorAfter } = await supabaseAdmin
      .from('auth.users')
      .select('id, email')
      .eq('email', 'shahbaz.khan@logicworks.com')
      .single();

    if (authErrorAfter) {
      console.log('✅ User successfully deleted from auth.users');
    } else {
      console.log('❌ User still exists in auth.users:', authUserAfter);
    }

    const { data: profileAfter, error: profileErrorAfter } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, email')
      .eq('email', 'shahbaz.khan@logicworks.com')
      .single();

    if (profileErrorAfter) {
      console.log('✅ User successfully deleted from user_profiles');
    } else {
      console.log('❌ User still exists in user_profiles:', profileAfter);
    }

    console.log('\n🎉 User deletion test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUserDeletion(); 
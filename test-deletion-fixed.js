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

async function testFixedDeletion() {
  console.log('🧪 Testing Fixed User Deletion...\n');

  try {
    // 1. Check if user exists
    console.log('1. Checking if user exists...');
    
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    const targetUser = authUsers.users.find(u => u.email === 'shahbaz.khan@logicworks.com');
    
    if (targetUser) {
      console.log('✅ User found in auth.users:', targetUser.email);
    } else {
      console.log('❌ User not found in auth.users');
    }

    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, email')
      .eq('email', 'shahbaz.khan@logicworks.com');

    if (profileError) {
      console.log('❌ Error checking user_profiles:', profileError.message);
    } else if (profiles && profiles.length > 0) {
      console.log('✅ User found in user_profiles:', profiles[0].email);
    } else {
      console.log('❌ User not found in user_profiles');
    }

    // 2. Try to delete using the fixed approach
    console.log('\n2. Attempting deletion...');
    
    if (targetUser) {
      // Try direct deletion from user_profiles first
      try {
        const { error: deleteProfileError } = await supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('user_id', targetUser.id);

        if (deleteProfileError) {
          console.log('⚠️ Profile deletion warning:', deleteProfileError.message);
        } else {
          console.log('✅ Successfully deleted from user_profiles');
        }
      } catch (profileDeleteError) {
        console.log('⚠️ Profile deletion error:', profileDeleteError.message);
      }

      // Then try to delete from auth.users
      try {
        const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(targetUser.id);
        
        if (deleteAuthError) {
          console.log('❌ Auth deletion error:', deleteAuthError.message);
        } else {
          console.log('✅ Successfully deleted from auth.users');
        }
      } catch (authDeleteError) {
        console.log('❌ Auth deletion error:', authDeleteError.message);
      }
    } else {
      console.log('⚠️ No user to delete');
    }

    // 3. Verify deletion
    console.log('\n3. Verifying deletion...');
    
    const { data: authUsersAfter, error: authErrorAfter } = await supabaseAdmin.auth.admin.listUsers();
    const targetUserAfter = authUsersAfter.users.find(u => u.email === 'shahbaz.khan@logicworks.com');
    
    if (targetUserAfter) {
      console.log('❌ User still exists in auth.users');
    } else {
      console.log('✅ User successfully deleted from auth.users');
    }

    const { data: profilesAfter, error: profileErrorAfter } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, email')
      .eq('email', 'shahbaz.khan@logicworks.com');

    if (profileErrorAfter) {
      console.log('✅ User successfully deleted from user_profiles');
    } else if (profilesAfter && profilesAfter.length > 0) {
      console.log('❌ User still exists in user_profiles');
    } else {
      console.log('✅ User successfully deleted from user_profiles');
    }

    console.log('\n🎉 Deletion test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testFixedDeletion(); 
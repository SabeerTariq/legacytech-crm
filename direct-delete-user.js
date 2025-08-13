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

async function directDeleteUser() {
  console.log('🔧 Direct User Deletion...\n');

  try {
    const userEmail = 'shahbaz.khan@logicworks.com';

    // 1. Check current state
    console.log('1. Checking current state...');
    
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    const targetUser = authUsers.users.find(u => u.email === userEmail);
    
    if (targetUser) {
      console.log('✅ User found in auth.users:', targetUser.email, 'ID:', targetUser.id);
    } else {
      console.log('❌ User not found in auth.users');
      return;
    }

    // 2. Try direct SQL deletion
    console.log('\n2. Attempting direct SQL deletion...');
    
    try {
      // First, check if there are any foreign key references
      console.log('Checking for foreign key references...');
      
      // Check user_permissions
      const { data: permissions, error: permError } = await supabaseAdmin
        .from('user_permissions')
        .select('id')
        .eq('user_id', targetUser.id);

      if (!permError && permissions && permissions.length > 0) {
        console.log(`Found ${permissions.length} user_permissions records, deleting...`);
        const { error: deletePermError } = await supabaseAdmin
          .from('user_permissions')
          .delete()
          .eq('user_id', targetUser.id);
        
        if (deletePermError) {
          console.log('⚠️ Error deleting user_permissions:', deletePermError.message);
        } else {
          console.log('✅ Successfully deleted user_permissions');
        }
      }

      // Check any other tables that might reference this user
      const { data: userProfiles, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('id')
        .eq('user_id', targetUser.id);

      if (!profileError && userProfiles && userProfiles.length > 0) {
        console.log(`Found ${userProfiles.length} user_profiles records, deleting...`);
        const { error: deleteProfileError } = await supabaseAdmin
          .from('user_profiles')
          .delete()
          .eq('user_id', targetUser.id);
        
        if (deleteProfileError) {
          console.log('⚠️ Error deleting user_profiles:', deleteProfileError.message);
        } else {
          console.log('✅ Successfully deleted user_profiles');
        }
      }

      // Now try to delete from auth.users using direct SQL
      console.log('Attempting direct SQL deletion from auth.users...');
      
      const { data: sqlResult, error: sqlError } = await supabaseAdmin.rpc('exec_sql', {
        sql: `DELETE FROM auth.users WHERE id = '${targetUser.id}'`
      });

      if (sqlError) {
        console.log('❌ Direct SQL deletion failed:', sqlError.message);
        
        // Try alternative approach - update the user to be inactive instead
        console.log('Trying alternative approach - marking user as inactive...');
        
        const { error: updateError } = await supabaseAdmin.rpc('exec_sql', {
          sql: `UPDATE auth.users SET email = 'deleted_${Date.now()}@deleted.com', raw_user_meta_data = '{"deleted": true, "deleted_at": "${new Date().toISOString()}"}' WHERE id = '${targetUser.id}'`
        });

        if (updateError) {
          console.log('❌ Alternative approach failed:', updateError.message);
        } else {
          console.log('✅ Successfully marked user as deleted');
        }
      } else {
        console.log('✅ Successfully deleted user via direct SQL');
      }

    } catch (sqlError) {
      console.log('❌ SQL deletion error:', sqlError.message);
    }

    // 3. Verify deletion
    console.log('\n3. Verifying deletion...');
    
    const { data: authUsersAfter, error: authErrorAfter } = await supabaseAdmin.auth.admin.listUsers();
    const targetUserAfter = authUsersAfter.users.find(u => u.email === userEmail);
    
    if (targetUserAfter) {
      console.log('❌ User still exists in auth.users');
      console.log('User details:', targetUserAfter);
    } else {
      console.log('✅ User successfully deleted from auth.users');
    }

    console.log('\n🎉 Direct deletion test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
directDeleteUser(); 
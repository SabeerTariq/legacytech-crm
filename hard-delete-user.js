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

async function hardDeleteUser() {
  console.log('🔧 Hard Delete User from Database...\n');

  try {
    // 1. Find the user with the deleted email
    console.log('1. Finding user with deleted email...');
    
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    const deletedUser = authUsers.users.find(u => u.email.includes('deleted_'));
    
    if (deletedUser) {
      console.log('✅ Found deleted user:', deletedUser.email, 'ID:', deletedUser.id);
    } else {
      console.log('❌ No deleted user found');
      return;
    }

    // 2. Check for any remaining foreign key references
    console.log('\n2. Checking for remaining foreign key references...');
    
    // Check user_permissions
    const { data: permissions, error: permError } = await supabaseAdmin
      .from('user_permissions')
      .select('id')
      .eq('user_id', deletedUser.id);

    if (!permError && permissions && permissions.length > 0) {
      console.log(`Found ${permissions.length} user_permissions records, deleting...`);
      const { error: deletePermError } = await supabaseAdmin
        .from('user_permissions')
        .delete()
        .eq('user_id', deletedUser.id);
      
      if (deletePermError) {
        console.log('⚠️ Error deleting user_permissions:', deletePermError.message);
      } else {
        console.log('✅ Successfully deleted user_permissions');
      }
    } else {
      console.log('✅ No user_permissions found');
    }

    // Check user_profiles
    const { data: userProfiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('id')
      .eq('user_id', deletedUser.id);

    if (!profileError && userProfiles && userProfiles.length > 0) {
      console.log(`Found ${userProfiles.length} user_profiles records, deleting...`);
      const { error: deleteProfileError } = await supabaseAdmin
        .from('user_profiles')
        .delete()
        .eq('user_id', deletedUser.id);
      
      if (deleteProfileError) {
        console.log('⚠️ Error deleting user_profiles:', deleteProfileError.message);
      } else {
        console.log('✅ Successfully deleted user_profiles');
      }
    } else {
      console.log('✅ No user_profiles found');
    }

    // Check user_roles
    const { data: userRoles, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('id')
      .eq('user_id', deletedUser.id);

    if (!roleError && userRoles && userRoles.length > 0) {
      console.log(`Found ${userRoles.length} user_roles records, deleting...`);
      const { error: deleteRoleError } = await supabaseAdmin
        .from('user_roles')
        .delete()
        .eq('user_id', deletedUser.id);
      
      if (deleteRoleError) {
        console.log('⚠️ Error deleting user_roles:', deleteRoleError.message);
      } else {
        console.log('✅ Successfully deleted user_roles');
      }
    } else {
      console.log('✅ No user_roles found');
    }

    // 3. Try to delete the user from auth.users using direct SQL
    console.log('\n3. Attempting to delete user from auth.users...');
    
    try {
      // First, let's try to use the Supabase Auth admin API
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(deletedUser.id);
      
      if (deleteAuthError) {
        console.log('❌ Auth API deletion error:', deleteAuthError.message);
        
        // If that fails, try to use a different approach
        console.log('Trying alternative approach...');
        
        // Try to update the user to a different state first
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(deletedUser.id, {
          email: `temp_${Date.now()}@temp.com`,
          user_metadata: { status: 'deleting' }
        });
        
        if (updateError) {
          console.log('❌ Update user error:', updateError.message);
        } else {
          console.log('✅ Successfully updated user email');
          
          // Now try to delete again
          const { error: deleteError2 } = await supabaseAdmin.auth.admin.deleteUser(deletedUser.id);
          
          if (deleteError2) {
            console.log('❌ Second deletion attempt failed:', deleteError2.message);
          } else {
            console.log('✅ Successfully deleted user from auth.users');
          }
        }
      } else {
        console.log('✅ Successfully deleted user from auth.users');
      }
    } catch (authDeleteError) {
      console.log('❌ Auth deletion error:', authDeleteError.message);
    }

    // 4. Verify deletion
    console.log('\n4. Verifying deletion...');
    
    const { data: authUsersAfter, error: authErrorAfter } = await supabaseAdmin.auth.admin.listUsers();
    const deletedUserAfter = authUsersAfter.users.find(u => u.id === deletedUser.id);
    
    if (deletedUserAfter) {
      console.log('❌ User still exists in auth.users');
      console.log('User details:', {
        id: deletedUserAfter.id,
        email: deletedUserAfter.email,
        created_at: deletedUserAfter.created_at
      });
    } else {
      console.log('✅ User successfully deleted from auth.users');
    }

    // Check if any deleted users remain
    const remainingDeletedUsers = authUsersAfter.users.filter(u => u.email.includes('deleted_'));
    if (remainingDeletedUsers.length > 0) {
      console.log(`⚠️ Found ${remainingDeletedUsers.length} users with deleted emails`);
      remainingDeletedUsers.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`);
      });
    } else {
      console.log('✅ No users with deleted emails found');
    }

    console.log('\n🎉 Hard deletion test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
hardDeleteUser(); 
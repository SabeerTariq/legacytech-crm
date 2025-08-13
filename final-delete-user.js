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

async function finalDeleteUser() {
  console.log('🔧 Final User Deletion Attempt...\n');

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

    // 2. Check for any remaining foreign key references
    console.log('\n2. Checking for remaining foreign key references...');
    
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
    } else {
      console.log('✅ No user_permissions found');
    }

    // Check user_profiles
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
    } else {
      console.log('✅ No user_profiles found');
    }

    // Check for any other potential references
    console.log('Checking for other potential references...');
    
    // Check if there are any other tables that might reference this user
    const tablesToCheck = [
      'user_roles',
      'role_hierarchies', 
      'permission_audit_log'
    ];

    for (const tableName of tablesToCheck) {
      try {
        const { data: refs, error: refError } = await supabaseAdmin
          .from(tableName)
          .select('id')
          .eq('user_id', targetUser.id);

        if (!refError && refs && refs.length > 0) {
          console.log(`Found ${refs.length} references in ${tableName}, deleting...`);
          const { error: deleteRefError } = await supabaseAdmin
            .from(tableName)
            .delete()
            .eq('user_id', targetUser.id);
          
          if (deleteRefError) {
            console.log(`⚠️ Error deleting from ${tableName}:`, deleteRefError.message);
          } else {
            console.log(`✅ Successfully deleted from ${tableName}`);
          }
        }
      } catch (tableError) {
        console.log(`Table ${tableName} doesn't exist or error checking:`, tableError.message);
      }
    }

    // 3. Try to delete the user using Supabase Auth admin API
    console.log('\n3. Attempting to delete user from auth.users...');
    
    try {
      const { error: deleteAuthError } = await supabaseAdmin.auth.admin.deleteUser(targetUser.id);
      
      if (deleteAuthError) {
        console.log('❌ Auth deletion error:', deleteAuthError.message);
        
        // If direct deletion fails, try to mark the user as deleted
        console.log('Trying to mark user as deleted instead...');
        
        try {
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(targetUser.id, {
            email: `deleted_${Date.now()}@deleted.com`,
            user_metadata: { deleted: true, deleted_at: new Date().toISOString() }
          });
          
          if (updateError) {
            console.log('❌ Update user error:', updateError.message);
          } else {
            console.log('✅ Successfully marked user as deleted');
          }
        } catch (updateError) {
          console.log('❌ Update user error:', updateError.message);
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
    const targetUserAfter = authUsersAfter.users.find(u => u.email === userEmail);
    
    if (targetUserAfter) {
      console.log('❌ User still exists in auth.users');
      console.log('User details:', {
        id: targetUserAfter.id,
        email: targetUserAfter.email,
        created_at: targetUserAfter.created_at
      });
    } else {
      console.log('✅ User successfully deleted from auth.users');
    }

    // Check if user still exists with modified email
    const deletedUsers = authUsersAfter.users.filter(u => u.email.includes('deleted_'));
    if (deletedUsers.length > 0) {
      console.log('✅ User marked as deleted (found modified email)');
    }

    console.log('\n🎉 Final deletion test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
finalDeleteUser(); 
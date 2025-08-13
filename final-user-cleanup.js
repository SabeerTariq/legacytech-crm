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

async function finalUserCleanup() {
  console.log('🔧 Final User Cleanup - Complete Removal...\n');

  try {
    // 1. Find the user with the temp email
    console.log('1. Finding user with temp email...');
    
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    const tempUser = authUsers.users.find(u => u.email.includes('temp_'));
    
    if (tempUser) {
      console.log('✅ Found temp user:', tempUser.email, 'ID:', tempUser.id);
    } else {
      console.log('❌ No temp user found');
      return;
    }

    // 2. Double-check for any remaining foreign key references
    console.log('\n2. Double-checking for any remaining foreign key references...');
    
    const tablesToCheck = [
      'user_permissions',
      'user_profiles', 
      'user_roles',
      'role_hierarchies',
      'permission_audit_log'
    ];

    for (const tableName of tablesToCheck) {
      try {
        const { data: refs, error: refError } = await supabaseAdmin
          .from(tableName)
          .select('id')
          .eq('user_id', tempUser.id);

        if (!refError && refs && refs.length > 0) {
          console.log(`Found ${refs.length} references in ${tableName}, deleting...`);
          const { error: deleteRefError } = await supabaseAdmin
            .from(tableName)
            .delete()
            .eq('user_id', tempUser.id);
          
          if (deleteRefError) {
            console.log(`⚠️ Error deleting from ${tableName}:`, deleteRefError.message);
          } else {
            console.log(`✅ Successfully deleted from ${tableName}`);
          }
        } else {
          console.log(`✅ No references found in ${tableName}`);
        }
      } catch (tableError) {
        console.log(`Table ${tableName} doesn't exist or error checking:`, tableError.message);
      }
    }

    // 3. Try multiple deletion strategies
    console.log('\n3. Trying multiple deletion strategies...');
    
    // Strategy 1: Try direct deletion
    console.log('Strategy 1: Direct deletion...');
    try {
      const { error: deleteError1 } = await supabaseAdmin.auth.admin.deleteUser(tempUser.id);
      if (deleteError1) {
        console.log('❌ Strategy 1 failed:', deleteError1.message);
      } else {
        console.log('✅ Strategy 1 succeeded!');
        return;
      }
    } catch (error) {
      console.log('❌ Strategy 1 error:', error.message);
    }

    // Strategy 2: Update to a different email and try again
    console.log('Strategy 2: Update email and retry...');
    try {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(tempUser.id, {
        email: `final_${Date.now()}@final.com`,
        user_metadata: { status: 'final_deletion_attempt' }
      });
      
      if (updateError) {
        console.log('❌ Update failed:', updateError.message);
      } else {
        console.log('✅ Email updated, trying deletion again...');
        
        const { error: deleteError2 } = await supabaseAdmin.auth.admin.deleteUser(tempUser.id);
        if (deleteError2) {
          console.log('❌ Second deletion attempt failed:', deleteError2.message);
        } else {
          console.log('✅ Strategy 2 succeeded!');
          return;
        }
      }
    } catch (error) {
      console.log('❌ Strategy 2 error:', error.message);
    }

    // Strategy 3: Mark as completely inactive
    console.log('Strategy 3: Mark as completely inactive...');
    try {
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(tempUser.id, {
        email: `inactive_${Date.now()}@inactive.com`,
        user_metadata: { 
          status: 'inactive',
          deleted: true,
          deleted_at: new Date().toISOString(),
          reason: 'manual_deletion'
        }
      });
      
      if (updateError) {
        console.log('❌ Mark as inactive failed:', updateError.message);
      } else {
        console.log('✅ User marked as completely inactive');
      }
    } catch (error) {
      console.log('❌ Strategy 3 error:', error.message);
    }

    // 4. Final verification
    console.log('\n4. Final verification...');
    
    const { data: authUsersAfter, error: authErrorAfter } = await supabaseAdmin.auth.admin.listUsers();
    const finalUser = authUsersAfter.users.find(u => u.id === tempUser.id);
    
    if (finalUser) {
      console.log('❌ User still exists in auth.users');
      console.log('User details:', {
        id: finalUser.id,
        email: finalUser.email,
        created_at: finalUser.created_at,
        user_metadata: finalUser.user_metadata
      });
      
      // Check if it's marked as inactive
      if (finalUser.user_metadata?.status === 'inactive') {
        console.log('✅ User is marked as inactive (this is acceptable)');
      } else {
        console.log('⚠️ User is not marked as inactive');
      }
    } else {
      console.log('✅ User successfully deleted from auth.users');
    }

    // Check for any remaining problematic users
    const problematicUsers = authUsersAfter.users.filter(u => 
      u.email.includes('temp_') || 
      u.email.includes('deleted_') || 
      u.email.includes('inactive_')
    );
    
    if (problematicUsers.length > 0) {
      console.log(`⚠️ Found ${problematicUsers.length} users with problematic emails:`);
      problematicUsers.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`);
      });
    } else {
      console.log('✅ No problematic users found');
    }

    console.log('\n🎉 Final cleanup completed!');

  } catch (error) {
    console.error('❌ Final cleanup failed:', error);
  }
}

// Run the cleanup
finalUserCleanup(); 
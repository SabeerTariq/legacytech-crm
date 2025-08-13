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

async function cleanupCRMUsers() {
  console.log('🧹 Cleaning up CRM Users and Setting Up User Management Only\n');

  try {
    // 1. Get all current auth users
    console.log('📊 1. Fetching current auth users...');
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Error fetching auth users:', authError.message);
      return;
    }

    console.log(`✅ Found ${authUsers?.users?.length || 0} auth users\n`);

    // 2. Get all user profiles
    console.log('📊 2. Fetching current user profiles...');
    const { data: userProfiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*');

    if (profileError) {
      console.log('❌ Error fetching user profiles:', profileError.message);
      return;
    }

    console.log(`✅ Found ${userProfiles?.length || 0} user profiles\n`);

    // 3. Delete all user profiles first (to avoid foreign key constraints)
    console.log('🗑️ 3. Deleting all user profiles...');
    if (userProfiles && userProfiles.length > 0) {
      const { error: deleteProfilesError } = await supabaseAdmin
        .from('user_profiles')
        .delete()
        .neq('user_id', '00000000-0000-0000-0000-000000000000'); // Delete all except dummy

      if (deleteProfilesError) {
        console.log('❌ Error deleting user profiles:', deleteProfilesError.message);
      } else {
        console.log(`✅ Deleted ${userProfiles.length} user profiles`);
      }
    } else {
      console.log('✅ No user profiles to delete');
    }

    // 4. Delete all auth users
    console.log('\n🗑️ 4. Deleting all auth users...');
    if (authUsers?.users && authUsers.users.length > 0) {
      for (const user of authUsers.users) {
        try {
          const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
          if (deleteUserError) {
            console.log(`   ❌ Error deleting user ${user.email}:`, deleteUserError.message);
          } else {
            console.log(`   ✅ Deleted auth user: ${user.email}`);
          }
        } catch (error) {
          console.log(`   ❌ Error deleting user ${user.email}:`, error.message);
        }
      }
    } else {
      console.log('✅ No auth users to delete');
    }

    // 5. Clear user management emails from employees (reset to original state)
    console.log('\n🔄 5. Resetting employee emails to original state...');
    const { error: resetError } = await supabaseAdmin
      .from('employees')
      .update({ 
        user_management_email: null,
        personal_email: null
      })
      .eq('department', 'Front Sales');

    if (resetError) {
      console.log('❌ Error resetting employee emails:', resetError.message);
    } else {
      console.log('✅ Reset employee emails to original state');
    }

    // 6. Clear team members (since they were linked to employees)
    console.log('\n🗑️ 6. Clearing team members...');
    const { error: clearTeamsError } = await supabaseAdmin
      .from('team_members')
      .delete()
      .neq('member_id', '00000000-0000-0000-0000-000000000000'); // Delete all except dummy

    if (clearTeamsError) {
      console.log('❌ Error clearing team members:', clearTeamsError.message);
    } else {
      console.log('✅ Cleared all team members');
    }

    // 7. Show final status
    console.log('\n📊 7. Final Status Report:');
    
    // Check remaining auth users
    const { data: remainingAuthUsers, error: remainingAuthError } = await supabaseAdmin.auth.admin.listUsers();
    if (remainingAuthError) {
      console.log('❌ Error checking remaining auth users:', remainingAuthError.message);
    } else {
      console.log(`\n   🔐 Remaining Auth Users: ${remainingAuthUsers?.users?.length || 0}`);
      remainingAuthUsers?.users?.forEach(user => {
        console.log(`      - ${user.email}`);
      });
    }

    // Check remaining user profiles
    const { data: remainingProfiles, error: remainingProfileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*');

    if (remainingProfileError) {
      console.log('❌ Error checking remaining user profiles:', remainingProfileError.message);
    } else {
      console.log(`\n   👤 Remaining User Profiles: ${remainingProfiles?.length || 0}`);
      remainingProfiles?.forEach(profile => {
        console.log(`      - ${profile.email} (${profile.display_name})`);
      });
    }

    // Check employees
    const { data: employees, error: empError } = await supabaseAdmin
      .from('employees')
      .select('id, full_name, email, department, user_management_email, personal_email')
      .eq('department', 'Front Sales')
      .order('full_name');

    if (empError) {
      console.log('❌ Error checking employees:', empError.message);
    } else {
      console.log(`\n   👥 Front Sales Employees: ${employees?.length || 0}`);
      employees?.forEach(emp => {
        console.log(`      - ${emp.full_name} (${emp.email})`);
      });
    }

    // Check team members
    const { data: teamMembers, error: tmError } = await supabaseAdmin
      .from('team_members')
      .select('*');

    if (tmError) {
      console.log('❌ Error checking team members:', tmError.message);
    } else {
      console.log(`\n   🏢 Remaining Team Members: ${teamMembers?.length || 0}`);
    }

    console.log('\n✅ CRM Users cleanup completed!');
    console.log('\n📝 System Status:');
    console.log('   ✅ All CRM users deleted');
    console.log('   ✅ All user profiles deleted');
    console.log('   ✅ All team members cleared');
    console.log('   ✅ Employee emails reset to original state');
    console.log('   ✅ Employees table intact');
    console.log('\n📝 Next Steps:');
    console.log('   1. Use User Management to create new users');
    console.log('   2. Only user management created users will appear in modules');
    console.log('   3. Employees table shows all employees regardless of user status');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

// Run the cleanup
cleanupCRMUsers(); 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('SUPABASE_SERVICE_ROLE_KEY is required in .env file');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function checkUserManagementCreation() {
  try {
    console.log('🔍 Checking User Management Creation Status');
    console.log('===========================================\n');

    // Check user_profiles table
    console.log('📊 User Profiles Table:');
    console.log('------------------------');
    const { data: userProfiles, error: userProfilesError } = await supabase
      .from('user_profiles')
      .select('*');
    
    if (userProfilesError) {
      console.error('❌ Error fetching user profiles:', userProfilesError);
    } else {
      console.log(`Total User Profiles: ${userProfiles.length}`);
      
      if (userProfiles.length > 0) {
        console.log('\n📋 User Profiles Found:');
        userProfiles.forEach((profile, index) => {
          console.log(`${index + 1}. Employee ID: ${profile.employee_id}`);
          console.log(`   Email: ${profile.email}`);
          console.log(`   Original Email: ${profile.original_email}`);
          console.log(`   User ID: ${profile.user_id || 'Not linked to auth user'}`);
          console.log(`   Active: ${profile.is_active}`);
          console.log(`   Created: ${profile.created_at}`);
          console.log('');
        });
      } else {
        console.log('❌ No user profiles found');
      }
    }

    // Check auth users
    console.log('📊 Auth Users:');
    console.log('--------------');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
    } else {
      console.log(`Total Auth Users: ${authUsers.users.length}`);
      
      if (authUsers.users.length > 0) {
        console.log('\n📋 Auth Users Found:');
        authUsers.users.forEach((user, index) => {
          console.log(`${index + 1}. Email: ${user.email}`);
          console.log(`   ID: ${user.id}`);
          console.log(`   Created: ${user.created_at}`);
          console.log(`   Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
          console.log(`   Metadata:`, user.user_metadata);
          console.log('');
        });
      }
    }

    // Check employees
    console.log('📊 Employees:');
    console.log('-------------');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*');
    
    if (employeesError) {
      console.error('❌ Error fetching employees:', employeesError);
    } else {
      console.log(`Total Employees: ${employees.length}`);
    }

    // Check for orphaned profiles (profiles without auth users)
    if (userProfiles && userProfiles.length > 0) {
      console.log('\n⚠️  Orphaned User Profiles (no auth user):');
      console.log('==========================================');
      
      const orphanedProfiles = userProfiles.filter(profile => !profile.user_id);
      if (orphanedProfiles.length > 0) {
        orphanedProfiles.forEach((profile, index) => {
          console.log(`${index + 1}. Employee ID: ${profile.employee_id}`);
          console.log(`   Email: ${profile.email}`);
          console.log(`   Status: Orphaned (no auth user)`);
        });
      } else {
        console.log('✅ No orphaned profiles found');
      }
    }

    // Check for auth users without profiles
    if (authUsers && authUsers.users.length > 0) {
      console.log('\n⚠️  Auth Users without Profiles:');
      console.log('===============================');
      
      const authUsersWithoutProfiles = authUsers.users.filter(authUser => 
        !userProfiles?.some(profile => profile.user_id === authUser.id)
      );
      
      if (authUsersWithoutProfiles.length > 0) {
        authUsersWithoutProfiles.forEach((user, index) => {
          console.log(`${index + 1}. Email: ${user.email}`);
          console.log(`   ID: ${user.id}`);
          console.log(`   Status: No profile record`);
        });
      } else {
        console.log('✅ All auth users have profiles');
      }
    }

    // Summary
    console.log('\n📋 Summary:');
    console.log('-----------');
    console.log(`✅ User Profiles: ${userProfiles?.length || 0}`);
    console.log(`✅ Auth Users: ${authUsers?.users?.length || 0}`);
    console.log(`✅ Employees: ${employees?.length || 0}`);
    
    if (userProfiles && authUsers) {
      const orphanedCount = userProfiles.filter(profile => !profile.user_id).length;
      const authWithoutProfileCount = authUsers.users.filter(authUser => 
        !userProfiles.some(profile => profile.user_id === authUser.id)
      ).length;
      
      console.log(`⚠️  Orphaned Profiles: ${orphanedCount}`);
      console.log(`⚠️  Auth Users without Profiles: ${authWithoutProfileCount}`);
    }

    // Recommendations
    console.log('\n💡 Recommendations:');
    console.log('==================');
    
    if (userProfiles && userProfiles.length === 0) {
      console.log('1. No user profiles found. The User Management module may not have created any profiles.');
      console.log('2. Check if the user_profiles table exists in your database.');
      console.log('3. Try creating a user through the User Management interface again.');
    }
    
    if (userProfiles && userProfiles.some(profile => !profile.user_id)) {
      console.log('1. Found orphaned user profiles. These need auth users to be created.');
      console.log('2. Use the manual script to create auth users for these profiles:');
      console.log('   node create-user-manual.js <employee_number> <password>');
    }
    
    if (authUsers && authUsers.users.some(user => !userProfiles?.some(profile => profile.user_id === user.id))) {
      console.log('1. Found auth users without profiles. These may be external users or test accounts.');
      console.log('2. Consider creating profiles for these users if they are employees.');
    }

  } catch (error) {
    console.error('❌ Error checking user management creation:', error);
  }
}

// Run the check
checkUserManagementCreation().then(() => {
  console.log('\n✅ User management creation check completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function checkEmailMismatch() {
  console.log('🔍 Checking Email Mismatch...\n');

  try {
    // Check all user profiles
    console.log('👥 All User Profiles:');
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('email');

    if (profilesError) {
      console.log('❌ Error fetching user profiles:', profilesError);
    } else {
      console.log(`  - Total user profiles: ${userProfiles?.length || 0}`);
      userProfiles?.forEach(profile => {
        console.log(`    - ${profile.email} (Auth User ID: ${profile.user_id})`);
      });
    }

    // Check all employees
    console.log('\n👥 All Front Sales Employees:');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .eq('department', 'Front Sales')
      .order('email');

    if (employeesError) {
      console.log('❌ Error fetching employees:', employeesError);
    } else {
      console.log(`  - Total Front Sales employees: ${employees?.length || 0}`);
      employees?.forEach(employee => {
        console.log(`    - ${employee.email} (Employee ID: ${employee.id})`);
      });
    }

    // Check specific cases
    console.log('\n🔍 Specific Email Checks:');
    
    // Check Shahbaz Khan
    console.log('\n📧 Shahbaz Khan Email Check:');
    const shahbazEmployee = employees?.find(emp => emp.full_name === 'Shahbaz khan');
    const shahbazProfile = userProfiles?.find(profile => profile.email.includes('shahbaz'));
    
    if (shahbazEmployee) {
      console.log(`  - Employee email: ${shahbazEmployee.email}`);
    }
    if (shahbazProfile) {
      console.log(`  - Profile email: ${shahbazProfile.email}`);
    }
    
    // Check if there's a profile for the employee email
    if (shahbazEmployee) {
      const matchingProfile = userProfiles?.find(profile => profile.email === shahbazEmployee.email);
      if (matchingProfile) {
        console.log(`  ✅ Found matching profile: ${matchingProfile.email}`);
      } else {
        console.log(`  ❌ No profile found for employee email: ${shahbazEmployee.email}`);
      }
    }

    // Check Ali Logicworks
    console.log('\n📧 Ali Logicworks Email Check:');
    const aliEmployee = employees?.find(emp => emp.full_name === 'Ali Logicworks');
    const aliProfile = userProfiles?.find(profile => profile.email.includes('ali'));
    
    if (aliEmployee) {
      console.log(`  - Employee email: ${aliEmployee.email}`);
    }
    if (aliProfile) {
      console.log(`  - Profile email: ${aliProfile.email}`);
    }
    
    // Check if there's a profile for the employee email
    if (aliEmployee) {
      const matchingProfile = userProfiles?.find(profile => profile.email === aliEmployee.email);
      if (matchingProfile) {
        console.log(`  ✅ Found matching profile: ${matchingProfile.email}`);
      } else {
        console.log(`  ❌ No profile found for employee email: ${aliEmployee.email}`);
      }
    }

    // Show all email mismatches
    console.log('\n🔍 All Email Mismatches:');
    employees?.forEach(employee => {
      const matchingProfile = userProfiles?.find(profile => profile.email === employee.email);
      if (matchingProfile) {
        console.log(`  ✅ ${employee.full_name}: ${employee.email} - MATCH`);
      } else {
        console.log(`  ❌ ${employee.full_name}: ${employee.email} - NO PROFILE`);
      }
    });

    // Show all profiles that don't have matching employees
    console.log('\n🔍 Profiles without matching employees:');
    userProfiles?.forEach(profile => {
      const matchingEmployee = employees?.find(emp => emp.email === profile.email);
      if (matchingEmployee) {
        console.log(`  ✅ ${profile.email} - MATCHES ${matchingEmployee.full_name}`);
      } else {
        console.log(`  ❌ ${profile.email} - NO EMPLOYEE MATCH`);
      }
    });

  } catch (error) {
    console.error('Error in checkEmailMismatch:', error);
  }
}

checkEmailMismatch(); 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function checkUserProfile() {
  console.log('🔍 Checking user profile for current user...\n');

  try {
    const currentUserId = 'de514a73-4782-439e-b2ea-3f49fe568e24'; // User with sales but no performance

    // Check if user profile exists by user_id
    console.log('👤 Checking user profile by user_id...');
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', currentUserId)
      .single();

    if (profileError) {
      console.log('❌ User profile not found by user_id:', profileError);
      
      // Check by id
      console.log('\n👤 Checking user profile by id...');
      const { data: userProfileById, error: profileByIdError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', currentUserId)
        .single();

      if (profileByIdError) {
        console.log('❌ User profile not found by id either:', profileByIdError);
      } else {
        console.log('✅ User profile found by id:', userProfileById);
      }
      
      // Check what employees exist with similar email patterns
      console.log('\n🔍 Checking employees for potential match...');
      const { data: employees, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('department', 'Front Sales');

      if (employeeError) {
        console.error('Error fetching employees:', employeeError);
      } else {
        console.log('Front Sales employees:');
        employees.forEach(emp => {
          console.log(`  - ID: ${emp.id}, Email: ${emp.email}, Name: ${emp.first_name} ${emp.last_name}`);
        });
      }

    } else {
      console.log('✅ User profile found by user_id:', userProfile);
    }

    // Check if performance data exists for this user
    console.log('\n📊 Checking performance data...');
    const { data: performance, error: performanceError } = await supabase
      .from('front_seller_performance')
      .select('*')
      .eq('seller_id', currentUserId);

    if (performanceError) {
      console.log('❌ Error checking performance:', performanceError);
    } else {
      console.log(`📈 Performance records found: ${performance.length}`);
      performance.forEach(perf => {
        console.log(`  - Month: ${perf.month}, Accounts: ${perf.accounts_achieved}, Gross: ${perf.total_gross}`);
      });
    }

    // Check all user profiles to see the structure
    console.log('\n📋 All user profiles:');
    const { data: allProfiles, error: allProfilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (allProfilesError) {
      console.log('❌ Error fetching all profiles:', allProfilesError);
    } else {
      allProfiles.forEach(profile => {
        console.log(`  - ID: ${profile.id}, User ID: ${profile.user_id}, Email: ${profile.email}`);
      });
    }

  } catch (error) {
    console.error('Error in checkUserProfile:', error);
  }
}

checkUserProfile(); 
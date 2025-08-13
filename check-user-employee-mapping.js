import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function checkUserEmployeeMapping() {
  console.log('🔍 Checking user-employee mapping...\n');

  try {
    // 1. Check auth users
    console.log('📋 Auth Users:');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error('Error fetching auth users:', authError);
    } else {
      authUsers.users.forEach(user => {
        console.log(`  - ID: ${user.id}, Email: ${user.email}`);
      });
    }

    console.log('\n');

    // 2. Check employees
    console.log('👥 Employees:');
    const { data: employees, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false });

    if (employeeError) {
      console.error('Error fetching employees:', employeeError);
    } else {
      employees.forEach(emp => {
        console.log(`  - ID: ${emp.id}, Email: ${emp.email}, Department: ${emp.department}`);
      });
    }

    console.log('\n');

    // 3. Check user_profiles
    console.log('👤 User Profiles:');
    const { data: userProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profileError) {
      console.error('Error fetching user profiles:', profileError);
    } else {
      userProfiles.forEach(profile => {
        console.log(`  - ID: ${profile.id}, Email: ${profile.email}, Display Name: ${profile.display_name}`);
      });
    }

    console.log('\n');

    // 4. Check if there are any employees with Front Sales department
    console.log('🎯 Front Sales Employees:');
    const { data: frontSalesEmployees, error: frontSalesError } = await supabase
      .from('employees')
      .select('*')
      .eq('department', 'Front Sales');

    if (frontSalesError) {
      console.error('Error fetching Front Sales employees:', frontSalesError);
    } else {
      if (frontSalesEmployees.length === 0) {
        console.log('  ❌ No Front Sales employees found!');
      } else {
        frontSalesEmployees.forEach(emp => {
          console.log(`  - ID: ${emp.id}, Name: ${emp.first_name} ${emp.last_name}, Email: ${emp.email}`);
        });
      }
    }

    console.log('\n');

    // 5. Check existing targets
    console.log('🎯 Existing Targets:');
    const { data: targets, error: targetError } = await supabase
      .from('front_seller_targets')
      .select('*')
      .order('created_at', { ascending: false });

    if (targetError) {
      console.error('Error fetching targets:', targetError);
    } else {
      if (targets.length === 0) {
        console.log('  ❌ No targets found!');
      } else {
        targets.forEach(target => {
          console.log(`  - Seller ID: ${target.seller_id}, Month: ${target.month}, Accounts: ${target.target_accounts}`);
        });
      }
    }

    console.log('\n');

    // 6. Check existing performance records
    console.log('📊 Existing Performance Records:');
    const { data: performance, error: performanceError } = await supabase
      .from('front_seller_performance')
      .select('*')
      .order('created_at', { ascending: false });

    if (performanceError) {
      console.error('Error fetching performance:', performanceError);
    } else {
      if (performance.length === 0) {
        console.log('  ❌ No performance records found!');
      } else {
        performance.forEach(perf => {
          console.log(`  - Seller ID: ${perf.seller_id}, Month: ${perf.month}, Accounts: ${perf.accounts_achieved}, Gross: ${perf.total_gross}`);
        });
      }
    }

    console.log('\n');

    // 7. Find the mapping for a specific employee
    console.log('🔗 Finding auth user ID for employee shahbazyouknow@gmail.com:');
    const { data: userProfile, error: profileLookupError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'shahbazyouknow@gmail.com')
      .single();

    if (profileLookupError) {
      console.log('❌ Error finding user profile:', profileLookupError);
    } else {
      console.log('✅ Found user profile:', userProfile);
      console.log(`  - Auth User ID: ${userProfile.id}`);
      console.log(`  - Email: ${userProfile.email}`);
    }

  } catch (error) {
    console.error('Error in checkUserEmployeeMapping:', error);
  }
}

checkUserEmployeeMapping(); 
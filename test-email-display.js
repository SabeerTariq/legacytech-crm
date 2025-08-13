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

async function testEmailDisplay() {
  console.log('🧪 Testing Email Display in User Management\n');

  try {
    // 1. Check what emails are stored in user_profiles
    console.log('1. Checking user_profiles table...');
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
    } else {
      console.log('✅ User profiles found:');
      profiles.forEach(profile => {
        console.log(`  - User ID: ${profile.user_id}`);
        console.log(`    Email: ${profile.email}`);
        console.log(`    User Management Email: ${profile.attributes?.user_management_email || 'Not set'}`);
        console.log(`    Personal Email: ${profile.attributes?.personal_email || 'Not set'}`);
        console.log('');
      });
    }

    // 2. Check employees table for comparison
    console.log('2. Checking employees table...');
    const { data: employees, error: employeesError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (employeesError) {
      console.log('❌ Error fetching employees:', employeesError.message);
    } else {
      console.log('✅ Employees found:');
      employees.forEach(emp => {
        console.log(`  - Employee: ${emp.full_name}`);
        console.log(`    Personal Email: ${emp.personal_email || emp.email}`);
        console.log(`    User Management Email: ${emp.user_management_email || 'Not set'}`);
        console.log('');
      });
    }

    // 3. Test the adminService.getUsers() logic
    console.log('3. Testing adminService.getUsers() logic...');
    const { data: userProfiles, error: profilesError2 } = await supabaseAdmin
      .from('user_profiles')
      .select(`
        *,
        employees:employees(*)
      `)
      .order('created_at', { ascending: false });

    if (profilesError2) {
      console.log('❌ Error in getUsers logic:', profilesError2.message);
    } else {
      console.log('✅ Processed users (simulating adminService.getUsers()):');
      const processedUsers = userProfiles?.map(profile => ({
        id: profile.user_id,
        employee_id: profile.employee_id || '',
        email: profile.attributes?.user_management_email || profile.email,
        user_management_email: profile.attributes?.user_management_email || profile.email,
        status: profile.is_active ? 'active' : 'disabled',
        created_at: profile.created_at,
        employee: {
          id: profile.employees?.id || '',
          full_name: profile.employees?.full_name || profile.employees?.name || profile.display_name,
          email: profile.employees?.email || profile.email,
          personal_email: profile.attributes?.personal_email || profile.employees?.personal_email,
          department: profile.employees?.department || 'Unknown',
          job_title: profile.employees?.job_title || profile.employees?.position || 'User',
          date_of_joining: profile.employees?.date_of_joining || ''
        }
      })) || [];

      processedUsers.forEach(user => {
        console.log(`  - User: ${user.employee.full_name}`);
        console.log(`    Display Email: ${user.email}`);
        console.log(`    User Management Email: ${user.user_management_email}`);
        console.log(`    Personal Email: ${user.employee.personal_email}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testEmailDisplay(); 
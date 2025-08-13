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

async function testNewSystem() {
  console.log('🧪 Testing New System Setup\n');

  try {
    // 1. Check current system state
    console.log('📊 1. Current System State:');
    
    // Check auth users
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    if (authError) {
      console.log('❌ Error fetching auth users:', authError.message);
    } else {
      console.log(`   🔐 Auth Users: ${authUsers?.users?.length || 0}`);
      authUsers?.users?.forEach(user => {
        console.log(`      - ${user.email}`);
      });
    }

    // Check user profiles
    const { data: userProfiles, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*');

    if (profileError) {
      console.log('❌ Error fetching user profiles:', profileError.message);
    } else {
      console.log(`   👤 User Profiles: ${userProfiles?.length || 0}`);
      userProfiles?.forEach(profile => {
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
      console.log('❌ Error fetching employees:', empError.message);
    } else {
      console.log(`   👥 Front Sales Employees: ${employees?.length || 0}`);
      employees?.forEach(emp => {
        console.log(`      - ${emp.full_name} (${emp.email})`);
      });
    }

    // 2. Test the new views and functions
    console.log('\n📊 2. Testing New Views and Functions:');
    
    // Test employee_user_linking_status view
    const { data: linkingStatus, error: linkingError } = await supabaseAdmin
      .from('employee_user_linking_status')
      .select('*')
      .eq('department', 'Front Sales')
      .order('employee_name');

    if (linkingError) {
      console.log('❌ Error fetching linking status:', linkingError.message);
    } else {
      console.log(`\n   🔗 Employee Linking Status: ${linkingStatus?.length || 0}`);
      linkingStatus?.forEach(status => {
        const icon = status.linking_status === 'LINKED' ? '✅' : '❌';
        console.log(`      ${icon} ${status.employee_name} - ${status.linking_status}`);
      });
    }

    // Test user_management_users view
    const { data: userManagementUsers, error: umError } = await supabaseAdmin
      .from('user_management_users')
      .select('*');

    if (umError) {
      console.log('❌ Error fetching user management users:', umError.message);
    } else {
      console.log(`\n   👤 User Management Users: ${userManagementUsers?.length || 0}`);
      userManagementUsers?.forEach(user => {
        console.log(`      - ${user.display_name} (${user.email})`);
      });
    }

    // Test all_employees view
    const { data: allEmployees, error: allEmpError } = await supabaseAdmin
      .from('all_employees')
      .select('*')
      .eq('department', 'Front Sales')
      .order('full_name');

    if (allEmpError) {
      console.log('❌ Error fetching all employees:', allEmpError.message);
    } else {
      console.log(`\n   👥 All Employees (Employee Management): ${allEmployees?.length || 0}`);
      allEmployees?.forEach(emp => {
        console.log(`      - ${emp.full_name} (${emp.email})`);
      });
    }

    // Test get_all_employees function
    const { data: functionEmployees, error: funcError } = await supabaseAdmin.rpc(
      'get_all_employees',
      { p_department: 'Front Sales' }
    );

    if (funcError) {
      console.log('❌ Error calling get_all_employees function:', funcError.message);
    } else {
      console.log(`\n   🔧 Function: get_all_employees (Front Sales): ${functionEmployees?.length || 0}`);
      functionEmployees?.forEach(emp => {
        const hasAccount = emp.has_user_account ? '✅' : '❌';
        console.log(`      ${hasAccount} ${emp.full_name} - Has Account: ${emp.has_user_account}`);
      });
    }

    // 3. Demonstrate the separation
    console.log('\n📊 3. System Separation Demonstration:');
    console.log('\n   🏢 Employee Management Module:');
    console.log('      - Shows ALL employees from employees table');
    console.log('      - Includes employees with and without user accounts');
    console.log('      - Used for HR/Admin employee management');
    
    console.log('\n   👤 User Management Module:');
    console.log('      - Shows only employees who need user accounts');
    console.log('      - Used to create user accounts for employees');
    console.log('      - Links employees to auth users');
    
    console.log('\n   📊 Other Modules (Dashboard, Leads, Sales, etc.):');
    console.log('      - Shows only users created through user management');
    console.log('      - Only users with auth accounts and profiles');
    console.log('      - Used for day-to-day CRM operations');

    // 4. Show current status
    console.log('\n📊 4. Current Status Summary:');
    console.log(`   🔐 Auth Users: ${authUsers?.users?.length || 0}`);
    console.log(`   👤 User Profiles: ${userProfiles?.length || 0}`);
    console.log(`   👥 Front Sales Employees: ${employees?.length || 0}`);
    console.log(`   🔗 Employees Needing Accounts: ${linkingStatus?.filter(s => s.linking_status === 'NEEDS_ACCOUNT_CREATION').length || 0}`);
    console.log(`   ✅ Employees With Accounts: ${linkingStatus?.filter(s => s.linking_status === 'LINKED').length || 0}`);

    console.log('\n✅ System setup completed!');
    console.log('\n📝 How to use the new system:');
    console.log('   1. Employee Management: Shows all employees (use all_employees view)');
    console.log('   2. User Management: Create accounts for employees who need them');
    console.log('   3. Other Modules: Only show user management created users');
    console.log('   4. Team Management: Only includes users with accounts');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNewSystem(); 
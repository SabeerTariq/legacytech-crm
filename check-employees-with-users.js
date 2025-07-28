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

async function checkEmployeesWithUsers() {
  try {
    console.log('👥 Employees with User Accounts');
    console.log('===============================\n');

    // Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }

    // Get all employees
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*');
    
    if (employeesError) {
      console.error('❌ Error fetching employees:', employeesError);
      return;
    }

    console.log(`📊 Total Auth Users: ${authUsers.users.length}`);
    console.log(`📊 Total Employees: ${employees.length}\n`);

    // Match users with employees
    const employeesWithUsers = [];
    const usersWithoutEmployees = [];

    authUsers.users.forEach(user => {
      // Try to find matching employee by email
      const matchingEmployee = employees.find(emp => 
        emp.email === user.email || 
        emp.personal_email_address === user.email
      );

      if (matchingEmployee) {
        employeesWithUsers.push({
          user: user,
          employee: matchingEmployee
        });
      } else {
        usersWithoutEmployees.push(user);
      }
    });

    // Show employees with user accounts
    if (employeesWithUsers.length > 0) {
      console.log('✅ Employees with User Accounts:');
      console.log('================================');
      
      employeesWithUsers.forEach((item, index) => {
        const user = item.user;
        const employee = item.employee;
        const createdDate = new Date(user.created_at).toLocaleDateString();
        
        console.log(`\n${index + 1}. ${employee.full_name}`);
        console.log(`   📧 User Email: ${user.email}`);
        console.log(`   📧 Employee Email: ${employee.email}`);
        console.log(`   🏢 Department: ${employee.department}`);
        console.log(`   💼 Job Title: ${employee.job_title || 'N/A'}`);
        console.log(`   📅 User Created: ${createdDate}`);
        console.log(`   🆔 User ID: ${user.id}`);
        console.log(`   🆔 Employee ID: ${employee.id}`);
        
        // Check if email is custom or original
        if (user.email.includes('@logicworks.com')) {
          console.log(`   🎯 Email Type: Custom (${user.email.split('@')[1]})`);
        } else {
          console.log(`   📧 Email Type: Original (${user.email.split('@')[1]})`);
        }
      });
    } else {
      console.log('❌ No employees found with user accounts');
    }

    // Show users without matching employees
    if (usersWithoutEmployees.length > 0) {
      console.log('\n⚠️  Users without Matching Employees:');
      console.log('=====================================');
      
      usersWithoutEmployees.forEach((user, index) => {
        const createdDate = new Date(user.created_at).toLocaleDateString();
        console.log(`${index + 1}. ${user.email} (Created: ${createdDate})`);
      });
    }

    // Show employees without user accounts
    const employeesWithoutUsers = employees.filter(emp => 
      !authUsers.users.some(user => 
        user.email === emp.email || 
        user.email === emp.personal_email_address
      )
    );

    console.log(`\n📊 Summary:`);
    console.log(`============`);
    console.log(`✅ Employees with user accounts: ${employeesWithUsers.length}`);
    console.log(`❌ Employees without user accounts: ${employeesWithoutUsers.length}`);
    console.log(`⚠️  Users without matching employees: ${usersWithoutEmployees.length}`);
    console.log(`📈 User creation rate: ${((employeesWithUsers.length / employees.length) * 100).toFixed(1)}%`);

    // Show sample of employees without users
    if (employeesWithoutUsers.length > 0) {
      console.log(`\n📋 Sample Employees without User Accounts (First 10):`);
      console.log(`====================================================`);
      
      employeesWithoutUsers.slice(0, 10).forEach((emp, index) => {
        console.log(`${index + 1}. ${emp.full_name} - ${emp.department} (${emp.email})`);
      });

      if (employeesWithoutUsers.length > 10) {
        console.log(`... and ${employeesWithoutUsers.length - 10} more employees`);
      }
    }

    // Show custom email preview for employees without users
    if (employeesWithoutUsers.length > 0) {
      console.log(`\n🎯 Custom Email Preview for Employees without Users:`);
      console.log(`==================================================`);
      
      function generateCustomEmail(fullName, department) {
        const cleanName = fullName
          .toLowerCase()
          .replace(/[^a-z\s]/g, '')
          .trim()
          .replace(/\s+/g, '.');
        
        const deptPrefix = department.toLowerCase().substring(0, 3);
        return `${cleanName}.${deptPrefix}@logicworks.com`;
      }

      employeesWithoutUsers.slice(0, 5).forEach((emp, index) => {
        const customEmail = generateCustomEmail(emp.full_name, emp.department);
        console.log(`${index + 1}. ${emp.full_name} → ${customEmail}`);
      });

      if (employeesWithoutUsers.length > 5) {
        console.log(`... and ${employeesWithoutUsers.length - 5} more would get custom emails`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking employees with users:', error);
  }
}

// Run the check
checkEmployeesWithUsers().then(() => {
  console.log('\n✅ Employee user check completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
}); 
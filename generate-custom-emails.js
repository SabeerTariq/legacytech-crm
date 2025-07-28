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

// Function to generate custom email from employee name
function generateCustomEmail(fullName, department) {
  // Clean the name: remove special characters and convert to lowercase
  const cleanName = fullName
    .toLowerCase()
    .replace(/[^a-z\s]/g, '') // Remove special characters except spaces
    .trim()
    .replace(/\s+/g, '.'); // Replace spaces with dots
  
  // Get department prefix (first 3 letters)
  const deptPrefix = department.toLowerCase().substring(0, 3);
  
  // Generate email with department prefix
  const customEmail = `${cleanName}.${deptPrefix}@logicworks.com`;
  
  return customEmail;
}

// Function to check if custom email already exists
async function checkCustomEmailExists(customEmail) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error checking existing users:', error);
    return false;
  }
  return data.users.some(user => user.email === customEmail);
}

// Function to generate unique custom email
async function generateUniqueCustomEmail(fullName, department) {
  let baseEmail = generateCustomEmail(fullName, department);
  let customEmail = baseEmail;
  let counter = 1;
  
  // Keep trying until we find a unique email
  while (await checkCustomEmailExists(customEmail)) {
    const nameParts = baseEmail.split('@')[0];
    customEmail = `${nameParts}${counter}@logicworks.com`;
    counter++;
    
    // Prevent infinite loop
    if (counter > 100) {
      throw new Error('Unable to generate unique email after 100 attempts');
    }
  }
  
  return customEmail;
}

async function generateEmailPreview() {
  try {
    console.log('📧 Custom Email Generation Preview');
    console.log('==================================\n');
    
    // Fetch all employees
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('id, full_name, email, department, job_title')
      .order('full_name');
    
    if (employeesError) {
      console.error('Error fetching employees:', employeesError);
      return;
    }
    
    if (employees.length === 0) {
      console.log('No employees found in the database.');
      return;
    }
    
    console.log(`Found ${employees.length} employees\n`);
    
      // Generate preview for each employee
  for (const employee of employees) {
    // Skip employees with null or undefined names/departments
    if (!employee.full_name || !employee.department) {
      console.log(`⚠️  Skipping employee with missing data: ${JSON.stringify(employee)}`);
      continue;
    }
    
    const baseEmail = generateCustomEmail(employee.full_name, employee.department);
    const uniqueEmail = await generateUniqueCustomEmail(employee.full_name, employee.department);
      
      console.log(`👤 ${employee.full_name}`);
      console.log(`   Department: ${employee.department}`);
      console.log(`   Job Title: ${employee.job_title || 'N/A'}`);
      console.log(`   Original Email: ${employee.email}`);
      console.log(`   Base Custom Email: ${baseEmail}`);
      console.log(`   Unique Custom Email: ${uniqueEmail}`);
      
      // Show if email is unique or needs counter
      if (baseEmail === uniqueEmail) {
        console.log(`   ✅ Email is unique`);
      } else {
        console.log(`   ⚠️  Email needed counter (${uniqueEmail.split('@')[0].replace(baseEmail.split('@')[0], '')})`);
      }
      console.log('');
    }
    
    // Show email format examples
    console.log('📋 Email Format Examples:');
    console.log('==========================');
    console.log('Format: firstname.lastname.dept@logicworks.com');
    console.log('');
    console.log('Examples:');
    console.log('- john.doe.hr@logicworks.com (HR department)');
    console.log('- jane.smith.mar@logicworks.com (Marketing department)');
    console.log('- mike.johnson.dev@logicworks.com (Development department)');
    console.log('- sarah.wilson.sal@logicworks.com (Sales department)');
    console.log('');
    console.log('If duplicate names exist, a number is appended:');
    console.log('- john.doe.hr1@logicworks.com');
    console.log('- john.doe.hr2@logicworks.com');
    
  } catch (error) {
    console.error('Error generating email preview:', error);
  }
}

async function testEmailGeneration() {
  console.log('\n🧪 Testing Email Generation');
  console.log('============================\n');
  
  const testCases = [
    { name: 'John Doe', department: 'HR' },
    { name: 'Jane Smith', department: 'Marketing' },
    { name: 'Mike Johnson', department: 'Development' },
    { name: 'Sarah Wilson', department: 'Sales' },
    { name: 'Robert O\'Connor', department: 'Finance' },
    { name: 'Maria García-López', department: 'Operations' },
    { name: 'David Chen', department: 'IT' },
    { name: 'Lisa Thompson-Jones', department: 'Customer Service' }
  ];
  
  for (const testCase of testCases) {
    const customEmail = generateCustomEmail(testCase.name, testCase.department);
    console.log(`Name: ${testCase.name}`);
    console.log(`Department: ${testCase.department}`);
    console.log(`Generated Email: ${customEmail}`);
    console.log('');
  }
}

async function main() {
  await generateEmailPreview();
  await testEmailGeneration();
}

main().catch(console.error); 
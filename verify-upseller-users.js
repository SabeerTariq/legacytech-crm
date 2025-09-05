import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || undefined,
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

async function verifyUpsellerUsers() {
  let connection;
  
  try {
    console.log('🔍 Verifying Upseller users in the database...');
    
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL database');
    
    // Get all employees with Upseller department
    console.log('\n📋 All employees with Upseller department:');
    const [upsellerEmployees] = await connection.execute(`
      SELECT 
        e.id,
        e.full_name,
        e.email,
        e.department,
        e.job_title
      FROM employees e
      WHERE e.department = 'Upseller'
      ORDER BY e.full_name
    `);
    
    console.log(`📊 Found ${upsellerEmployees.length} Upseller employees:`);
    upsellerEmployees.forEach((emp, index) => {
      console.log(`${index + 1}. ${emp.full_name} (${emp.email}) - ${emp.job_title || 'No title'}`);
    });
    
    // Check if there are any employees in other departments that might be incorrectly included
    console.log('\n📋 Checking other departments to ensure no cross-contamination:');
    const [otherDepartments] = await connection.execute(`
      SELECT 
        department,
        COUNT(*) as count
      FROM employees 
      WHERE department != 'Upseller'
      GROUP BY department
      ORDER BY department
    `);
    
    console.log('📊 Employees in other departments:');
    otherDepartments.forEach(dept => {
      console.log(`  - ${dept.department}: ${dept.count} employees`);
    });
    
    // Verify the exact query used in the API
    console.log('\n📋 Testing the exact API query:');
    const [apiResult] = await connection.execute(`
      SELECT 
        e.id,
        e.full_name,
        e.email,
        e.department,
        e.job_title
      FROM employees e
      WHERE e.department = 'Upseller'
      ORDER BY e.full_name
    `);
    
    console.log(`📊 API query returns ${apiResult.length} project managers:`);
    apiResult.forEach((pm, index) => {
      console.log(`${index + 1}. ${pm.full_name} - Department: ${pm.department}`);
    });
    
    // Check if all returned users are actually Upseller
    const nonUpsellerUsers = apiResult.filter(pm => pm.department !== 'Upseller');
    if (nonUpsellerUsers.length > 0) {
      console.log('\n⚠️  WARNING: Found non-Upseller users in the results:');
      nonUpsellerUsers.forEach(user => {
        console.log(`  - ${user.full_name} (Department: ${user.department})`);
      });
    } else {
      console.log('\n✅ All returned users are correctly from the Upseller department');
    }
    
  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the verification
verifyUpsellerUsers();

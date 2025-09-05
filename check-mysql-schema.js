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

async function checkMySQLSchema() {
  let connection;
  
  try {
    console.log('🔍 Checking MySQL database schema...');
    
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL database');
    
    // Check auth_users table structure
    console.log('\n📋 Checking auth_users table structure:');
    const [authUsersColumns] = await connection.execute('DESCRIBE auth_users');
    console.log('auth_users columns:');
    authUsersColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check user_profiles table structure
    console.log('\n📋 Checking user_profiles table structure:');
    const [userProfilesColumns] = await connection.execute('DESCRIBE user_profiles');
    console.log('user_profiles columns:');
    userProfilesColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check employees table structure
    console.log('\n📋 Checking employees table structure:');
    const [employeesColumns] = await connection.execute('DESCRIBE employees');
    console.log('employees columns:');
    employeesColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check sample data from auth_users
    console.log('\n📋 Sample auth_users data:');
    const [authUsersData] = await connection.execute('SELECT * FROM auth_users LIMIT 3');
    if (authUsersData.length > 0) {
      authUsersData.forEach((user, index) => {
        console.log(`User ${index + 1}:`);
        Object.keys(user).forEach(key => {
          console.log(`  ${key}: ${user[key]}`);
        });
        console.log('---');
      });
    } else {
      console.log('No users found in auth_users table');
    }
    
    // Check sample data from user_profiles
    console.log('\n📋 Sample user_profiles data:');
    const [userProfilesData] = await connection.execute('SELECT * FROM user_profiles LIMIT 3');
    if (userProfilesData.length > 0) {
      userProfilesData.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`);
        Object.keys(profile).forEach(key => {
          console.log(`  ${key}: ${profile[key]}`);
        });
        console.log('---');
      });
    } else {
      console.log('No profiles found in user_profiles table');
    }
    
    // Check sample data from employees
    console.log('\n📋 Sample employees data:');
    const [employeesData] = await connection.execute('SELECT * FROM employees LIMIT 3');
    if (employeesData.length > 0) {
      employeesData.forEach((emp, index) => {
        console.log(`Employee ${index + 1}:`);
        Object.keys(emp).forEach(key => {
          console.log(`  ${key}: ${emp[key]}`);
        });
        console.log('---');
      });
    } else {
      console.log('No employees found in employees table');
    }
    
  } catch (error) {
    console.error('❌ Schema check failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the check
checkMySQLSchema();

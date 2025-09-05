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

async function checkUserProfilesSchema() {
  let connection;
  
  try {
    console.log('🔍 Checking user_profiles table structure...');
    
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL database');
    
    // Check user_profiles table structure
    console.log('\n📋 user_profiles table structure:');
    const [columns] = await connection.execute('DESCRIBE user_profiles');
    columns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check sample data
    console.log('\n📋 Sample user_profiles data:');
    const [data] = await connection.execute('SELECT * FROM user_profiles LIMIT 3');
    if (data.length > 0) {
      data.forEach((row, index) => {
        console.log(`Row ${index + 1}:`);
        Object.keys(row).forEach(key => {
          console.log(`  ${key}: ${row[key]}`);
        });
        console.log('---');
      });
    } else {
      console.log('No data found in user_profiles table');
    }
    
    // Check auth_users table structure
    console.log('\n📋 auth_users table structure:');
    const [authColumns] = await connection.execute('DESCRIBE auth_users');
    authColumns.forEach(col => {
      console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'}`);
    });
    
    // Check sample auth_users data
    console.log('\n📋 Sample auth_users data:');
    const [authData] = await connection.execute('SELECT * FROM auth_users LIMIT 3');
    if (authData.length > 0) {
      authData.forEach((row, index) => {
        console.log(`Row ${index + 1}:`);
        Object.keys(row).forEach(key => {
          console.log(`  ${key}: ${row[key]}`);
        });
        console.log('---');
      });
    } else {
      console.log('No data found in auth_users table');
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
checkUserProfilesSchema(); 
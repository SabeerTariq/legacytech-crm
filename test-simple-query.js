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

async function testSimpleQuery() {
  let connection;
  
  try {
    console.log('🔍 Testing the exact query that\'s failing...');
    
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL database');
    
    // Test the exact query from the API
    const user_id = '722d6008-7cec-43d3-8648-926a14f765c9'; // admin user ID
    
    console.log('\n📋 Testing user profile query:');
    const query = `
      SELECT 
        up.id,
        up.user_id,
        up.email,
        up.display_name,
        up.employee_id,
        up.is_admin,
        up.attributes,
        e.full_name,
        e.department,
        e.job_title
      FROM user_profiles up
      LEFT JOIN employees e ON up.employee_id = e.id
      WHERE up.user_id = ?
    `;
    
    console.log('Query:', query);
    console.log('Parameters:', [user_id]);
    
    const [userProfiles] = await connection.execute(query, [user_id]);
    
    console.log('✅ Query executed successfully');
    console.log(`📊 Found ${userProfiles.length} user profiles`);
    
    if (userProfiles.length > 0) {
      const userProfile = userProfiles[0];
      console.log('\n📋 User profile data:');
      console.log('ID:', userProfile.id);
      console.log('User ID:', userProfile.user_id);
      console.log('Email:', userProfile.email);
      console.log('Display Name:', userProfile.display_name);
      console.log('Employee ID:', userProfile.employee_id);
      console.log('Is Admin:', userProfile.is_admin);
      console.log('Department:', userProfile.department);
      console.log('Attributes:', userProfile.attributes ? 'Present' : 'Not present');
    }
    
  } catch (error) {
    console.error('❌ Query failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testSimpleQuery();

import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

// Load environment variables
dotenv.config();

console.log('=== ENVIRONMENT CHECK ===');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
console.log('MYSQL_HOST:', process.env.MYSQL_HOST);
console.log('MYSQL_USER:', process.env.MYSQL_USER);
console.log('MYSQL_DATABASE:', process.env.MYSQL_DATABASE);
console.log('MYSQL_PORT:', process.env.MYSQL_PORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Test database connection
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'Developer@1234',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

console.log('\n=== DATABASE CONNECTION TEST ===');
try {
  const connection = await mysql.createConnection(mysqlConfig);
  console.log('✅ Database connection successful');
  
  // Test query
  const [result] = await connection.execute('SELECT COUNT(*) as count FROM auth_users');
  console.log('✅ Database query successful, user count:', result[0].count);
  
  await connection.end();
  console.log('✅ Database connection closed');
} catch (error) {
  console.error('❌ Database connection failed:');
  console.error('Error type:', error.constructor.name);
  console.error('Error message:', error.message);
  console.error('Error code:', error.code);
}

console.log('\n=== JWT TEST ===');
import { generateToken, verifyToken } from './src/lib/auth/jwt-utils.js';

try {
  const testUser = {
    id: 'test-id',
    email: 'test@example.com',
    display_name: 'Test User',
    is_admin: false
  };
  
  const token = generateToken(testUser);
  console.log('✅ JWT generation successful');
  
  const decoded = verifyToken(token);
  console.log('✅ JWT verification successful:', decoded);
} catch (error) {
  console.error('❌ JWT test failed:');
  console.error('Error message:', error.message);
}

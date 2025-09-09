import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'Developer@1234',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10, // Maximum 10 connections in pool
  queueLimit: 0, // No limit on queued requests
  acquireTimeout: 60000, // 60 seconds timeout for getting connection
  multipleStatements: false
});

// Test the connection pool
pool.getConnection()
  .then(connection => {
    console.log('✅ Database connection pool established');
    connection.release();
  })
  .catch(error => {
    console.error('❌ Database connection pool failed:', error);
  });

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Closing database connection pool...');
  await pool.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Closing database connection pool...');
  await pool.end();
  process.exit(0);
});

export default pool;

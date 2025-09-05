#!/usr/bin/env node

import mysql from 'mysql2/promise';

const mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: undefined,
  database: 'logicworks_crm',
  charset: 'utf8mb4'
};

async function testMigration() {
  try {
    console.log('🔌 Connecting to MySQL...');
    const connection = await mysql.createConnection(mysqlConfig);
    
    // Test with a simple INSERT
    console.log('🧪 Testing simple INSERT...');
    
    const testData = {
      id: 'test-123',
      department: 'IT',
      email: 'test@example.com',
      performance: '{"score": 85}',
      created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      updated_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      full_name: 'Test User'
    };
    
    const columns = Object.keys(testData);
    const values = Object.values(testData);
    
    console.log('Columns:', columns);
    console.log('Values:', values);
    console.log('Values types:', values.map(v => typeof v));
    
    const columnNames = columns.map(col => `\`${col}\``).join(', ');
    const placeholders = columns.map(() => '?').join(', ');
    const insertSQL = `INSERT INTO \`employees\` (${columnNames}) VALUES (${placeholders})`;
    
    console.log('SQL:', insertSQL);
    
    await connection.execute(insertSQL, values);
    console.log('✅ Test INSERT successful!');
    
    // Clean up test data
    await connection.execute('DELETE FROM employees WHERE id = ?', ['test-123']);
    console.log('🧹 Test data cleaned up');
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Error details:', error);
  }
}

testMigration();

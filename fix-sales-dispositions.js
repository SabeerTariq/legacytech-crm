#!/usr/bin/env node

import mysql from 'mysql2/promise';

const mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: undefined,
  database: 'logicworks_crm',
  charset: 'utf8mb4'
};

async function fixSalesDispositions() {
  try {
    console.log('🔌 Connecting to MySQL...');
    const connection = await mysql.createConnection(mysqlConfig);
    
    console.log('🔨 Recreating sales_dispositions table...');
    
    const createTableSQL = `
      CREATE TABLE \`sales_dispositions\` (
        \`id\` varchar(36) NOT NULL,
        \`customer_name\` text,
        \`phone_number\` text,
        \`sale_date\` date,
        \`amount\` decimal(10,2),
        \`user_id\` varchar(36),
        \`company\` varchar(100),
        \`sales_source\` varchar(100),
        \`seller\` text,
        \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await connection.execute(createTableSQL);
    console.log('✅ sales_dispositions table recreated successfully!');
    
    // Verify the table structure
    const [columns] = await connection.execute('DESCRIBE sales_dispositions');
    console.log('\n📊 Table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Failed to fix sales_dispositions:', error.message);
    process.exit(1);
  }
}

fixSalesDispositions();

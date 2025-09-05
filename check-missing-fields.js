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

async function checkMissingFields() {
  let connection;
  
  try {
    console.log('🔍 Checking for missing fields...');
    
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL database');
    
    // Check if sales_disposition_id exists
    console.log('\n📋 Checking for sales_disposition_id field...');
    try {
      const [result] = await connection.execute('SELECT sales_disposition_id FROM projects LIMIT 1');
      console.log('✅ sales_disposition_id field exists');
    } catch (error) {
      console.log('❌ sales_disposition_id field does not exist');
    }
    
    // Check if client field exists
    console.log('\n📋 Checking for client field...');
    try {
      const [result] = await connection.execute('SELECT client FROM projects LIMIT 1');
      console.log('✅ client field exists');
    } catch (error) {
      console.log('❌ client field does not exist');
    }
    
    // Get the actual column names from projects table
    console.log('\n📋 Getting actual column names...');
    const [columns] = await connection.execute(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'projects'
      ORDER BY ORDINAL_POSITION
    `, [process.env.MYSQL_DATABASE || 'logicworks_crm']);
    
    console.log('Actual columns in projects table:');
    columns.forEach(col => console.log(`   ${col.COLUMN_NAME}`));
    
    // Check if we can query the actual data structure
    console.log('\n📋 Checking actual data structure...');
    const [projects] = await connection.execute('SELECT * FROM projects LIMIT 1');
    if (projects.length > 0) {
      const project = projects[0];
      console.log('Sample project fields:');
      Object.keys(project).forEach(key => {
        console.log(`   ${key}: ${typeof project[key]} (${project[key]})`);
      });
    }
    
    console.log('\n🎉 Field check completed!');
    
  } catch (error) {
    console.error('❌ Field check failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the check
checkMissingFields();

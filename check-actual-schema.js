import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'Developer@1234',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

async function checkActualSchema() {
  let connection;
  
  try {
    console.log('🔍 Checking actual database schema...');
    
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL database');
    
    // Check projects table structure
    console.log('\n📋 Projects table structure:');
    const [projectsColumns] = await connection.execute('DESCRIBE projects');
    projectsColumns.forEach(col => {
      console.log(`   ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Check employees table structure
    console.log('\n📋 Employees table structure:');
    const [employeesColumns] = await connection.execute('DESCRIBE employees');
    employeesColumns.forEach(col => {
      console.log(`   ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Check sales_dispositions table structure
    console.log('\n📋 Sales_dispositions table structure:');
    const [salesColumns] = await connection.execute('DESCRIBE sales_dispositions');
    salesColumns.forEach(col => {
      console.log(`   ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Check customers table structure
    console.log('\n📋 Customers table structure:');
    const [customersColumns] = await connection.execute('DESCRIBE customers');
    customersColumns.forEach(col => {
      console.log(`   ${col.Field} (${col.Type}) ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Get sample data from projects table
    console.log('\n📋 Sample projects data:');
    const [projects] = await connection.execute('SELECT * FROM projects LIMIT 3');
    projects.forEach((project, index) => {
      console.log(`\n   Project ${index + 1}:`);
      Object.entries(project).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`);
      });
    });
    
    // Get sample data from sales_dispositions table
    console.log('\n📋 Sample sales_dispositions data:');
    const [sales] = await connection.execute('SELECT * FROM sales_dispositions LIMIT 3');
    sales.forEach((sale, index) => {
      console.log(`\n   Sale ${index + 1}:`);
      Object.entries(sale).forEach(([key, value]) => {
        console.log(`     ${key}: ${value}`);
      });
    });
    
    console.log('\n🎉 Schema check completed!');
    
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
checkActualSchema();

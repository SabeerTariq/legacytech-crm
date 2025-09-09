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

async function testDatabaseQuery() {
  let connection;
  
  try {
    console.log('🧪 Testing database query for all-comprehensive endpoint...');
    
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL database');
    
    // Test the exact query from the all-comprehensive endpoint
    const query = `
      SELECT 
        p.id,
        p.name,
        p.client,
        p.description,
        p.due_date,
        p.status,
        p.assigned_pm_id,
        p.services,
        p.created_at,
        p.total_amount,
        p.amount_paid,
        p.budget,
        p.sales_disposition_id,
        -- Employee/PM data
        e.full_name as assigned_pm_name,
        e.department as pm_department,
        e.job_title as pm_job_title,
        -- Sales data
        sd.customer_name as sales_customer_name,
        sd.gross_value as sales_gross_value,
        sd.cash_in as sales_cash_in,
        sd.remaining as sales_remaining,
        sd.tax_deduction as sales_tax_deduction,
        sd.seller as sales_seller,
        sd.sale_date as sales_date,
        sd.payment_mode as sales_payment_mode,
        sd.company as sales_company,
        sd.sales_source as sales_source
      FROM projects p
      LEFT JOIN employees e ON p.assigned_pm_id = e.id
      LEFT JOIN sales_dispositions sd ON p.sales_disposition_id = sd.id
      ORDER BY p.created_at DESC
    `;
    
    console.log('📋 Executing query...');
    const [projects] = await connection.execute(query);
    
    console.log(`✅ Query executed successfully`);
    console.log(`📊 Found ${projects.length} projects`);
    
    if (projects.length > 0) {
      console.log('\n📋 Sample project data:');
      const sampleProject = projects[0];
      
      console.log(`   Project: ${sampleProject.name}`);
      console.log(`   Client: ${sampleProject.client}`);
      console.log(`   Status: ${sampleProject.status}`);
      console.log(`   PM: ${sampleProject.assigned_pm_name || 'Unassigned'}`);
      console.log(`   Department: ${sampleProject.pm_department || 'N/A'}`);
      console.log(`   Total Amount: $${sampleProject.total_amount || 0}`);
      console.log(`   Amount Paid: $${sampleProject.amount_paid || 0}`);
      console.log(`   Services: ${sampleProject.services || 'None'}`);
      
      // Check if all required fields are present
      const requiredFields = [
        'id', 'name', 'client', 'description', 'due_date', 'status',
        'assigned_pm_name', 'pm_department', 'pm_job_title',
        'total_amount', 'amount_paid', 'budget'
      ];
      
      const missingFields = requiredFields.filter(field => !(field in sampleProject));
      
      if (missingFields.length > 0) {
        console.log(`\n⚠️  Missing fields: ${missingFields.join(', ')}`);
      } else {
        console.log('\n✅ All required fields are present');
      }
    }
    
    console.log('\n🎉 Database query test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database query test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testDatabaseQuery();

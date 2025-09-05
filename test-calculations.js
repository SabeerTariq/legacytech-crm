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

async function testCalculations() {
  let connection;
  
  try {
    console.log('🧪 Testing Total Value and Cash Received calculations...');
    
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
      LIMIT 5
    `;
    
    console.log('📋 Executing query...');
    const [projects] = await connection.execute(query);
    
    console.log(`✅ Query executed successfully`);
    console.log(`📊 Found ${projects.length} projects`);
    
    if (projects.length > 0) {
      console.log('\n📋 Testing calculations for each project:');
      
      projects.forEach((project, index) => {
        console.log(`\n   Project ${index + 1}: ${project.name}`);
        console.log(`     Client: ${project.client}`);
        console.log(`     Status: ${project.status}`);
        
        // Raw values from database
        console.log(`     Raw total_amount: ${project.total_amount} (type: ${typeof project.total_amount})`);
        console.log(`     Raw amount_paid: ${project.amount_paid} (type: ${typeof project.amount_paid})`);
        console.log(`     Raw budget: ${project.budget} (type: ${typeof project.budget})`);
        console.log(`     Raw sales_gross_value: ${project.sales_gross_value} (type: ${typeof project.sales_gross_value})`);
        console.log(`     Raw sales_cash_in: ${project.sales_cash_in} (type: ${typeof project.sales_cash_in})`);
        
        // Test the calculation logic
        const total_amount = parseFloat(project.total_amount) || 0;
        const amount_paid = parseFloat(project.amount_paid) || 0;
        const sales_gross_value = parseFloat(project.sales_gross_value) || 0;
        const sales_cash_in = parseFloat(project.sales_cash_in) || 0;
        
        const display_total_amount = (project.total_amount !== null && project.total_amount !== undefined) ? total_amount : sales_gross_value;
        const display_amount_paid = (project.amount_paid !== null && project.amount_paid !== undefined) ? amount_paid : sales_cash_in;
        
        console.log(`     Calculated display_total_amount: $${display_total_amount}`);
        console.log(`     Calculated display_amount_paid: $${display_amount_paid}`);
        console.log(`     Difference (Total - Paid): $${display_total_amount - display_amount_paid}`);
      });
      
      // Test the summary calculations
      console.log('\n📊 Summary Calculations:');
      const totalValue = projects.reduce((sum, p) => {
        const total = (p.total_amount !== null && p.total_amount !== undefined) ? parseFloat(p.total_amount) || 0 : (parseFloat(p.sales_gross_value) || 0);
        return sum + total;
      }, 0);
      
      const totalCashReceived = projects.reduce((sum, p) => {
        const paid = (p.amount_paid !== null && p.amount_paid !== undefined) ? parseFloat(p.amount_paid) || 0 : (parseFloat(p.sales_cash_in) || 0);
        return sum + paid;
      }, 0);
      
      console.log(`   Total Value: $${totalValue.toLocaleString()}`);
      console.log(`   Cash Received: $${totalCashReceived.toLocaleString()}`);
      console.log(`   Outstanding: $${(totalValue - totalCashReceived).toLocaleString()}`);
    }
    
    console.log('\n🎉 Calculation test completed successfully!');
    
  } catch (error) {
    console.error('❌ Calculation test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the test
testCalculations();

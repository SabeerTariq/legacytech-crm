import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || undefined,
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

async function insertSampleData() {
  let connection;
  
  try {
    console.log('🚀 Starting sample data insertion...');
    
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL database');
    
    // Check if we have employees
    const [employees] = await connection.execute('SELECT id, full_name, department FROM employees LIMIT 5');
    console.log(`📋 Found ${employees.length} employees`);
    
    if (employees.length === 0) {
      console.log('⚠️  No employees found. Creating sample employees first...');
      
      const sampleEmployees = [
        { id: uuidv4(), name: 'John Smith', email: 'john.smith@logicworks.com', department: 'Development', job_title: 'Senior Developer' },
        { id: uuidv4(), name: 'Sarah Johnson', email: 'sarah.johnson@logicworks.com', department: 'Front Sales', job_title: 'Sales Manager' },
        { id: uuidv4(), name: 'Mike Davis', email: 'mike.davis@logicworks.com', department: 'Upseller', job_title: 'Upseller Manager' },
        { id: uuidv4(), name: 'Lisa Wilson', email: 'lisa.wilson@logicworks.com', department: 'HR', job_title: 'HR Manager' }
      ];
      
      for (const emp of sampleEmployees) {
        await connection.execute(`
          INSERT INTO employees (id, full_name, email, department, job_title, created_at) 
          VALUES (?, ?, ?, ?, ?, NOW())
        `, [emp.id, emp.name, emp.email, emp.department, emp.job_title]);
        console.log(`✅ Created employee: ${emp.name} (${emp.department})`);
      }
      
      // Refresh employees list
      const [newEmployees] = await connection.execute('SELECT id, full_name, department FROM employees LIMIT 5');
      employees.push(...newEmployees);
    }
    
    // Check if we have customers
    const [customers] = await connection.execute('SELECT id, full_name, business_name FROM customers LIMIT 5');
    console.log(`📋 Found ${customers.length} customers`);
    
    if (customers.length === 0) {
      console.log('⚠️  No customers found. Creating sample customers...');
      
      const sampleCustomers = [
        { id: uuidv4(), name: 'Acme Corp', email: 'contact@acme.com', company: 'Acme Corporation' },
        { id: uuidv4(), name: 'TechStart Inc', email: 'hello@techstart.com', company: 'TechStart Inc' },
        { id: uuidv4(), name: 'Global Solutions', email: 'info@globalsolutions.com', company: 'Global Solutions Ltd' }
      ];
      
      for (const cust of sampleCustomers) {
        await connection.execute(`
          INSERT INTO customers (id, name, full_name, business_name, email, company, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, NOW())
        `, [cust.id, cust.name, cust.name, cust.company, cust.email, cust.company]);
        console.log(`✅ Created customer: ${cust.name}`);
      }
      
      // Refresh customers list
      const [newCustomers] = await connection.execute('SELECT id, full_name, business_name FROM customers LIMIT 5');
      customers.push(...newCustomers);
    }
    
    // Check if we have sales dispositions
    const [salesDispositions] = await connection.execute('SELECT id, customer_name, gross_value, cash_in FROM sales_dispositions LIMIT 5');
    console.log(`📋 Found ${salesDispositions.length} sales dispositions`);
    
    if (salesDispositions.length === 0) {
      console.log('⚠️  No sales dispositions found. Creating sample sales...');
      
      const sampleSales = [
        { id: uuidv4(), customer: 'Acme Corp', gross: 15000.00, cashIn: 5000.00, seller: 'Sarah Johnson' },
        { id: uuidv4(), customer: 'TechStart Inc', gross: 25000.00, cashIn: 10000.00, seller: 'Mike Davis' },
        { id: uuidv4(), customer: 'Global Solutions', gross: 35000.00, cashIn: 15000.00, seller: 'Sarah Johnson' }
      ];
      
      for (const sale of sampleSales) {
        await connection.execute(`
          INSERT INTO sales_dispositions (id, customer_name, gross_value, cash_in, remaining, seller, sale_date, payment_mode, company, sales_source, created_at) 
          VALUES (?, ?, ?, ?, ?, ?, CURDATE(), 'Monthly', 'LogicWorks', 'Direct', NOW())
        `, [sale.id, sale.customer, sale.gross, sale.cashIn, sale.gross - sale.cashIn, sale.seller]);
        console.log(`✅ Created sale: ${sale.customer} - $${sale.gross}`);
      }
      
      // Refresh sales list
      const [newSales] = await connection.execute('SELECT id, customer_name, gross_value, cash_in FROM sales_dispositions LIMIT 5');
      salesDispositions.push(...newSales);
    }
    
    // Now create sample projects
    console.log('\n🏗️  Creating sample projects...');
    
    const sampleProjects = [
      {
        name: 'E-commerce Website Redesign',
        description: 'Complete redesign of the main e-commerce platform with modern UI/UX',
        client: 'Acme Corp',
        status: 'in_progress',
        due_date: '2024-12-31',
        total_amount: 15000.00,
        amount_paid: 5000.00,
        services: ['Web Design', 'UI/UX', 'Frontend Development'],
        assigned_pm_id: employees.find(e => e.department === 'Development')?.id,
        sales_disposition_id: salesDispositions[0]?.id
      },
      {
        name: 'Mobile App Development',
        description: 'iOS and Android mobile application for business management',
        client: 'TechStart Inc',
        status: 'assigned',
        due_date: '2025-02-28',
        total_amount: 25000.00,
        amount_paid: 10000.00,
        services: ['Mobile Development', 'Backend API', 'Database Design'],
        assigned_pm_id: employees.find(e => e.department === 'Development')?.id,
        sales_disposition_id: salesDispositions[1]?.id
      },
      {
        name: 'Digital Marketing Campaign',
        description: 'Comprehensive digital marketing strategy and implementation',
        client: 'Global Solutions',
        status: 'completed',
        due_date: '2024-11-15',
        total_amount: 35000.00,
        amount_paid: 35000.00,
        services: ['SEO', 'Social Media', 'Content Marketing'],
        assigned_pm_id: employees.find(e => e.department === 'Front Sales')?.id,
        sales_disposition_id: salesDispositions[2]?.id
      },
      {
        name: 'Business Process Automation',
        description: 'Automate manual business processes using RPA and AI',
        client: 'Acme Corp',
        status: 'pending',
        due_date: '2025-03-31',
        total_amount: 20000.00,
        amount_paid: 0.00,
        services: ['Process Analysis', 'RPA Development', 'AI Integration'],
        assigned_pm_id: employees.find(e => e.department === 'Development')?.id,
        sales_disposition_id: null
      }
    ];
    
    for (const project of sampleProjects) {
      const projectId = uuidv4();
      const customerId = customers.find(c => c.full_name === project.client || c.business_name === project.client)?.id;
      
      await connection.execute(`
        INSERT INTO projects (
          id, name, description, client, customer_id, status, due_date, 
          total_amount, amount_paid, services, assigned_pm_id, sales_disposition_id, 
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, [
        projectId,
        project.name,
        project.description,
        project.client,
        customerId,
        project.status,
        project.due_date,
        project.total_amount,
        project.amount_paid,
        JSON.stringify(project.services),
        project.assigned_pm_id,
        project.sales_disposition_id
      ]);
      
      console.log(`✅ Created project: ${project.name} (${project.status}) - $${project.total_amount}`);
    }
    
    // Verify the data
    console.log('\n🔍 Verifying sample data...');
    
    const [projectCount] = await connection.execute('SELECT COUNT(*) as count FROM projects');
    console.log(`📊 Total projects: ${projectCount[0].count}`);
    
    const [sampleProjectsData] = await connection.execute(`
      SELECT p.name, p.status, p.client, p.total_amount, p.amount_paid, e.full_name as pm_name
      FROM projects p
      LEFT JOIN employees e ON p.assigned_pm_id = e.id
      LIMIT 5
    `);
    
    console.log('\n📋 Sample projects:');
    sampleProjectsData.forEach(project => {
      console.log(`  - ${project.name}: ${project.status} | Client: ${project.client} | Amount: $${project.total_amount} | PM: ${project.pm_name || 'Unassigned'}`);
    });
    
    console.log('\n🎉 Sample data insertion completed successfully!');
    
  } catch (error) {
    console.error('❌ Sample data insertion failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the sample data insertion
insertSampleData().catch(console.error);

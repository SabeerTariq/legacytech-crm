#!/usr/bin/env node

import mysql from 'mysql2/promise';

const mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: undefined,
  database: 'logicworks_crm',
  charset: 'utf8mb4'
};

async function updateSchema() {
  try {
    console.log('🔌 Connecting to MySQL...');
    const connection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Drop existing tables that need updates
      console.log('🗑️  Dropping tables that need updates...');
      await connection.execute('DROP TABLE IF EXISTS sales_dispositions');
      await connection.execute('DROP TABLE IF EXISTS projects');
      await connection.execute('DROP TABLE IF EXISTS services');
      await connection.execute('DROP TABLE IF EXISTS user_profiles');
      await connection.execute('DROP TABLE IF EXISTS roles');
      await connection.execute('DROP TABLE IF EXISTS user_roles');
      
      console.log('✅ Tables dropped successfully');
      
      // Create updated sales_dispositions table
      console.log('🔨 Creating updated sales_dispositions table...');
      const salesDispositionsSQL = `
        CREATE TABLE \`sales_dispositions\` (
          \`id\` varchar(36) NOT NULL,
          \`sale_date\` text,
          \`customer_name\` text,
          \`phone_number\` text,
          \`email\` text,
          \`front_brand\` text,
          \`business_name\` text,
          \`service_sold\` text,
          \`services_included\` text,
          \`turnaround_time\` text,
          \`service_tenure\` text,
          \`service_details\` text,
          \`agreement_url\` text,
          \`payment_mode\` text,
          \`company\` text,
          \`sales_source\` text,
          \`lead_source\` text,
          \`sale_type\` text,
          \`gross_value\` decimal(15,2),
          \`cash_in\` decimal(15,2),
          \`remaining\` decimal(15,2),
          \`tax_deduction\` decimal(15,2),
          \`seller\` text,
          \`account_manager\` text,
          \`project_manager\` text,
          \`assigned_to\` text,
          \`assigned_by\` text,
          \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          \`user_id\` varchar(36),
          \`lead_id\` text,
          \`is_upsell\` tinyint(1) DEFAULT 0,
          \`original_sales_disposition_id\` text,
          \`service_types\` text,
          \`payment_source\` text,
          \`payment_company\` text,
          \`brand\` text,
          \`agreement_signed\` tinyint(1) DEFAULT 0,
          \`agreement_sent\` tinyint(1) DEFAULT 0,
          \`payment_plan_id\` text,
          \`payment_source_id\` text,
          \`is_recurring\` tinyint(1) DEFAULT 0,
          \`recurring_frequency\` text,
          \`total_installments\` int,
          \`current_installment\` int,
          \`next_payment_date\` text,
          \`upsell_amount\` decimal(15,2),
          \`original_sale_id\` text,
          \`installment_frequency\` text,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      
      await connection.execute(salesDispositionsSQL);
      console.log('✅ sales_dispositions table created');
      
      // Create updated projects table
      console.log('🔨 Creating updated projects table...');
      const projectsSQL = `
        CREATE TABLE \`projects\` (
          \`id\` varchar(36) NOT NULL,
          \`name\` text,
          \`client\` text,
          \`description\` text,
          \`due_date\` text,
          \`status\` text,
          \`progress\` int,
          \`user_id\` varchar(36),
          \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          \`lead_id\` varchar(36),
          \`sales_disposition_id\` varchar(36),
          \`budget\` decimal(15,2),
          \`services\` text,
          \`project_manager\` text,
          \`assigned_pm_id\` varchar(36),
          \`assignment_date\` text,
          \`project_type\` text,
          \`is_upsell\` tinyint(1) DEFAULT 0,
          \`parent_project_id\` text,
          \`total_amount\` decimal(15,2),
          \`amount_paid\` decimal(15,2),
          \`payment_plan_id\` text,
          \`payment_source_id\` text,
          \`is_recurring\` tinyint(1) DEFAULT 0,
          \`recurring_frequency\` text,
          \`next_payment_date\` text,
          \`total_installments\` int,
          \`current_installment\` int,
          \`installment_frequency\` text,
          \`installment_amount\` decimal(15,2),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      
      await connection.execute(projectsSQL);
      console.log('✅ projects table created');
      
      // Create updated services table
      console.log('🔨 Creating updated services table...');
      const servicesSQL = `
        CREATE TABLE \`services\` (
          \`id\` varchar(36) NOT NULL,
          \`name\` text,
          \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
          \`service_type\` text,
          \`billing_frequency\` text,
          \`category\` text,
          \`price\` decimal(15,2),
          \`description\` text,
          \`is_recurring\` tinyint(1) DEFAULT 0,
          \`recurring_frequency\` text,
          \`setup_fee\` decimal(15,2),
          \`recurring_price\` text,
          \`min_contract_months\` int,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      
      await connection.execute(servicesSQL);
      console.log('✅ services table created');
      
      // Create updated user_profiles table
      console.log('🔨 Creating updated user_profiles table...');
      const userProfilesSQL = `
        CREATE TABLE \`user_profiles\` (
          \`id\` varchar(36) NOT NULL,
          \`user_id\` varchar(36),
          \`email\` text,
          \`display_name\` text,
          \`is_admin\` tinyint(1) DEFAULT 0,
          \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          \`employee_id\` text,
          \`is_active\` tinyint(1) DEFAULT 1,
          \`attributes\` text,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      
      await connection.execute(userProfilesSQL);
      console.log('✅ user_profiles table created');
      
      // Create updated roles table
      console.log('🔨 Creating updated roles table...');
      const rolesSQL = `
        CREATE TABLE \`roles\` (
          \`id\` varchar(36) NOT NULL,
          \`name\` text,
          \`display_name\` text,
          \`description\` text,
          \`hierarchy_level\` int,
          \`is_system_role\` tinyint(1) DEFAULT 0,
          \`permissions\` text,
          \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      
      await connection.execute(rolesSQL);
      console.log('✅ roles table created');
      
      // Create updated user_roles table
      console.log('🔨 Creating updated user_roles table...');
      const userRolesSQL = `
        CREATE TABLE \`user_roles\` (
          \`id\` varchar(36) NOT NULL,
          \`user_id\` varchar(36),
          \`role_id\` varchar(36),
          \`created_at\` timestamp DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `;
      
      await connection.execute(userRolesSQL);
      console.log('✅ user_roles table created');
      
      console.log('\n✅ All tables updated successfully!');
      
      // Show final table status
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('\n📊 Tables in database:');
      tables.forEach(table => {
        console.log(`  - ${Object.values(table)[0]}`);
      });
      
    } finally {
      await connection.end();
    }
    
  } catch (error) {
    console.error('❌ Schema update failed:', error.message);
    process.exit(1);
  }
}

updateSchema();

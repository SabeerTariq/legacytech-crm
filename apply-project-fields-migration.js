import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'dev_root',
  password: process.env.MYSQL_PASSWORD || 'Developer@1234',
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

async function applyMigration() {
  let connection;
  
  try {
    console.log('🔧 Starting projects table migration...');
    
    // Read the migration SQL file
    const migrationPath = path.join(process.cwd(), 'add-missing-project-fields.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Connect to database
    connection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Connected to MySQL database');
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`\n📋 Executing statement ${i + 1}/${statements.length}:`);
          console.log(statement.substring(0, 100) + (statement.length > 100 ? '...' : ''));
          
          await connection.execute(statement);
          console.log(`✅ Statement ${i + 1} executed successfully`);
        } catch (error) {
          console.error(`❌ Error executing statement ${i + 1}:`, error.message);
          
          // Continue with other statements unless it's a critical error
          if (error.message.includes('Duplicate column name') || 
              error.message.includes('Duplicate key name')) {
            console.log('⚠️  Column or index already exists, continuing...');
          } else {
            throw error;
          }
        }
      }
    }
    
    // Verify the table structure
    console.log('\n🔍 Verifying table structure...');
    const [columns] = await connection.execute('DESCRIBE projects');
    
    console.log('\n📊 Current projects table structure:');
    columns.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'YES' ? 'NULL' : 'NOT NULL'} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });
    
    // Check if we have any projects data
    const [projectCount] = await connection.execute('SELECT COUNT(*) as count FROM projects');
    console.log(`\n📈 Total projects in database: ${projectCount[0].count}`);
    
    if (projectCount[0].count > 0) {
      // Show sample project data
      const [sampleProjects] = await connection.execute(`
        SELECT id, name, client, assigned_pm_id, due_date, total_amount, amount_paid, services
        FROM projects 
        LIMIT 3
      `);
      
      console.log('\n📋 Sample project data:');
      sampleProjects.forEach(project => {
        console.log(`  - ${project.name}: Client=${project.client}, PM=${project.assigned_pm_id || 'None'}, Due=${project.due_date}, Amount=$${project.total_amount}, Paid=$${project.amount_paid}`);
      });
    }
    
    console.log('\n🎉 Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the migration
applyMigration().catch(console.error);

#!/usr/bin/env node

import mysql from 'mysql2/promise';
import { promises as fs } from 'fs';

const mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: undefined,
  database: 'logicworks_crm',
  charset: 'utf8mb4',
  multipleStatements: false
};

async function applySchema() {
  try {
    console.log('🔌 Connecting to MySQL...');
    const connection = await mysql.createConnection(mysqlConfig);
    
    console.log('📖 Reading schema file...');
    const schemaContent = await fs.readFile('simple-schema.sql', 'utf8');
    
    // Split the schema into individual statements
    const statements = schemaContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🔨 Applying ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          console.log(`  Executing statement ${i + 1}/${statements.length}...`);
          await connection.execute(statement);
        } catch (error) {
          console.error(`  ❌ Error in statement ${i + 1}:`, error.message);
          console.error(`  Statement: ${statement.substring(0, 100)}...`);
        }
      }
    }
    
    console.log('✅ Schema application completed!');
    
    // Verify tables were created
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('\n📊 Tables in database:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
    await connection.end();
    
  } catch (error) {
    console.error('❌ Failed to apply schema:', error.message);
    process.exit(1);
  }
}

applySchema();

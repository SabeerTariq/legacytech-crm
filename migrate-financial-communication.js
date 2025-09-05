#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || undefined,
  database: process.env.MYSQL_DATABASE || 'logicworks_crm',
  port: process.env.MYSQL_PORT || 3306,
  multipleStatements: false
};

async function extractDataFromSupabase(tableName, orderBy = 'created_at') {
  console.log(`📖 Extracting data from Supabase table: ${tableName}`);
  try {
    let query = supabase.from(tableName).select('*');
    try {
      query = query.order(orderBy);
    } catch (orderError) {
      console.log(`  ⚠️  Could not order by ${orderBy}, using no ordering`);
    }
    const { data, error } = await query;
    
    if (error) {
      console.error(`  ❌ Error reading ${tableName}: ${error.message}`);
      return [];
    }
    
    console.log(`  ✅ Extracted ${data?.length || 0} rows from ${tableName}`);
    return data || [];
  } catch (error) {
    console.error(`  ❌ Failed to extract ${tableName}: ${error.message}`);
    return [];
  }
}

function transformRowData(row, columns) {
  const transformedRow = {};
  columns.forEach(column => {
    const columnName = column.name;
    const value = row[columnName];
    let transformedValue;
    
    if (value === null || value === undefined) {
      transformedValue = null;
    } else if (typeof value === 'object') {
      transformedValue = JSON.stringify(value);
    } else {
      transformedValue = value.toString();
    }
    
    transformedRow[columnName] = transformedValue;
  });
  return transformedRow;
}

async function migrateTableData(mysqlConnection, tableName, data, columns) {
  if (!data || data.length === 0) {
    console.log(`  ⚠️  No data to migrate for ${tableName}`);
    return;
  }

  console.log(`  🔄 Migrating ${data.length} rows to MySQL...`);
  
  // Create table if it doesn't exist
  const sampleRow = data[0];
  const columnDefinitions = columns.map(col => {
    const value = sampleRow[col.name];
    let mysqlType = 'text';
    
    // Handle ID columns properly
    if (col.name === 'id') {
      mysqlType = 'varchar(36)';
    } else if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        mysqlType = 'int';
      } else {
        mysqlType = 'decimal(15,2)';
      }
    } else if (typeof value === 'boolean') {
      mysqlType = 'tinyint(1)';
    } else if (typeof value === 'object' && value !== null) {
      mysqlType = 'text';
    }
    
    return `\`${col.name}\` ${mysqlType}`;
  }).join(', ');
  
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      ${columnDefinitions},
      PRIMARY KEY (\`id\`)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `;
  
  try {
    await mysqlConnection.execute(createTableSQL);
    console.log(`    ✅ Table ${tableName} created/verified`);
  } catch (error) {
    console.error(`    ❌ Failed to create table ${tableName}:`, error.message);
    return;
  }
  
  // Insert data in batches
  const batchSize = 100;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    const transformedBatch = batch.map(row => transformRowData(row, columns));
    
    const columnNames = columns.map(col => `\`${col.name}\``).join(', ');
    const placeholders = columns.map(() => '?').join(', ');
    const insertSQL = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${placeholders})`;
    
    try {
      for (const row of transformedBatch) {
        const values = columns.map(col => {
          const value = row[col.name];
          if (value === undefined) return null;
          if (value === null) return null;
          return value;
        });
        await mysqlConnection.execute(insertSQL, values);
      }
      console.log(`    ✅ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(data.length / batchSize)}`);
    } catch (error) {
      console.error(`    ❌ Failed to insert batch:`, error.message);
      break;
    }
  }
  
  console.log(`  ✅ Completed migration for ${tableName}`);
}

async function migrateFinancialCommunication() {
  console.log('🚀 Starting migration of financial, communication, and team management tables...\n');
  
  const mysqlConnection = await mysql.createConnection(mysqlConfig);
  
  try {
    // Disable foreign key checks temporarily
    await mysqlConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
    
    // Next batch of tables to migrate
    const tablesToMigrate = [
      // Financial data
      'payment_sources',
      'payment_plans',
      'payment_transactions',
      'recurring_payment_schedule',
      
      // Communication
      'conversations',
      'messages',
      'ai_chat_conversations',
      'ai_chat_messages',
      'calendar_events',
      
      // Team management
      'teams',
      'team_members',
      'upseller_teams',
      'upseller_team_members',
      'upseller_targets_management'
    ];
    
    for (const tableName of tablesToMigrate) {
      console.log(`\n📋 Migrating table: ${tableName}`);
      
      try {
        // Extract data from Supabase
        const data = await extractDataFromSupabase(tableName);
        
        if (data && data.length > 0) {
          // Infer columns from first row
          const sampleRow = data[0];
          const columns = Object.keys(sampleRow).map(name => ({ 
            name, 
            data_type: 'text' 
          }));
          
          // Migrate data to MySQL
          await migrateTableData(mysqlConnection, tableName, data, columns);
        } else {
          console.log(`  ⚠️  No data found for ${tableName}`);
        }
      } catch (error) {
        console.error(`  ❌ Failed to migrate ${tableName}:`, error.message);
      }
    }
    
    // Re-enable foreign key checks
    await mysqlConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
    
    console.log('\n✅ Financial, communication, and team management migration completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await mysqlConnection.end();
  }
}

migrateFinancialCommunication();

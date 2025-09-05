#!/usr/bin/env node

import mysql from 'mysql2/promise';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yipyteszzyycbqgzpfrf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHl0ZXN6enl5Y2JxZ3pwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzY5MjEsImV4cCI6MjA2MDQ1MjkyMX0._LhWMyPMXDdht_5y3iQnYX9AzDAh-qMv2xDjBRyan7s'
);

const mysqlConfig = {
  host: 'localhost',
  user: 'root',
  password: undefined,
  database: 'logicworks_crm',
  charset: 'utf8mb4'
};

const BATCH_SIZE = 1000;

async function continueMigration() {
  try {
    console.log('🚀 Continuing Supabase to MySQL Migration...');
    
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    try {
      // Disable foreign key checks during migration
      await mysqlConnection.execute('SET FOREIGN_KEY_CHECKS = 0');
      
      // Continue with remaining tables
      console.log('\n📊 Migrating remaining core business data...');
      
      // Sales dispositions
      console.log('🔄 Migrating sales_dispositions...');
      const { data: salesDispositions } = await supabase.from('sales_dispositions').select('*');
      if (salesDispositions?.length > 0) {
        const sampleRow = salesDispositions[0];
        const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
        await migrateTableData(mysqlConnection, 'sales_dispositions', salesDispositions, columns);
      }
      
      // Projects
      console.log('🔄 Migrating projects...');
      const { data: projects } = await supabase.from('projects').select('*');
      if (projects?.length > 0) {
        const sampleRow = projects[0];
        const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
        await migrateTableData(mysqlConnection, 'projects', projects, columns);
      }
      
      // Services
      console.log('🔄 Migrating services...');
      const { data: services } = await supabase.from('services').select('*');
      if (services?.length > 0) {
        const sampleRow = services[0];
        const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
        await migrateTableData(mysqlConnection, 'services', services, columns);
      }
      
      // User management tables
      console.log('\n👥 Migrating user management data...');
      
      // User profiles
      console.log('🔄 Migrating user_profiles...');
      const { data: userProfiles } = await supabase.from('user_profiles').select('*');
      if (userProfiles?.length > 0) {
        const sampleRow = userProfiles[0];
        const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
        await migrateTableData(mysqlConnection, 'user_profiles', userProfiles, columns);
      }
      
      // Roles
      console.log('🔄 Migrating roles...');
      const { data: roles } = await supabase.from('roles').select('*');
      if (roles?.length > 0) {
        const sampleRow = roles[0];
        const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
        await migrateTableData(mysqlConnection, 'roles', roles, columns);
      }
      
      // User roles
      console.log('🔄 Migrating user_roles...');
      const { data: userRoles } = await supabase.from('user_roles').select('*');
      if (userRoles?.length > 0) {
        const sampleRow = userRoles[0];
        const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
        await migrateTableData(mysqlConnection, 'user_roles', userRoles, columns);
      }
      
      // Re-enable foreign key checks
      await mysqlConnection.execute('SET FOREIGN_KEY_CHECKS = 1');
      
      console.log('\n✅ Migration continued successfully!');
      
      // Show final table status
      const [tables] = await mysqlConnection.execute('SHOW TABLES');
      console.log('\n📊 Tables in database:');
      tables.forEach(table => {
        console.log(`  - ${Object.values(table)[0]}`);
      });
      
    } finally {
      await mysqlConnection.end();
    }
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
}

async function migrateTableData(mysqlConnection, tableName, data, columns) {
  if (data.length === 0) {
    console.log(`⏭️  Skipping ${tableName} - no data to migrate`);
    return;
  }
  
  console.log(`🔄 Migrating ${data.length} rows to ${tableName}...`);
  
  try {
    // Process data in batches
    for (let i = 0; i < data.length; i += BATCH_SIZE) {
      const batch = data.slice(i, i + BATCH_SIZE);
      
      // Build INSERT statement
      const columnNames = columns.map(col => `\`${col.name}\``).join(', ');
      const placeholders = columns.map(() => '?').join(', ');
      const insertSQL = `INSERT INTO \`${tableName}\` (${columnNames}) VALUES (${placeholders})`;
      
      // Transform batch data
      const transformedBatch = batch.map(row => transformRowData(row, columns));
      
      // Execute batch insert
      for (const row of transformedBatch) {
        const values = columns.map(col => {
          const value = row[col.name];
          if (value === undefined) return null;
          if (value === null) return null;
          return value;
        });
        await mysqlConnection.execute(insertSQL, values);
      }
      
      console.log(`  ✅ Processed batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(data.length / BATCH_SIZE)}`);
    }
    
    console.log(`✅ Successfully migrated ${data.length} rows to ${tableName}`);
    
  } catch (error) {
    console.error(`❌ Failed to migrate ${tableName}:`, error.message);
    throw error;
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

continueMigration();

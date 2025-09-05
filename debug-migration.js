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

async function debugMigration() {
  try {
    console.log('🔌 Connecting to MySQL...');
    const mysqlConnection = await mysql.createConnection(mysqlConfig);
    
    console.log('📖 Extracting sample data from Supabase...');
    const { data: employees, error } = await supabase
      .from('employees')
      .select('*')
      .limit(3);
    
    if (error) {
      throw new Error(`Supabase error: ${error.message}`);
    }
    
    console.log(`📊 Extracted ${employees.length} sample employees`);
    
    if (employees.length > 0) {
      const sampleRow = employees[0];
      console.log('\n🔍 Sample row data:');
      console.log(JSON.stringify(sampleRow, null, 2));
      
      const columns = Object.keys(sampleRow).map(name => ({ name, data_type: 'text' }));
      console.log('\n🔍 Generated columns:');
      console.log(JSON.stringify(columns, null, 2));
      
      // Test transformation
      console.log('\n🔄 Testing data transformation...');
      const transformedRow = {};
      
      columns.forEach(column => {
        const columnName = column.name;
        const dataType = column.data_type;
        const value = sampleRow[columnName];
        
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
      
      console.log('\n🔍 Transformed row:');
      console.log(JSON.stringify(transformedRow, null, 2));
      
      // Test MySQL INSERT
      console.log('\n🧪 Testing MySQL INSERT...');
      const columnNames = columns.map(col => `\`${col.name}\``).join(', ');
      const placeholders = columns.map(() => '?').join(', ');
      const insertSQL = `INSERT INTO \`employees\` (${columnNames}) VALUES (${placeholders})`;
      
      console.log('SQL:', insertSQL);
      
      const values = columns.map(col => transformedRow[col.name]);
      console.log('Values:', values);
      console.log('Values types:', values.map(v => typeof v));
      
      await mysqlConnection.execute(insertSQL, values);
      console.log('✅ Test INSERT successful!');
      
      // Clean up
      await mysqlConnection.execute('DELETE FROM employees WHERE id = ?', [sampleRow.id]);
      console.log('🧹 Test data cleaned up');
    }
    
    await mysqlConnection.end();
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Error details:', error);
  }
}

debugMigration();

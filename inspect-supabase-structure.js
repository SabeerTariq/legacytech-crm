#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://yipyteszzyycbqgzpfrf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHl0ZXN6enl5Y2JxZ3pwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzY5MjEsImV4cCI6MjA2MDQ1MjkyMX0._LhWMyPMXDdht_5y3iQnYX9AzDAh-qMv2xDjBRyan7s'
);

async function inspectSupabaseStructure() {
  try {
    console.log('🔍 Inspecting Supabase table structures...\n');
    
    const tables = [
      'sales_dispositions',
      'projects',
      'services',
      'user_profiles',
      'roles',
      'user_roles'
    ];
    
    for (const tableName of tables) {
      console.log(`📋 Table: ${tableName}`);
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          console.log(`  ❌ Error: ${error.message}`);
        } else if (data && data.length > 0) {
          const sampleRow = data[0];
          const columns = Object.keys(sampleRow);
          
          console.log(`  📊 Columns (${columns.length}):`);
          columns.forEach(col => {
            const value = sampleRow[col];
            const type = typeof value;
            const isNull = value === null;
            console.log(`    - ${col}: ${type}${isNull ? ' (null)' : ''}`);
          });
        } else {
          console.log('  ⚠️  No data found');
        }
      } catch (err) {
        console.log(`  ❌ Failed to inspect: ${err.message}`);
      }
      
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Inspection failed:', error.message);
  }
}

inspectSupabaseStructure();

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHl0ZXN6enl5Y2JxZ3pwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4NzY5MjEsImV4cCI6MjA2MDQ1MjkyMX0._LhWMyPMXDdht_5y3iQnYX9AzDAh-qMv2xDjBRyan7s";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function checkExistingTables() {
  console.log('🔍 Checking existing tables in database...\n');

  try {
    // Check for specific tables we need by trying to access them
    console.log('🔍 Checking for specific required tables:');
    const requiredTables = [
      'user_profiles',
      'roles', 
      'user_roles',
      'permissions',
      'permission_audit_log',
      'role_hierarchies'
    ];

    for (const tableName of requiredTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);

        if (error) {
          if (error.code === '42P01') {
            console.log(`   ❌ ${tableName} - TABLE DOES NOT EXIST`);
          } else {
            console.log(`   ⚠️  ${tableName} - EXISTS BUT ACCESS ERROR: ${error.message}`);
          }
        } else {
          console.log(`   ✅ ${tableName} - EXISTS AND ACCESSIBLE`);
        }
      } catch (error) {
        console.log(`   ❌ ${tableName} - ERROR: ${error.message}`);
      }
    }

    // Check if we can access auth.users (this should exist)
    console.log('\n🔍 Checking auth schema access:');
    try {
      const { data: authUsers, error: authError } = await supabase
        .from('auth.users')
        .select('id, email')
        .limit(1);

      if (authError) {
        console.log(`   ❌ auth.users - ${authError.message}`);
      } else {
        console.log(`   ✅ auth.users - ACCESSIBLE (${authUsers?.length || 0} users found)`);
      }
    } catch (error) {
      console.log(`   ❌ auth.users - ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  }
}

checkExistingTables(); 
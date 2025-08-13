import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFrontSellerPerformanceSchema() {
  try {
    console.log('Checking front_seller_performance table schema...');
    
    // Get table information
    const { data, error } = await supabase
      .from('front_seller_performance')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error querying table:', error);
      return;
    }
    
    console.log('✅ Table exists and is accessible');
    console.log('Sample data structure:', data);
    
    // Get column information using information_schema
    const { data: columns, error: columnError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'front_seller_performance'
          ORDER BY ordinal_position;
        `
      });
    
    if (columnError) {
      console.error('Error getting column info:', columnError);
      return;
    }
    
    console.log('\n📋 Column Information:');
    columns.forEach(col => {
      console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });
    
  } catch (error) {
    console.error('Exception during schema check:', error);
  }
}

checkFrontSellerPerformanceSchema(); 
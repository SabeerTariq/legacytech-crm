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

async function checkSalesDispositionsSchema() {
  try {
    console.log('Checking sales_dispositions table schema...');
    
    // Try to get a sample record to see the structure
    const { data, error } = await supabase
      .from('sales_dispositions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing sales_dispositions table:', error);
      
      if (error.message.includes('profiles')) {
        console.error('❌ The "profiles" table error still exists!');
        console.error('This confirms that database functions/triggers still reference the non-existent "profiles" table.');
      } else {
        console.error('❌ Different error occurred:', error.message);
      }
    } else {
      console.log('✅ Successfully accessed sales_dispositions table');
      console.log('Sample record structure:', data);
      
      if (data && data.length > 0) {
        console.log('Available columns:', Object.keys(data[0]));
      }
    }
    
  } catch (error) {
    console.error('Exception during schema check:', error);
  }
}

checkSalesDispositionsSchema(); 
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

async function checkLeadsSchema() {
  try {
    console.log('Checking leads table schema...');
    
    // Try to get a sample record to see the structure
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('Error accessing leads table:', error);
    } else {
      console.log('✅ Successfully accessed leads table');
      console.log('Sample record structure:', data);
      
      if (data && data.length > 0) {
        console.log('Available columns:', Object.keys(data[0]));
      }
    }
    
  } catch (error) {
    console.error('Exception during schema check:', error);
  }
}

checkLeadsSchema(); 
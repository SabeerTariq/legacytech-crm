const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

console.log('Starting debug script...');
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_PUBLISHABLE_KEY:', process.env.SUPABASE_PUBLISHABLE_KEY ? 'EXISTS' : 'MISSING');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    const { data, error } = await supabase
      .from('sales_dispositions')
      .select('id, customer_name')
      .limit(3);
    
    if (error) {
      console.error('Database error:', error);
    } else {
      console.log('Success! Found customers:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

testConnection();

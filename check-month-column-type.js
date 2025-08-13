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

async function checkMonthColumnType() {
  try {
    console.log('Checking front_seller_performance table month column type...');
    
    // Get sample data to see the month column format
    const { data, error } = await supabase
      .from('front_seller_performance')
      .select('month, seller_id, accounts_achieved')
      .limit(3);
    
    if (error) {
      console.error('Error querying table:', error);
      return;
    }
    
    console.log('✅ Sample data from front_seller_performance:');
    data.forEach(row => {
      console.log(`- Month: "${row.month}" (type: ${typeof row.month})`);
      console.log(`  Seller ID: ${row.seller_id}`);
      console.log(`  Accounts: ${row.accounts_achieved}`);
    });
    
    // Check what the current month would look like
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
    console.log(`\n📅 Current month format: "${currentMonth}"`);
    
    // Test a simple query to see the exact format
    const { data: testData, error: testError } = await supabase
      .from('front_seller_performance')
      .select('month')
      .eq('month', '2025-07-01')
      .limit(1);
    
    if (testError) {
      console.error('Error testing month query:', testError);
    } else {
      console.log(`✅ Found ${testData.length} records for 2025-07-01`);
    }
    
  } catch (error) {
    console.error('Exception during check:', error);
  }
}

checkMonthColumnType(); 
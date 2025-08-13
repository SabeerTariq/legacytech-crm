import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const checkSalesDispositionsStructure = async () => {
  try {
    console.log('🔍 Checking Sales Dispositions Table Structure...\n');

    // 1. Check sample data to see the structure
    console.log('📋 1. Checking sales_dispositions table structure...');
    const { data: sampleSales, error: sampleError } = await supabase
      .from('sales_dispositions')
      .select('*')
      .limit(3);

    if (sampleError) {
      console.error('❌ Error fetching sample data:', sampleError);
      return;
    }

    console.log(`📊 Found ${sampleSales.length} sample records`);
    
    if (sampleSales.length > 0) {
      console.log('\n📊 Sales Dispositions Table Columns:');
      const columns = Object.keys(sampleSales[0]);
      columns.forEach(col => {
        console.log(`  - ${col}`);
      });

      // 2. Check if user_id field exists
      const hasUserId = columns.includes('user_id');
      console.log(`\n📋 2. User ID field exists: ${hasUserId ? '✅ YES' : '❌ NO'}`);

      // 3. Show sample data
      console.log('\n📋 3. Sample sales dispositions:');
      sampleSales.forEach((sale, index) => {
        console.log(`\n📋 Sample ${index + 1}:`);
        Object.keys(sale).forEach(key => {
          console.log(`  - ${key}: ${sale[key]}`);
        });
      });

      // 4. Check if we need to add user_id field
      if (!hasUserId) {
        console.log('\n📋 4. User ID field is missing!');
        console.log('📋 Need to add user_id field to track who created each sale');
        console.log('📋 This is required for front_sales user filtering');
      } else {
        console.log('\n📋 4. User ID field exists - checking data...');
        
        // Check how many records have user_id
        const { data: userCount, error: countError } = await supabase
          .from('sales_dispositions')
          .select('user_id')
          .not('user_id', 'is', null);

        if (countError) {
          console.error('❌ Error checking user_id data:', countError);
          return;
        }

        console.log(`📊 Records with user_id: ${userCount.length}`);
      }
    } else {
      console.log('❌ No sales dispositions found in the table');
    }

    console.log('\n🎯 Analysis Complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

checkSalesDispositionsStructure(); 
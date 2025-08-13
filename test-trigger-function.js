import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function testTriggerFunction() {
  console.log('🧪 Testing trigger function...\n');

  try {
    const currentUserId = 'de514a73-4782-439e-b2ea-3f49fe568e24'; // ali@logicworks.ai

    // Check current performance data
    console.log('📊 Current performance data:');
    const { data: currentPerformance, error: currentPerfError } = await supabase
      .from('front_seller_performance')
      .select('*')
      .eq('seller_id', currentUserId);

    if (currentPerfError) {
      console.log('❌ Error checking current performance:', currentPerfError);
    } else {
      console.log(`📈 Current performance records: ${currentPerformance.length}`);
      currentPerformance.forEach(perf => {
        console.log(`  - Month: ${perf.month}, Accounts: ${perf.accounts_achieved}, Gross: ${perf.total_gross}`);
      });
    }

    // Create a test sales disposition to trigger the function
    console.log('\n📝 Creating test sales disposition...');
    const { data: newSale, error: saleError } = await supabase
      .from('sales_dispositions')
      .insert({
        sale_date: new Date().toISOString().split('T')[0],
        customer_name: 'Test Customer Trigger',
        phone_number: '+1234567890',
        email: 'testtrigger@example.com',
        service_sold: 'Web Development',
        services_included: ['Web Development'],
        turnaround_time: '2 weeks',
        service_tenure: '1 month',
        service_details: 'Test service details for trigger',
        gross_value: 2500,
        cash_in: 2500,
        remaining: 0,
        payment_mode: 'WIRE',
        company: 'American Digital Agency',
        sales_source: 'BARK',
        lead_source: 'PAID_MARKETING',
        sale_type: 'FRONT',
        seller: 'Ali Logicworks',
        account_manager: 'Test Account Manager',
        project_manager: 'Test Project Manager',
        assigned_to: 'Test Assigned To',
        user_id: currentUserId,
        assigned_by: currentUserId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (saleError) {
      console.log('❌ Error creating test sale:', saleError);
    } else {
      console.log('✅ Test sale created:', newSale);
    }

    // Wait a moment for the trigger to process
    console.log('\n⏳ Waiting for trigger to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Check if performance data was created
    console.log('\n📊 Checking performance data after trigger:');
    const { data: newPerformance, error: newPerfError } = await supabase
      .from('front_seller_performance')
      .select('*')
      .eq('seller_id', currentUserId);

    if (newPerfError) {
      console.log('❌ Error checking new performance:', newPerfError);
    } else {
      console.log(`📈 New performance records: ${newPerformance.length}`);
      newPerformance.forEach(perf => {
        console.log(`  - Month: ${perf.month}, Accounts: ${perf.accounts_achieved}, Gross: ${perf.total_gross}`);
      });
    }

    // Check if the trigger function exists
    console.log('\n🔍 Checking if trigger function exists...');
    const { data: functions, error: funcError } = await supabase
      .rpc('get_function_info', { function_name: 'update_front_seller_performance' });

    if (funcError) {
      console.log('❌ Error checking function:', funcError);
      console.log('This might mean the function doesn\'t exist or there\'s no RPC to check it');
    } else {
      console.log('✅ Function info:', functions);
    }

    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    const { error: deleteError } = await supabase
      .from('sales_dispositions')
      .delete()
      .eq('customer_name', 'Test Customer Trigger');

    if (deleteError) {
      console.log('❌ Error deleting test sale:', deleteError);
    } else {
      console.log('✅ Test sale deleted');
    }

  } catch (error) {
    console.error('Error in testTriggerFunction:', error);
  }
}

testTriggerFunction(); 
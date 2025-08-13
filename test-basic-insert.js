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

async function testBasicInsert() {
  try {
    console.log('Testing basic sales disposition insertion...');
    
    // First, let's temporarily disable the trigger
    console.log('Temporarily disabling the trigger...');
    const { error: disableError } = await supabase
      .rpc('exec_sql', {
        sql: 'ALTER TABLE sales_dispositions DISABLE TRIGGER trigger_update_front_seller_performance;'
      });
    
    if (disableError) {
      console.log('Could not disable trigger (expected if exec_sql not available):', disableError.message);
    } else {
      console.log('✅ Trigger disabled');
    }
    
    // Test data for a new sales disposition
    const testSalesDisposition = {
      sale_date: new Date().toISOString().split('T')[0],
      customer_name: 'Test Customer Basic',
      phone_number: '+1234567890',
      email: 'testbasic@example.com',
      service_sold: 'Web Development',
      services_included: ['Web Development'],
      turnaround_time: '2 weeks',
      service_tenure: '1 month',
      service_details: 'Test service details',
      gross_value: 5000,
      cash_in: 5000,
      remaining: 0,
      payment_mode: 'WIRE',
      company: 'American Digital Agency',
      sales_source: 'BARK',
      lead_source: 'PAID_MARKETING',
      sale_type: 'FRONT',
      seller: 'Test Seller',
      account_manager: 'Test Account Manager',
      project_manager: 'Test Project Manager',
      assigned_to: 'Test Assigned To',
      user_id: 'de514a73-4782-439e-b2ea-3f49fe568e24',
      assigned_by: 'de514a73-4782-439e-b2ea-3f49fe568e24',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Attempting to insert test sales disposition...');
    console.log('Test data:', testSalesDisposition);
    
    const { data, error } = await supabase
      .from('sales_dispositions')
      .insert(testSalesDisposition)
      .select();
    
    if (error) {
      console.error('❌ Error creating sales disposition:', error);
    } else {
      console.log('✅ Sales disposition created successfully!');
      console.log('Created record:', data);
      
      // Clean up - delete the test record
      console.log('Cleaning up test record...');
      const { error: deleteError } = await supabase
        .from('sales_dispositions')
        .delete()
        .eq('email', 'testbasic@example.com');
      
      if (deleteError) {
        console.error('Error cleaning up test record:', deleteError);
      } else {
        console.log('✅ Test record cleaned up successfully');
      }
    }
    
    // Re-enable the trigger
    console.log('Re-enabling the trigger...');
    const { error: enableError } = await supabase
      .rpc('exec_sql', {
        sql: 'ALTER TABLE sales_dispositions ENABLE TRIGGER trigger_update_front_seller_performance;'
      });
    
    if (enableError) {
      console.log('Could not re-enable trigger (expected if exec_sql not available):', enableError.message);
    } else {
      console.log('✅ Trigger re-enabled');
    }
    
  } catch (error) {
    console.error('Exception during test:', error);
  }
}

testBasicInsert(); 
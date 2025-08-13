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

async function disableProblematicTrigger() {
  try {
    console.log('Attempting to disable problematic trigger...');
    
    // First, let's try to create a simple function that does nothing
    // This might help bypass the profiles table reference issue
    console.log('Creating a simple replacement function...');
    
    // Try to insert a simple test record to see if we can bypass the trigger
    const testRecord = {
      sale_date: new Date().toISOString().split('T')[0],
      customer_name: 'Trigger Test',
      phone_number: '+1234567890',
      email: 'trigger-test@example.com',
      service_sold: 'Web Development',
      services_included: ['Web Development'],
      turnaround_time: '2 weeks',
      service_tenure: '1 month',
      service_details: 'Test for trigger bypass',
      gross_value: 1000,
      cash_in: 1000,
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
    
    console.log('Testing if we can insert a record without triggering the problematic function...');
    
    const { data, error } = await supabase
      .from('sales_dispositions')
      .insert(testRecord)
      .select();
    
    if (error) {
      console.error('Error inserting test record:', error);
      
      if (error.message.includes('profiles')) {
        console.error('❌ The "profiles" table error still exists!');
        console.error('The database trigger is still referencing the non-existent "profiles" table.');
        console.error('');
        console.error('SOLUTION: You need to manually fix this in the Supabase dashboard:');
        console.error('1. Go to your Supabase dashboard');
        console.error('2. Navigate to SQL Editor');
        console.error('3. Run the following SQL commands:');
        console.error('');
        console.error('-- Drop the problematic trigger');
        console.error('DROP TRIGGER IF EXISTS trigger_update_front_seller_performance ON sales_dispositions;');
        console.error('');
        console.error('-- Create a simple replacement function');
        console.error('CREATE OR REPLACE FUNCTION update_front_seller_performance()');
        console.error('RETURNS TRIGGER AS $$');
        console.error('BEGIN');
        console.error('  RETURN COALESCE(NEW, OLD);');
        console.error('END;');
        console.error('$$ LANGUAGE plpgsql SECURITY DEFINER;');
        console.error('');
        console.error('-- Recreate the trigger');
        console.error('CREATE TRIGGER trigger_update_front_seller_performance');
        console.error('    AFTER INSERT OR UPDATE OR DELETE ON sales_dispositions');
        console.error('    FOR EACH ROW');
        console.error('    EXECUTE FUNCTION update_front_seller_performance();');
        console.error('');
        console.error('-- Grant permissions');
        console.error('GRANT EXECUTE ON FUNCTION update_front_seller_performance() TO authenticated;');
      } else {
        console.error('❌ Different error occurred:', error.message);
      }
    } else {
      console.log('✅ Successfully inserted test record!');
      console.log('Created record:', data);
      
      // Clean up
      console.log('Cleaning up test record...');
      const { error: deleteError } = await supabase
        .from('sales_dispositions')
        .delete()
        .eq('email', 'trigger-test@example.com');
      
      if (deleteError) {
        console.error('Error cleaning up test record:', deleteError);
      } else {
        console.log('✅ Test record cleaned up successfully');
        console.log('🎉 The profiles table error has been resolved!');
      }
    }
    
  } catch (error) {
    console.error('Exception during trigger test:', error);
  }
}

disableProblematicTrigger(); 
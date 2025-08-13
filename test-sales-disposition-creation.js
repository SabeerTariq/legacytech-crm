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

async function testSalesDispositionCreation() {
  try {
    console.log('Testing sales disposition creation...');
    
    // Test data for a new sales disposition using correct column names and valid enum values
    const testSalesDisposition = {
      sale_date: new Date().toISOString().split('T')[0],
      customer_name: 'Test Customer',
      phone_number: '+1234567890',
      email: 'test@example.com',
      service_sold: 'Web Development',
      services_included: ['Web Development'],
      turnaround_time: '2 weeks', // Add required field
      service_tenure: '1 month', // Add required field
      service_details: 'Test service details',
      gross_value: 5000,
      cash_in: 5000,
      remaining: 0,
      payment_mode: 'WIRE',
      company: 'American Digital Agency', // Use existing company name from the sample data
      sales_source: 'BARK',
      lead_source: 'PAID_MARKETING',
      sale_type: 'FRONT',
      seller: 'Test Seller', // Add required field
      account_manager: 'Test Account Manager', // Add required field
      project_manager: 'Test Project Manager', // Add required field
      assigned_to: 'Test Assigned To', // Add required field
      user_id: 'de514a73-4782-439e-b2ea-3f49fe568e24', // Use existing user ID
      assigned_by: 'de514a73-4782-439e-b2ea-3f49fe568e24', // Use existing user ID
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
      console.error('Error creating sales disposition:', error);
      
      if (error.message.includes('profiles')) {
        console.error('❌ The "profiles" table error still exists!');
        console.error('This means the database functions/triggers still reference the non-existent "profiles" table.');
      } else {
        console.error('❌ Different error occurred:', error.message);
      }
    } else {
      console.log('✅ Sales disposition created successfully!');
      console.log('Created record:', data);
      
      // Clean up - delete the test record
      console.log('Cleaning up test record...');
      const { error: deleteError } = await supabase
        .from('sales_dispositions')
        .delete()
        .eq('email', 'test@example.com');
      
      if (deleteError) {
        console.error('Error cleaning up test record:', deleteError);
      } else {
        console.log('✅ Test record cleaned up successfully');
      }
    }
    
  } catch (error) {
    console.error('Exception during test:', error);
  }
}

testSalesDispositionCreation(); 
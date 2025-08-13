import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const applyProfilesFix = async () => {
  try {
    console.log('🔧 Applying profiles table references fix...\n');

    // Read the SQL fix file
    const sqlFix = fs.readFileSync('fix-profiles-references.sql', 'utf8');
    
    console.log('📋 Executing SQL fix...');
    
    // Execute the SQL fix
    const { error } = await supabase.rpc('exec_sql', { sql: sqlFix });
    
    if (error) {
      console.error('❌ Error applying fix:', error);
      return;
    }
    
    console.log('✅ Profiles table references fix applied successfully!');
    
    // Test if the fix worked
    console.log('\n📋 Testing sales disposition creation...');
    
    // Try to create a test sales disposition
    const testSalesData = {
      customer_name: "Test Customer Fix",
      email: "testfix@example.com",
      phone_number: "(555) 123-4567",
      business_name: "Test Business Fix",
      service_sold: "Web Design",
      services_included: ["Web Design"],
      service_details: "Test service details for fix",
      payment_mode: "WIRE",
      company: "American Digital Agency",
      sales_source: "BARK",
      lead_source: "PAID_MARKETING",
      sale_type: "FRONT",
      seller: "",
      account_manager: "",
      assigned_by: "b58515cb-6880-482e-a78e-7872bb53e3a8",
      assigned_to: "",
      project_manager: "",
      gross_value: 1000,
      cash_in: 500,
      remaining: 500,
      tax_deduction: 0,
      sale_date: new Date().toISOString().split('T')[0],
      service_tenure: "",
      turnaround_time: "",
      user_id: "b58515cb-6880-482e-a78e-7872bb53e3a8"
    };

    const { data: testSales, error: testError } = await supabase
      .from('sales_dispositions')
      .insert(testSalesData)
      .select()
      .single();

    if (testError) {
      console.error('❌ Error creating test sales disposition:', testError);
    } else {
      console.log('✅ Test sales disposition created successfully!');
      console.log(`📊 Test sale ID: ${testSales.id}`);
      console.log(`📊 Test sale user_id: ${testSales.user_id}`);
      
      // Clean up - delete the test record
      const { error: deleteError } = await supabase
        .from('sales_dispositions')
        .delete()
        .eq('id', testSales.id);
        
      if (deleteError) {
        console.error('❌ Error deleting test record:', deleteError);
      } else {
        console.log('✅ Test record cleaned up');
      }
    }

    console.log('\n🎯 Profiles Fix Complete!');
    console.log('📋 The "profiles" table reference error should now be resolved.');
    console.log('📋 You should be able to create sales dispositions without the error.');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

applyProfilesFix(); 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function testUpsellEnums() {
  console.log('🔍 Testing Upsell Form Enum Values...\n');
  
  try {
    // Test data with the corrected enum values
    const testUpsellData = {
      customer_name: "Test Customer",
      phone_number: "123-456-7890",
      email: "test@example.com",
      business_name: "Test Business",
      front_brand: "Test Brand",
      service_sold: "Web Design",
      services_included: ["Web Design"],
      service_details: "Test service details",
      agreement_url: null,
      payment_mode: "WIRE",
      payment_source: "Wire",
      payment_company: "American Digital Agency",
      brand: "Liberty Web Studio",
      agreement_signed: false,
      agreement_sent: false,
      company: "American Digital Agency",
      sales_source: "REFFERAL", // Fixed: was "REFERRAL"
      lead_source: "ORGANIC",
      sale_type: "UPSELL",
      gross_value: 1000,
      cash_in: 500,
      remaining: 500,
      tax_deduction: 0,
      seller: "test-seller-id",
      account_manager: "test-account-manager",
      project_manager: "test-project-manager",
      assigned_to: "test-assigned-to",
      assigned_by: "test-assigned-by",
      user_id: "test-user-id",
      lead_id: null,
      is_upsell: true,
      original_sales_disposition_id: "test-original-id",
      service_tenure: "1 year",
      turnaround_time: "2 weeks",
      service_types: ["Web Design"]
    };

    console.log('✅ Test data prepared with corrected enum values:');
    console.log('- sales_source:', testUpsellData.sales_source);
    console.log('- lead_source:', testUpsellData.lead_source);
    console.log('- sale_type:', testUpsellData.sale_type);
    console.log('- company:', testUpsellData.company);
    console.log('- payment_mode:', testUpsellData.payment_mode);
    console.log('');

    // Test if we can insert this data (we'll rollback)
    console.log('🧪 Testing database insertion...');
    
    const { data, error } = await supabase
      .from('sales_dispositions')
      .insert(testUpsellData)
      .select('id')
      .single();

    if (error) {
      console.error('❌ Insert failed:', error);
      console.log('');
      console.log('🔍 Error details:');
      console.log('- Code:', error.code);
      console.log('- Message:', error.message);
      console.log('- Details:', error.details);
      console.log('- Hint:', error.hint);
    } else {
      console.log('✅ Insert successful! ID:', data.id);
      
      // Clean up - delete the test record
      const { error: deleteError } = await supabase
        .from('sales_dispositions')
        .delete()
        .eq('id', data.id);
      
      if (deleteError) {
        console.log('⚠️ Warning: Could not delete test record:', deleteError.message);
      } else {
        console.log('✅ Test record cleaned up');
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testUpsellEnums();

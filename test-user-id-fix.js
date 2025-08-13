import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const testUserIdFix = async () => {
  try {
    console.log('🔍 Testing User ID Fix for Sales Dispositions...\n');

    // 1. Check current sales_dispositions with null user_id
    console.log('📋 1. Checking sales_dispositions with null user_id...');
    const { data: nullUserIdSales, error: nullError } = await supabase
      .from('sales_dispositions')
      .select('*')
      .is('user_id', null);

    if (nullError) {
      console.error('❌ Error checking null user_id sales:', nullError);
      return;
    }

    console.log(`📊 Found ${nullUserIdSales.length} sales dispositions with null user_id`);
    
    if (nullUserIdSales.length > 0) {
      console.log('📊 Sample records with null user_id:');
      nullUserIdSales.slice(0, 3).forEach((sale, index) => {
        console.log(`  ${index + 1}. ${sale.customer_name} (${sale.email}) - $${sale.gross_value} - Created: ${sale.created_at}`);
      });
    }

    // 2. Check sales_dispositions with valid user_id
    console.log('\n📋 2. Checking sales_dispositions with valid user_id...');
    const { data: validUserIdSales, error: validError } = await supabase
      .from('sales_dispositions')
      .select('*')
      .not('user_id', 'is', null);

    if (validError) {
      console.error('❌ Error checking valid user_id sales:', validError);
      return;
    }

    console.log(`📊 Found ${validUserIdSales.length} sales dispositions with valid user_id`);
    
    if (validUserIdSales.length > 0) {
      console.log('📊 Sample records with valid user_id:');
      validUserIdSales.slice(0, 3).forEach((sale, index) => {
        console.log(`  ${index + 1}. ${sale.customer_name} (${sale.email}) - User ID: ${sale.user_id} - $${sale.gross_value}`);
      });
    }

    // 3. Check user_profiles to get valid user IDs
    console.log('\n📋 3. Checking user_profiles for valid user IDs...');
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(5);

    if (profilesError) {
      console.error('❌ Error checking user_profiles:', profilesError);
      return;
    }

    console.log(`📊 Found ${userProfiles.length} user profiles`);
    userProfiles.forEach((profile, index) => {
      console.log(`  ${index + 1}. ${profile.email} - User ID: ${profile.user_id}`);
    });

    // 4. Test creating a sales disposition with a valid user_id
    if (userProfiles.length > 0) {
      console.log('\n📋 4. Testing sales disposition creation with valid user_id...');
      
      const testUserId = userProfiles[0].user_id;
      console.log(`📊 Using test user ID: ${testUserId}`);
      
      const testSalesData = {
        customer_name: "Test Customer",
        email: "test@example.com",
        phone_number: "(555) 123-4567",
        business_name: "Test Business",
        service_sold: "Web Design",
        services_included: ["Web Design"],
        service_details: "Test service details",
        payment_mode: "WIRE",
        company: "American Digital Agency",
        sales_source: "BARK",
        lead_source: "PAID_MARKETING",
        sale_type: "FRONT",
        seller: "",
        account_manager: "",
        assigned_by: testUserId,
        assigned_to: "",
        project_manager: "",
        gross_value: 1000,
        cash_in: 500,
        remaining: 500,
        tax_deduction: 0,
        sale_date: new Date().toISOString().split('T')[0],
        service_tenure: "",
        turnaround_time: "",
        user_id: testUserId
      };

      try {
        const { data: testSales, error: testError } = await supabase
          .from('sales_dispositions')
          .insert(testSalesData)
          .select()
          .single();

        if (testError) {
          console.error('❌ Error creating test sales disposition:', testError);
        } else {
          console.log('✅ Successfully created test sales disposition with user_id');
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
      } catch (error) {
        console.error('❌ Error in test creation:', error);
      }
    }

    // 5. Summary
    console.log('\n📋 5. Summary:');
    console.log(`📊 Total sales dispositions: ${(nullUserIdSales?.length || 0) + (validUserIdSales?.length || 0)}`);
    console.log(`📊 With null user_id: ${nullUserIdSales?.length || 0}`);
    console.log(`📊 With valid user_id: ${validUserIdSales?.length || 0}`);
    
    if (nullUserIdSales?.length > 0) {
      console.log('⚠️  WARNING: Some sales dispositions have null user_id');
      console.log('📋 These records will not be visible to front_sales users');
      console.log('📋 Consider updating these records with valid user_id values');
    } else {
      console.log('✅ All sales dispositions have valid user_id values');
    }

    console.log('\n🎯 User ID Fix Test Complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

testUserIdFix(); 
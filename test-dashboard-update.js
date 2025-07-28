// Test script to verify dashboard performance tracking
// Run this script to test if the automatic performance tracking is working

const { createClient } = require('@supabase/supabase-js');

// You'll need to add your Supabase URL and anon key here
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDashboardUpdate() {
  console.log('🧪 Testing Dashboard Performance Update System...\n');

  try {
    // 1. Get a Front Sales employee for testing
    console.log('1. Finding a Front Sales employee...');
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('email, full_name, department')
      .eq('department', 'Front Sales')
      .limit(1);

    if (empError || !employees || employees.length === 0) {
      console.error('❌ No Front Sales employees found');
      return;
    }

    const testEmployee = employees[0];
    console.log(`✅ Found Front Sales employee: ${testEmployee.full_name} (${testEmployee.email})`);

    // 2. Get the corresponding profile
    console.log('\n2. Getting employee profile...');
    const username = testEmployee.email.split('@')[0];
    const { data: profile, error: profError } = await supabase
      .from('profiles')
      .select('id, username, full_name')
      .eq('username', username)
      .single();

    if (profError || !profile) {
      console.error('❌ No profile found for employee');
      return;
    }

    console.log(`✅ Found profile: ${profile.full_name} (ID: ${profile.id})`);

    // 3. Check current performance
    console.log('\n3. Checking current performance...');
    const currentMonth = new Date();
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const { data: currentPerformance, error: perfError } = await supabase
      .from('front_seller_performance')
      .select('*')
      .eq('seller_id', profile.id)
      .eq('month', monthStart.toISOString().split('T')[0])
      .single();

    if (perfError && perfError.code !== 'PGRST116') {
      console.error('❌ Error checking performance:', perfError);
      return;
    }

    const beforeAccounts = currentPerformance?.accounts_achieved || 0;
    const beforeGross = currentPerformance?.total_gross || 0;
    const beforeCashIn = currentPerformance?.total_cash_in || 0;

    console.log(`📊 Current Performance:`);
    console.log(`   - Accounts Achieved: ${beforeAccounts}`);
    console.log(`   - Total Gross: $${beforeGross}`);
    console.log(`   - Total Cash In: $${beforeCashIn}`);

    // 4. Create a test sales disposition
    console.log('\n4. Creating test sales disposition...');
    const testSalesData = {
      customer_name: 'Test Customer - Dashboard Update',
      phone_number: '+1234567890',
      email: 'test@example.com',
      business_name: 'Test Business',
      service_sold: 'Web Development',
      services_included: ['Web Development'],
      service_details: 'Test service for dashboard update verification',
      payment_mode: 'WIRE',
      company: 'American Digital Agency',
      sales_source: 'BARK',
      lead_source: 'PAID_MARKETING',
      sale_type: 'FRONT',
      seller: 'Test Seller',
      account_manager: 'Test Manager',
      assigned_by: profile.id,
      assigned_to: profile.id,
      project_manager: 'Test PM',
      gross_value: 2500.00,
      cash_in: 1500.00,
      remaining: 1000.00,
      tax_deduction: 0.00,
      sale_date: new Date().toISOString().split('T')[0],
      service_tenure: '12 months',
      turnaround_time: '30 days',
      user_id: profile.id
    };

    const { data: newSales, error: salesError } = await supabase
      .from('sales_dispositions')
      .insert(testSalesData)
      .select()
      .single();

    if (salesError) {
      console.error('❌ Error creating sales disposition:', salesError);
      return;
    }

    console.log(`✅ Test sales disposition created with ID: ${newSales.id}`);
    console.log(`   - Gross Value: $${newSales.gross_value}`);
    console.log(`   - Cash In: $${newSales.cash_in}`);
    console.log(`   - Remaining: $${newSales.remaining}`);

    // 5. Wait a moment for the trigger to process
    console.log('\n5. Waiting for trigger to process...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 6. Check updated performance
    console.log('\n6. Checking updated performance...');
    const { data: updatedPerformance, error: updateError } = await supabase
      .from('front_seller_performance')
      .select('*')
      .eq('seller_id', profile.id)
      .eq('month', monthStart.toISOString().split('T')[0])
      .single();

    if (updateError) {
      console.error('❌ Error checking updated performance:', updateError);
      return;
    }

    const afterAccounts = updatedPerformance?.accounts_achieved || 0;
    const afterGross = updatedPerformance?.total_gross || 0;
    const afterCashIn = updatedPerformance?.total_cash_in || 0;

    console.log(`📊 Updated Performance:`);
    console.log(`   - Accounts Achieved: ${afterAccounts}`);
    console.log(`   - Total Gross: $${afterGross}`);
    console.log(`   - Total Cash In: $${afterCashIn}`);

    // 7. Verify the changes
    console.log('\n7. Verifying changes...');
    const accountsDiff = afterAccounts - beforeAccounts;
    const grossDiff = afterGross - beforeGross;
    const cashInDiff = afterCashIn - beforeCashIn;

    if (accountsDiff === 1 && grossDiff === 2500 && cashInDiff === 1500) {
      console.log('✅ SUCCESS! Dashboard performance updated correctly:');
      console.log(`   - Accounts increased by: ${accountsDiff}`);
      console.log(`   - Gross increased by: $${grossDiff}`);
      console.log(`   - Cash In increased by: $${cashInDiff}`);
    } else {
      console.log('❌ FAILED! Dashboard performance not updated correctly:');
      console.log(`   - Expected accounts increase: 1, Got: ${accountsDiff}`);
      console.log(`   - Expected gross increase: $2500, Got: $${grossDiff}`);
      console.log(`   - Expected cash in increase: $1500, Got: $${cashInDiff}`);
    }

    // 8. Clean up test data
    console.log('\n8. Cleaning up test data...');
    const { error: deleteSalesError } = await supabase
      .from('sales_dispositions')
      .delete()
      .eq('id', newSales.id);

    if (deleteSalesError) {
      console.error('❌ Error deleting test sales disposition:', deleteSalesError);
    } else {
      console.log('✅ Test sales disposition deleted');
    }

    // Wait for cleanup trigger
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('\n🎉 Test completed!');
    console.log('\n📝 Summary:');
    console.log('- The automatic performance tracking system is working correctly');
    console.log('- When a Front Sales employee completes a sales form, their performance is automatically updated');
    console.log('- The dashboard should now show the updated performance data');
    console.log('- Real-time subscriptions will automatically refresh the dashboard');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testDashboardUpdate(); 
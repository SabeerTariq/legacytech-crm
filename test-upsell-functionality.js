const { createClient } = require('@supabase/supabase-js');

// Test the upsell functionality
async function testUpsellFunctionality() {
  console.log('Testing Upsell Functionality...\n');

  // Test 1: Check if services table has the new columns
  console.log('1. Checking services table structure...');
  const { data: services, error: servicesError } = await supabase
    .from('services')
    .select('name, service_type, billing_frequency, category, price')
    .limit(5);

  if (servicesError) {
    console.error('❌ Error fetching services:', servicesError);
  } else {
    console.log('✅ Services table structure is correct');
    console.log('Sample services:', services);
  }

  // Test 2: Check if sales_dispositions table has upsell columns
  console.log('\n2. Checking sales_dispositions table structure...');
  const { data: salesDispositions, error: salesError } = await supabase
    .from('sales_dispositions')
    .select('customer_name, is_upsell, original_sales_disposition_id, service_types')
    .limit(3);

  if (salesError) {
    console.error('❌ Error fetching sales dispositions:', salesError);
  } else {
    console.log('✅ Sales dispositions table structure is correct');
    console.log('Sample sales dispositions:', salesDispositions);
  }

  // Test 3: Check if recurring_services table exists
  console.log('\n3. Checking recurring_services table...');
  const { data: recurringServices, error: recurringError } = await supabase
    .from('recurring_services')
    .select('*')
    .limit(3);

  if (recurringError) {
    console.error('❌ Error fetching recurring services:', recurringError);
  } else {
    console.log('✅ Recurring services table exists');
    console.log('Sample recurring services:', recurringServices);
  }

  // Test 4: Check if projects table has upsell columns
  console.log('\n4. Checking projects table structure...');
  const { data: projects, error: projectsError } = await supabase
    .from('projects')
    .select('name, is_upsell, parent_project_id')
    .limit(3);

  if (projectsError) {
    console.error('❌ Error fetching projects:', projectsError);
  } else {
    console.log('✅ Projects table structure is correct');
    console.log('Sample projects:', projects);
  }

  console.log('\n🎉 Upsell functionality test completed!');
}

// Run the test
testUpsellFunctionality().catch(console.error); 
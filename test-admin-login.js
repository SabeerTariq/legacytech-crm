const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'https://your-project.supabase.co'; // Replace with your actual URL
const supabaseKey = 'your-anon-key'; // Replace with your actual anon key
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminLogin() {
  try {
    console.log('Testing admin login...');
    
    // Test login with admin credentials
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@logicworks.com',
      password: 'your-admin-password' // Replace with actual password
    });

    if (error) {
      console.error('Login error:', error);
      return;
    }

    console.log('Login successful:', data.user.email);
    
    // Test fetching sales dispositions
    const { data: salesData, error: salesError } = await supabase
      .from('sales_dispositions')
      .select('*')
      .limit(5);

    if (salesError) {
      console.error('Sales data fetch error:', salesError);
      return;
    }

    console.log('Sales data fetched successfully:', salesData.length, 'records');
    console.log('Sample record:', salesData[0]);

    // Test fetching leads
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('*')
      .limit(5);

    if (leadsError) {
      console.error('Leads data fetch error:', leadsError);
      return;
    }

    console.log('Leads data fetched successfully:', leadsData.length, 'records');

    console.log('All tests passed! Admin access is working correctly.');

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testAdminLogin(); 
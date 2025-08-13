const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testUpsellerDashboard() {
  try {
    console.log('🧪 Testing Upseller Dashboard...');

    // 1. Check if projects table has the required fields
    console.log('\n📋 Checking projects table structure...');
    const { data: projectsStructure, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .limit(1);

    if (projectsError) {
      console.error('❌ Error checking projects table:', projectsError);
    } else {
      console.log('✅ Projects table accessible');
      console.log('📊 Sample project data:', projectsStructure);
    }

    // 2. Check if upseller_targets table exists
    console.log('\n🎯 Checking upseller_targets table...');
    const { data: targetsData, error: targetsError } = await supabase
      .from('upseller_targets')
      .select('*')
      .limit(1);

    if (targetsError) {
      console.error('❌ Error checking upseller_targets table:', targetsError);
    } else {
      console.log('✅ Upseller targets table accessible');
      console.log('📊 Sample targets data:', targetsData);
    }

    // 3. Check if upseller_performance table exists
    console.log('\n📊 Checking upseller_performance table...');
    const { data: performanceData, error: performanceError } = await supabase
      .from('upseller_performance')
      .select('*')
      .limit(1);

    if (performanceError) {
      console.error('❌ Error checking upseller_performance table:', performanceError);
    } else {
      console.log('✅ Upseller performance table accessible');
      console.log('📊 Sample performance data:', performanceData);
    }

    // 4. Check if the get_upseller_team_performance_summary function exists
    console.log('\n👥 Checking team performance function...');
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7) + '-01';
    
    try {
      const { data: teamData, error: teamError } = await supabase
        .rpc('get_upseller_team_performance_summary', { p_month: currentMonth });

      if (teamError) {
        console.error('❌ Error calling team performance function:', teamError);
      } else {
        console.log('✅ Team performance function working');
        console.log('📊 Team data:', teamData);
      }
    } catch (error) {
      console.error('❌ Function not found or error:', error.message);
    }

    console.log('\n✅ Upseller Dashboard test completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUpsellerDashboard();

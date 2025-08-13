import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function testTargetFetch() {
  console.log('🧪 Testing target and performance fetch with correct IDs...\n');

  try {
    // Test with the auth user ID that actually has performance data
    const testAuthUserId = '52e63558-b2ae-4661-97c7-47ca56a1cf7b'; // This user has performance data
    const currentMonth = new Date();
    const currentYear = currentMonth.getUTCFullYear();
    const currentMonthNum = currentMonth.getUTCMonth();
    const monthStart = new Date(Date.UTC(currentYear, currentMonthNum, 1));
    const monthDate = monthStart.toISOString().split('T')[0];

    console.log('📅 Test parameters:');
    console.log(`  - Auth User ID: ${testAuthUserId}`);
    console.log(`  - Month Date: ${monthDate}`);
    console.log(`  - Current Date: ${currentMonth.toISOString()}`);

    // Test performance fetch with auth user ID
    console.log('\n📊 Testing performance fetch with auth user ID...');
    const { data: performanceData, error: performanceError } = await supabase
      .from('front_seller_performance')
      .select('*')
      .eq('seller_id', testAuthUserId)
      .eq('month', monthDate)
      .single();

    if (performanceError) {
      console.log('❌ Performance fetch error:', performanceError);
    } else {
      console.log('✅ Performance fetch successful:', performanceData);
    }

    // Check if there are any performance records for this employee
    console.log('\n🔍 Checking for any performance records...');
    const { data: allPerformance, error: allPerformanceError } = await supabase
      .from('front_seller_performance')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (allPerformanceError) {
      console.log('❌ Error fetching all performance:', allPerformanceError);
    } else {
      console.log('📊 All performance records:', allPerformance);
    }

    // Check what user profile this auth user ID corresponds to
    console.log('\n👤 Checking user profile for auth user ID...');
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testAuthUserId)
      .single();

    if (profileError) {
      console.log('❌ Error finding user profile:', profileError);
    } else {
      console.log('✅ Found user profile:', userProfile);
    }

  } catch (error) {
    console.error('Error in testTargetFetch:', error);
  }
}

testTargetFetch(); 
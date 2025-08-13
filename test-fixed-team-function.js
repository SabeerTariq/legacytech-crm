import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function testFixedTeamFunction() {
  console.log('🧪 Testing Fixed Team Performance Function...\n');

  try {
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7) + '-01';
    console.log(`📅 Testing with month: ${currentMonth}`);

    // Test the fixed function
    console.log('📊 Testing get_team_performance_summary function:');
    const { data: teamPerformance, error: functionError } = await supabase
      .rpc('get_team_performance_summary', { p_month: currentMonth });

    if (functionError) {
      console.log('❌ Function error:', functionError);
    } else {
      console.log(`✅ Function returned ${teamPerformance?.length || 0} team performance records:`);
      teamPerformance?.forEach((perf, index) => {
        console.log(`  ${index + 1}. Seller ID: ${perf.seller_id}`);
        console.log(`     Seller Name: ${perf.seller_name}`);
        console.log(`     Accounts: ${perf.accounts_achieved}`);
        console.log(`     Gross: $${perf.total_gross}`);
        console.log(`     Rank: ${perf.performance_rank}`);
        console.log('');
      });
    }

    // Check if Shahbaz Khan appears in the results
    console.log('🔍 Checking if Shahbaz Khan appears in results:');
    const shahbazAuthUserId = '52e63558-b2ae-4661-97c7-47ca56a1cf7b';
    const shahbazInResults = teamPerformance?.find(perf => perf.seller_id === shahbazAuthUserId);
    
    if (shahbazInResults) {
      console.log(`✅ Shahbaz Khan found: ${shahbazInResults.seller_name}`);
      console.log(`   Accounts: ${shahbazInResults.accounts_achieved}, Gross: $${shahbazInResults.total_gross}`);
    } else {
      console.log('❌ Shahbaz Khan not found in results');
    }

    // Check if Ali Logicworks appears in the results
    console.log('\n🔍 Checking if Ali Logicworks appears in results:');
    const aliAuthUserId = 'de514a73-4782-439e-b2ea-3f49fe568e24';
    const aliInResults = teamPerformance?.find(perf => perf.seller_id === aliAuthUserId);
    
    if (aliInResults) {
      console.log(`✅ Ali Logicworks found: ${aliInResults.seller_name}`);
      console.log(`   Accounts: ${aliInResults.accounts_achieved}, Gross: $${aliInResults.total_gross}`);
    } else {
      console.log('❌ Ali Logicworks not found in results');
    }

    // Show the mapping that should work
    console.log('\n🔗 Expected Mapping:');
    console.log('  - Shahbaz Khan:');
    console.log(`    Auth User ID: ${shahbazAuthUserId}`);
    console.log('    Email: shahbaz.khan@logicworks.com');
    console.log('    Employee ID: c03345a8-e1dc-424e-b835-f4b1002ee8af');
    console.log('    Team: Team Alpha');
    console.log('');
    console.log('  - Ali Logicworks:');
    console.log(`    Auth User ID: ${aliAuthUserId}`);
    console.log('    Email: ali@logicworks.ai');
    console.log('    Employee ID: 6befe951-bdab-45d0-9925-2281272f8ce2');
    console.log('    Team: Team Alpha');

  } catch (error) {
    console.error('Error in testFixedTeamFunction:', error);
  }
}

testFixedTeamFunction(); 
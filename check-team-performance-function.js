import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function checkTeamPerformanceFunction() {
  console.log('🔍 Checking Team Performance Function...\n');

  try {
    // Check if the function exists and what it returns
    console.log('📊 Testing get_team_performance_summary function:');
    
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7) + '-01';
    console.log(`  - Testing with month: ${currentMonth}`);

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

    // Check team members vs performance data
    console.log('🔍 Comparing Team Members vs Performance Data:');
    
    // Get all team members
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select(`
        *,
        teams!inner(name, department),
        employees!inner(full_name, email)
      `)
      .eq('teams.department', 'Front Sales');

    if (membersError) {
      console.log('❌ Error fetching team members:', membersError);
    } else {
      console.log(`  - Total team members: ${teamMembers.length}`);
      
      // Get all performance data for current month
      const { data: performanceData, error: perfError } = await supabase
        .from('front_seller_performance')
        .select('*')
        .eq('month', currentMonth);

      if (perfError) {
        console.log('❌ Error fetching performance data:', perfError);
      } else {
        console.log(`  - Total performance records: ${performanceData?.length || 0}`);
      }

      // Check which team members have performance data
      console.log('\n📊 Team Members with Performance Data:');
      teamMembers.forEach(member => {
        const hasPerformance = performanceData?.some(perf => perf.seller_id === member.member_id);
        const performanceRecord = performanceData?.find(perf => perf.seller_id === member.member_id);
        
        console.log(`  - ${member.employees.full_name} (${member.employees.email})`);
        console.log(`    Team: ${member.teams.name}`);
        console.log(`    Member ID: ${member.member_id}`);
        console.log(`    Has Performance: ${hasPerformance ? '✅' : '❌'}`);
        if (performanceRecord) {
          console.log(`    Performance: ${performanceRecord.accounts_achieved} accounts, $${performanceRecord.total_gross} gross`);
        }
        console.log('');
      });
    }

    // Check specific user (Shahbaz Khan)
    console.log('🔍 Checking Shahbaz Khan specifically:');
    const shahbazMemberId = 'c03345a8-e1dc-424e-b835-f4b1002ee8af';
    
    // Check if he's in any team
    const shahbazTeamMembership = teamMembers?.find(member => member.member_id === shahbazMemberId);
    if (shahbazTeamMembership) {
      console.log(`  - Team: ${shahbazTeamMembership.teams.name}`);
      console.log(`  - Role: ${shahbazTeamMembership.role}`);
    } else {
      console.log('  - Not found in team_members table');
    }

    // Check if he has performance data
    const shahbazPerformance = performanceData?.find(perf => perf.seller_id === shahbazMemberId);
    if (shahbazPerformance) {
      console.log(`  - Performance: ${shahbazPerformance.accounts_achieved} accounts, $${shahbazPerformance.total_gross} gross`);
    } else {
      console.log('  - No performance data found');
    }

    // Check if he appears in team performance function result
    const shahbazInTeamPerf = teamPerformance?.find(perf => perf.seller_id === shahbazMemberId);
    if (shahbazInTeamPerf) {
      console.log(`  - In team performance: ${shahbazInTeamPerf.seller_name}`);
    } else {
      console.log('  - Not found in team performance function result');
    }

  } catch (error) {
    console.error('Error in checkTeamPerformanceFunction:', error);
  }
}

checkTeamPerformanceFunction(); 
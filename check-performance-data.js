import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function checkPerformanceData() {
  console.log('🔍 Checking Performance Data...\n');

  try {
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7) + '-01';
    console.log(`📅 Checking performance for month: ${currentMonth}`);

    // Get all performance data
    console.log('\n📊 All Performance Data:');
    const { data: allPerformance, error: perfError } = await supabase
      .from('front_seller_performance')
      .select('*')
      .order('created_at', { ascending: false });

    if (perfError) {
      console.log('❌ Error fetching performance data:', perfError);
    } else {
      console.log(`  - Total performance records: ${allPerformance?.length || 0}`);
      allPerformance?.forEach((perf, index) => {
        console.log(`  ${index + 1}. Seller ID: ${perf.seller_id}`);
        console.log(`     Month: ${perf.month}`);
        console.log(`     Accounts: ${perf.accounts_achieved}`);
        console.log(`     Gross: $${perf.total_gross}`);
        console.log(`     Cash In: $${perf.total_cash_in}`);
        console.log(`     Created: ${perf.created_at}`);
        console.log('');
      });
    }

    // Get current month performance
    console.log('\n📊 Current Month Performance:');
    const { data: currentMonthPerf, error: currentPerfError } = await supabase
      .from('front_seller_performance')
      .select('*')
      .eq('month', currentMonth);

    if (currentPerfError) {
      console.log('❌ Error fetching current month performance:', currentPerfError);
    } else {
      console.log(`  - Current month performance records: ${currentMonthPerf?.length || 0}`);
      currentMonthPerf?.forEach((perf, index) => {
        console.log(`  ${index + 1}. Seller ID: ${perf.seller_id}`);
        console.log(`     Accounts: ${perf.accounts_achieved}`);
        console.log(`     Gross: $${perf.total_gross}`);
        console.log('');
      });
    }

    // Check what user profiles exist for these seller_ids
    console.log('\n👥 User Profiles for Performance Data:');
    const sellerIds = allPerformance?.map(perf => perf.seller_id).filter(Boolean) || [];
    const uniqueSellerIds = [...new Set(sellerIds)];
    
    console.log(`  - Unique seller IDs in performance data: ${uniqueSellerIds.length}`);
    uniqueSellerIds.forEach(sellerId => {
      console.log(`    - ${sellerId}`);
    });

    // Check user profiles for these seller IDs
    for (const sellerId of uniqueSellerIds) {
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', sellerId)
        .single();

      if (profileError) {
        console.log(`    ❌ No user profile found for ${sellerId}`);
      } else {
        console.log(`    ✅ User profile for ${sellerId}: ${userProfile.email}`);
      }
    }

    // Check employees for these seller IDs
    console.log('\n👥 Employees for Performance Data:');
    for (const sellerId of uniqueSellerIds) {
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('*')
        .eq('id', sellerId)
        .single();

      if (employeeError) {
        console.log(`    ❌ No employee found for ${sellerId}`);
      } else {
        console.log(`    ✅ Employee for ${sellerId}: ${employee.full_name} (${employee.email})`);
      }
    }

    // Check if any of these seller IDs are in team_members
    console.log('\n👥 Team Membership Check:');
    for (const sellerId of uniqueSellerIds) {
      const { data: teamMember, error: teamError } = await supabase
        .from('team_members')
        .select(`
          *,
          teams!inner(name),
          employees!inner(full_name, email)
        `)
        .eq('member_id', sellerId)
        .single();

      if (teamError) {
        console.log(`    ❌ Not in team_members: ${sellerId}`);
      } else {
        console.log(`    ✅ Team member: ${teamMember.employees.full_name} in team "${teamMember.teams.name}"`);
      }
    }

  } catch (error) {
    console.error('Error in checkPerformanceData:', error);
  }
}

checkPerformanceData(); 
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function traceUserIdFlow() {
  console.log('🔍 Tracing User ID Flow...\n');

  try {
    // Test with a specific user to trace the flow
    const testEmail = 'ali@logicworks.ai';
    const testUserId = 'de514a73-4782-439e-b2ea-3f49fe568e24';

    console.log('📋 Step 1: Employee Creation');
    console.log('When an employee is added to the system:');
    console.log('  - Employee gets a UUID in employees.id');
    console.log('  - This is the PRIMARY KEY for the employee record');
    console.log('  - Example: ali@logicworks.ai employee ID:', '6befe951-bdab-45d0-9925-2281272f8ce2');

    // Check employee record
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (employeeError) {
      console.log('❌ Employee not found:', employeeError);
    } else {
      console.log('✅ Employee Record:');
      console.log(`  - Employee ID: ${employee.id}`);
      console.log(`  - Email: ${employee.email}`);
      console.log(`  - Department: ${employee.department}`);
      console.log(`  - Job Title: ${employee.job_title}`);
    }

    console.log('\n📋 Step 2: User Management (Auth User Creation)');
    console.log('When employee becomes a user through user management:');
    console.log('  - A new auth user is created in Supabase Auth');
    console.log('  - This generates a NEW UUID for the auth user');
    console.log('  - A user_profile record is created linking auth user to employee');
    console.log('  - Example: ali@logicworks.ai auth user ID:', testUserId);

    // Check user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', testEmail)
      .single();

    if (profileError) {
      console.log('❌ User profile not found:', profileError);
    } else {
      console.log('✅ User Profile Record:');
      console.log(`  - Profile ID: ${userProfile.id}`);
      console.log(`  - Auth User ID: ${userProfile.user_id}`);
      console.log(`  - Email: ${userProfile.email}`);
      console.log(`  - Employee ID: ${userProfile.employee_id}`);
    }

    console.log('\n📋 Step 3: Performance Tracking');
    console.log('When tracking performance and restricting access:');
    console.log('  - Sales dispositions use: user_id (Auth User ID)');
    console.log('  - Performance data uses: seller_id (Auth User ID)');
    console.log('  - Targets use: seller_id (Employee ID)');
    console.log('  - Dashboard filtering uses: user.id (Auth User ID)');

    // Check sales dispositions
    console.log('\n📊 Sales Dispositions (using Auth User ID):');
    const { data: sales, error: salesError } = await supabase
      .from('sales_dispositions')
      .select('user_id, customer_name, gross_value')
      .eq('user_id', testUserId)
      .limit(3);

    if (salesError) {
      console.log('❌ Error fetching sales:', salesError);
    } else {
      console.log(`  - Found ${sales.length} sales using auth user ID: ${testUserId}`);
      sales.forEach(sale => {
        console.log(`    - ${sale.customer_name}: $${sale.gross_value}`);
      });
    }

    // Check performance data
    console.log('\n📊 Performance Data (using Auth User ID):');
    const { data: performance, error: perfError } = await supabase
      .from('front_seller_performance')
      .select('seller_id, month, accounts_achieved, total_gross')
      .eq('seller_id', testUserId);

    if (perfError) {
      console.log('❌ Error fetching performance:', perfError);
    } else {
      console.log(`  - Found ${performance.length} performance records using auth user ID: ${testUserId}`);
      performance.forEach(perf => {
        console.log(`    - Month: ${perf.month}, Accounts: ${perf.accounts_achieved}, Gross: $${perf.total_gross}`);
      });
    }

    // Check targets
    console.log('\n🎯 Targets (using Employee ID):');
    const { data: targets, error: targetError } = await supabase
      .from('front_seller_targets')
      .select('seller_id, month, target_accounts')
      .eq('seller_id', employee?.id);

    if (targetError) {
      console.log('❌ Error fetching targets:', targetError);
    } else {
      console.log(`  - Found ${targets.length} targets using employee ID: ${employee?.id}`);
      targets.forEach(target => {
        console.log(`    - Month: ${target.month}, Target: ${target.target_accounts} accounts`);
      });
    }

    console.log('\n📋 Step 4: Dashboard Access Control');
    console.log('In the Front Sales Dashboard:');
    console.log('  - AuthContext provides: user.id (Auth User ID)');
    console.log('  - AuthContext also provides: user.employee.id (Employee ID)');
    console.log('  - Performance queries use: user.id (Auth User ID)');
    console.log('  - Target queries use: user.employee.id (Employee ID)');

    // Simulate dashboard access
    console.log('\n🔐 Dashboard Access Simulation:');
    console.log(`  - Current Auth User ID: ${testUserId}`);
    console.log(`  - Current Employee ID: ${employee?.id}`);
    console.log(`  - User Email: ${testEmail}`);
    console.log(`  - Department: ${employee?.department}`);

    if (employee?.department === 'Front Sales') {
      console.log('  ✅ User has Front Sales access');
      console.log('  ✅ Can view performance data');
      console.log('  ✅ Can view target data');
    } else {
      console.log('  ❌ User does not have Front Sales access');
    }

    console.log('\n📋 Summary of ID Usage:');
    console.log('1. Employee Creation: employees.id (UUID)');
    console.log('2. User Management: user_profiles.user_id (Auth UUID)');
    console.log('3. Sales Dispositions: user_id (Auth UUID)');
    console.log('4. Performance Data: seller_id (Auth UUID)');
    console.log('5. Target Data: seller_id (Employee UUID)');
    console.log('6. Dashboard Access: user.id (Auth UUID) + user.employee.id (Employee UUID)');

    console.log('\n🔑 Key IDs for ali@logicworks.ai:');
    console.log(`  - Employee ID: ${employee?.id}`);
    console.log(`  - Auth User ID: ${testUserId}`);
    console.log(`  - Profile ID: ${userProfile?.id}`);

  } catch (error) {
    console.error('Error in traceUserIdFlow:', error);
  }
}

traceUserIdFlow(); 
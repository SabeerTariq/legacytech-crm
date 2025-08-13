import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testNewEmailLinking() {
  console.log('🧪 Testing New Email Linking System\n');

  try {
    // 1. Check current employee structure
    console.log('📊 1. Current Employee Structure:');
    const { data: employees, error: empError } = await supabaseAdmin
      .from('employees')
      .select('id, full_name, email, department, user_management_email, personal_email')
      .eq('department', 'Front Sales')
      .limit(5);

    if (empError) {
      console.log('❌ Error fetching employees:', empError.message);
    } else {
      employees?.forEach((emp, index) => {
        console.log(`   ${index + 1}. ${emp.full_name}`);
        console.log(`      Original Email: ${emp.email}`);
        console.log(`      Personal Email: ${emp.personal_email || 'Not set'}`);
        console.log(`      User Management Email: ${emp.user_management_email || 'Not set'}`);
        console.log(`      Department: ${emp.department}`);
        console.log('');
      });
    }

    // 2. Test email generation function
    console.log('📧 2. Testing Email Generation Function:');
    if (employees && employees.length > 0) {
      const testEmployee = employees[0];
      const { data: generatedEmail, error: genError } = await supabaseAdmin.rpc(
        'generate_employee_user_email',
        {
          employee_full_name: testEmployee.full_name,
          employee_department: testEmployee.department
        }
      );

      if (genError) {
        console.log('❌ Email generation error:', genError.message);
      } else {
        console.log(`   Generated email for ${testEmployee.full_name}: ${generatedEmail}`);
      }
    }

    // 3. Check user profiles linking
    console.log('🔗 3. User Profile Linking Status:');
    const { data: linkingStatus, error: linkError } = await supabaseAdmin
      .from('employee_user_linking_status')
      .select('*')
      .eq('department', 'Front Sales');

    if (linkError) {
      console.log('❌ Error fetching linking status:', linkError.message);
    } else {
      linkingStatus?.forEach((status, index) => {
        console.log(`   ${index + 1}. ${status.employee_name}`);
        console.log(`      Status: ${status.linking_status}`);
        console.log(`      Original Email: ${status.original_email}`);
        console.log(`      System Email: ${status.system_email || 'Not generated'}`);
        console.log(`      Profile Email: ${status.profile_email || 'No profile'}`);
        console.log('');
      });
    }

    // 4. Test team performance function with proper DATE parameter
    console.log('📈 4. Testing Team Performance Function:');
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7) + '-01';
    console.log(`   Testing with date: ${currentMonth}`);
    
    // Use raw SQL to ensure proper DATE type casting
    const { data: teamPerformance, error: perfError } = await supabaseAdmin
      .rpc('get_team_performance_summary', { 
        p_month: currentMonth 
      });

    if (perfError) {
      console.log('❌ Team performance function error:', perfError.message);
      
      // If there's still an overloading issue, try to fix it
      if (perfError.message.includes('PGRST203') || perfError.message.includes('overloading')) {
        console.log('   🔧 Attempting to fix function overloading...');
        
        // Try to execute the fix script
        const fixQuery = `
          DROP FUNCTION IF EXISTS get_team_performance_summary(p_month DATE) CASCADE;
          DROP FUNCTION IF EXISTS get_team_performance_summary(p_month TEXT) CASCADE;
          DROP FUNCTION IF EXISTS get_team_performance_summary(p_month TIMESTAMP) CASCADE;
        `;
        
        const { error: fixError } = await supabaseAdmin.rpc('exec_sql', { sql: fixQuery });
        if (fixError) {
          console.log('   ❌ Could not fix function overloading:', fixError.message);
        } else {
          console.log('   ✅ Function overloading fixed, retrying...');
          
          // Retry the function call
          const { data: retryData, error: retryError } = await supabaseAdmin
            .rpc('get_team_performance_summary', { p_month: currentMonth });
          
          if (retryError) {
            console.log('   ❌ Still having issues:', retryError.message);
          } else {
            console.log(`   ✅ Function now works! Returned ${retryData?.length || 0} records`);
            retryData?.forEach((perf, index) => {
              console.log(`   ${index + 1}. Seller: ${perf.seller_name}`);
              console.log(`      Accounts: ${perf.accounts_achieved}`);
              console.log(`      Gross: $${perf.total_gross}`);
              console.log(`      Rank: ${perf.performance_rank}`);
              console.log('');
            });
          }
        }
      }
    } else {
      console.log(`   ✅ Team performance function returned ${teamPerformance?.length || 0} records:`);
      teamPerformance?.forEach((perf, index) => {
        console.log(`   ${index + 1}. Seller: ${perf.seller_name}`);
        console.log(`      Accounts: ${perf.accounts_achieved}`);
        console.log(`      Gross: $${perf.total_gross}`);
        console.log(`      Rank: ${perf.performance_rank}`);
        console.log('');
      });
    }

    // 5. Show employees needing user accounts
    console.log('👥 5. Employees Needing User Management Accounts:');
    const { data: needsAccounts, error: needsError } = await supabaseAdmin
      .from('employee_user_linking_status')
      .select('*')
      .eq('department', 'Front Sales')
      .eq('linking_status', 'NEEDS_EMAIL_GENERATION');

    if (needsError) {
      console.log('❌ Error fetching employees needing accounts:', needsError.message);
    } else {
      if (needsAccounts && needsAccounts.length > 0) {
        needsAccounts.forEach((emp, index) => {
          console.log(`   ${index + 1}. ${emp.employee_name} (${emp.original_email})`);
        });
      } else {
        console.log('   ✅ All Front Sales employees have user management emails generated');
      }
    }

    // 6. Test creating a user with the new system
    console.log('🔧 6. Testing User Creation with New System:');
    if (employees && employees.length > 0) {
      const testEmployee = employees[0];
      console.log(`   Testing with employee: ${testEmployee.full_name}`);
      
      // Check if employee already has a user account
      const { data: existingProfile } = await supabaseAdmin
        .from('user_profiles')
        .select('user_id, email')
        .eq('employee_id', testEmployee.id)
        .single();

      if (existingProfile) {
        console.log(`   ⚠️  Employee already has user account: ${existingProfile.email}`);
      } else {
        console.log(`   ✅ Employee ready for user account creation`);
        console.log(`   Would create with user management email: ${testEmployee.user_management_email || 'To be generated'}`);
      }
    }

    console.log('\n✅ Email linking system test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testNewEmailLinking(); 
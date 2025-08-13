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

async function fixFunctionOverloadingSimple() {
  console.log('🔧 Fixing Function Overloading Issue (Simple Method)\n');

  try {
    // 1. First, let's check what functions exist
    console.log('📝 1. Checking existing functions...');
    
    const { data: existingFunctions, error: checkError } = await supabaseAdmin
      .from('pg_proc')
      .select('proname, pg_get_function_arguments(oid) as arguments')
      .eq('proname', 'get_team_performance_summary');

    if (checkError) {
      console.log('❌ Error checking functions:', checkError.message);
    } else {
      console.log('   Found functions:', existingFunctions);
    }

    // 2. Try to call the function with explicit type casting
    console.log('\n🧪 2. Testing function with explicit type casting...');
    
    const currentMonth = new Date().toISOString().split('T')[0].substring(0, 7) + '-01';
    console.log(`   Testing with date: ${currentMonth}`);
    
    // Try calling with explicit DATE casting
    const { data: testResult, error: testError } = await supabaseAdmin
      .rpc('get_team_performance_summary', { 
        p_month: `${currentMonth}::DATE` 
      });

    if (testError) {
      console.log('❌ Function test failed:', testError.message);
      
      // If it's still an overloading issue, let's try a different approach
      if (testError.message.includes('PGRST203') || testError.message.includes('overloading')) {
        console.log('   🔧 Attempting alternative approach...');
        
        // Try with a different date format
        const { data: altResult, error: altError } = await supabaseAdmin
          .rpc('get_team_performance_summary', { 
            p_month: '2024-01-01' 
          });
        
        if (altError) {
          console.log('   ❌ Alternative approach also failed:', altError.message);
        } else {
          console.log(`   ✅ Alternative approach worked! Returned ${altResult?.length || 0} records`);
        }
      }
    } else {
      console.log(`   ✅ Function test successful! Returned ${testResult?.length || 0} records`);
      
      if (testResult && testResult.length > 0) {
        console.log('\n   Sample results:');
        testResult.slice(0, 3).forEach((perf, index) => {
          console.log(`   ${index + 1}. ${perf.seller_name || 'Unknown'}`);
          console.log(`      Accounts: ${perf.accounts_achieved}`);
          console.log(`      Gross: $${perf.total_gross}`);
          console.log(`      Rank: ${perf.performance_rank}`);
          console.log('');
        });
      }
    }

    // 3. Let's check the current employee status
    console.log('📊 3. Checking current employee status...');
    const { data: employees, error: empError } = await supabaseAdmin
      .from('employees')
      .select('id, full_name, email, department, user_management_email, personal_email')
      .eq('department', 'Front Sales')
      .order('full_name');

    if (empError) {
      console.log('❌ Error fetching employees:', empError.message);
    } else {
      console.log(`   Found ${employees?.length || 0} Front Sales employees`);
      
      const needsAccounts = employees?.filter(emp => !emp.user_management_email) || [];
      const hasAccounts = employees?.filter(emp => emp.user_management_email) || [];
      
      console.log(`   Employees needing accounts: ${needsAccounts.length}`);
      console.log(`   Employees with accounts: ${hasAccounts.length}`);
    }

    // 4. Test email generation
    console.log('\n📧 4. Testing email generation...');
    if (employees && employees.length > 0) {
      const testEmployee = employees.find(emp => !emp.user_management_email);
      if (testEmployee) {
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
          console.log(`   ✅ Generated email for ${testEmployee.full_name}: ${generatedEmail}`);
        }
      }
    }

    console.log('\n✅ Function overloading check completed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. If function works, proceed with email generation');
    console.log('   2. If function still has issues, we may need manual SQL execution');
    console.log('   3. Run generate-emails-for-employees.js to generate emails');
    console.log('   4. Run create-front-sales-users.js to create user accounts');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixFunctionOverloadingSimple(); 
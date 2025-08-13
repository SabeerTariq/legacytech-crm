import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function checkEmployeeMapping() {
  console.log('🔍 Checking employee mapping for ali@logicworks.ai...\n');

  try {
    const currentUserId = 'de514a73-4782-439e-b2ea-3f49fe568e24'; // ali@logicworks.ai
    const userEmail = 'ali@logicworks.ai';

    // Check if employee record exists for ali@logicworks.ai
    console.log('👤 Checking employee record...');
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('*')
      .eq('email', userEmail)
      .single();

    if (employeeError) {
      console.log('❌ Employee record not found:', employeeError);
      
      // Check if there's an employee with similar email
      console.log('\n🔍 Checking for similar email patterns...');
      const { data: similarEmployees, error: similarError } = await supabase
        .from('employees')
        .select('*')
        .ilike('email', '%ali%');

      if (similarError) {
        console.log('❌ Error checking similar employees:', similarError);
      } else {
        console.log('Similar employees found:');
        similarEmployees.forEach(emp => {
          console.log(`  - ID: ${emp.id}, Email: ${emp.email}, Department: ${emp.department}`);
        });
      }

      // Create an employee record for ali@logicworks.ai
      console.log('\n📝 Creating employee record for ali@logicworks.ai...');
      const { data: newEmployee, error: createError } = await supabase
        .from('employees')
        .insert({
          email: userEmail,
          first_name: 'Ali',
          last_name: 'Logicworks',
          department: 'Front Sales',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) {
        console.log('❌ Error creating employee record:', createError);
      } else {
        console.log('✅ Employee record created:', newEmployee);
      }

    } else {
      console.log('✅ Employee record found:', employee);
    }

    // Test the trigger function logic manually
    console.log('\n🧪 Testing trigger function logic...');
    
    // Simulate what the trigger function does
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', currentUserId)
      .single();

    if (profileError) {
      console.log('❌ Error fetching user profile:', profileError);
    } else {
      console.log('✅ User profile found:', userProfile);
      
      // Check if employee exists for this email
      const { data: employeeForEmail, error: employeeForEmailError } = await supabase
        .from('employees')
        .select('*')
        .eq('email', userProfile.email)
        .single();

      if (employeeForEmailError) {
        console.log('❌ Employee not found for email:', userProfile.email);
        console.log('This is why the trigger function fails!');
      } else {
        console.log('✅ Employee found for email:', employeeForEmail);
        console.log('Department:', employeeForEmail.department);
        
        if (employeeForEmail.department === 'Front Sales') {
          console.log('✅ User is Front Sales - trigger should work!');
        } else {
          console.log('❌ User is not Front Sales - trigger will skip');
        }
      }
    }

    // Check if there are any sales dispositions for this user
    console.log('\n📊 Checking sales dispositions...');
    const { data: sales, error: salesError } = await supabase
      .from('sales_dispositions')
      .select('*')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (salesError) {
      console.log('❌ Error fetching sales:', salesError);
    } else {
      console.log(`📈 Sales dispositions found: ${sales.length}`);
      sales.forEach(sale => {
        console.log(`  - ${sale.customer_name}: $${sale.gross_value} (${sale.created_at})`);
      });
    }

    // Check if performance data exists
    console.log('\n📊 Checking performance data...');
    const { data: performance, error: performanceError } = await supabase
      .from('front_seller_performance')
      .select('*')
      .eq('seller_id', currentUserId);

    if (performanceError) {
      console.log('❌ Error checking performance:', performanceError);
    } else {
      console.log(`📈 Performance records found: ${performance.length}`);
      performance.forEach(perf => {
        console.log(`  - Month: ${perf.month}, Accounts: ${perf.accounts_achieved}, Gross: ${perf.total_gross}`);
      });
    }

  } catch (error) {
    console.error('Error in checkEmployeeMapping:', error);
  }
}

checkEmployeeMapping(); 
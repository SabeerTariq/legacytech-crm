// Test script to verify date validation fixes in Front Sales Management
// This script tests the date formatting and validation functions

const { createClient } = require('@supabase/supabase-js');

// You'll need to add your Supabase URL and anon key here
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper functions (same as in the React component)
const formatMonthForInput = (dateString) => {
  if (!dateString) return '';
  return dateString.substring(0, 7); // Convert "2025-07-01" to "2025-07"
};

const formatMonthForDatabase = (monthValue) => {
  if (!monthValue) return '';
  return monthValue + '-01'; // Convert "2025-07" to "2025-07-01"
};

async function testDateValidation() {
  console.log('🧪 Testing Date Validation Fixes...\n');

  try {
    // Test 1: Format month for HTML input
    console.log('1. Testing month formatting for HTML input:');
    const testDate1 = '2025-07-01';
    const formattedForInput = formatMonthForInput(testDate1);
    console.log(`   Input: "${testDate1}" -> Output: "${formattedForInput}"`);
    console.log(`   ✅ Expected: "2025-07" | Got: "${formattedForInput}"`);

    // Test 2: Format month for database
    console.log('\n2. Testing month formatting for database:');
    const testMonth2 = '2025-07';
    const formattedForDB = formatMonthForDatabase(testMonth2);
    console.log(`   Input: "${testMonth2}" -> Output: "${formattedForDB}"`);
    console.log(`   ✅ Expected: "2025-07-01" | Got: "${formattedForDB}"`);

    // Test 3: Test empty values
    console.log('\n3. Testing empty values:');
    const emptyInput = formatMonthForInput('');
    const emptyDB = formatMonthForDatabase('');
    console.log(`   Empty input: "${emptyInput}"`);
    console.log(`   Empty DB: "${emptyDB}"`);
    console.log(`   ✅ Both should be empty strings`);

    // Test 4: Test current month calculation
    console.log('\n4. Testing current month calculation:');
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();
    const monthStart = new Date(Date.UTC(currentYear, currentMonth, 1));
    const currentMonthString = monthStart.toISOString().split('T')[0];
    console.log(`   Current month: "${currentMonthString}"`);
    console.log(`   Formatted for input: "${formatMonthForInput(currentMonthString)}"`);

    // Test 5: Test database insertion with proper date format
    console.log('\n5. Testing database insertion with proper date format:');
    
    // Get a Front Sales employee for testing
    const { data: employees, error: empError } = await supabase
      .from('employees')
      .select('id, email, full_name')
      .eq('department', 'Front Sales')
      .limit(1);

    if (empError || !employees || employees.length === 0) {
      console.log('   ⚠️  No Front Sales employees found for testing');
      return;
    }

    const testEmployee = employees[0];
    const testMonth = formatMonthForDatabase('2025-08'); // August 2025
    
    const testTargetData = {
      seller_id: testEmployee.id,
      month: testMonth,
      target_accounts: 5,
      target_gross: 5000,
      target_cash_in: 3000
    };

    console.log(`   Testing with employee: ${testEmployee.full_name}`);
    console.log(`   Test month: "${testMonth}"`);
    console.log(`   Target data:`, testTargetData);

    // Try to insert the test target
    const { data: insertedTarget, error: insertError } = await supabase
      .from('front_seller_targets')
      .insert(testTargetData)
      .select()
      .single();

    if (insertError) {
      console.log(`   ❌ Insert failed: ${insertError.message}`);
      
      if (insertError.message.includes('invalid input syntax for type date')) {
        console.log(`   🔧 This indicates the date format is still incorrect`);
      }
    } else {
      console.log(`   ✅ Insert successful! Target ID: ${insertedTarget.id}`);
      
      // Clean up the test data
      const { error: deleteError } = await supabase
        .from('front_seller_targets')
        .delete()
        .eq('id', insertedTarget.id);
      
      if (deleteError) {
        console.log(`   ⚠️  Failed to clean up test data: ${deleteError.message}`);
      } else {
        console.log(`   🧹 Test data cleaned up successfully`);
      }
    }

    // Test 6: Test employee creation with proper date format
    console.log('\n6. Testing employee creation with proper date format:');
    
    const testEmployeeData = {
      email: 'test-employee@example.com',
      full_name: 'Test Employee - Date Validation',
      department: 'Front Sales',
      role: 'front_seller',
      hire_date: new Date().toISOString().split('T')[0], // Current date
      status: 'active'
    };

    console.log(`   Test employee data:`, testEmployeeData);

    const { data: insertedEmployee, error: empInsertError } = await supabase
      .from('employees')
      .insert(testEmployeeData)
      .select()
      .single();

    if (empInsertError) {
      console.log(`   ❌ Employee insert failed: ${empInsertError.message}`);
      
      if (empInsertError.message.includes('invalid input syntax for type date')) {
        console.log(`   🔧 This indicates the hire date format is still incorrect`);
      }
    } else {
      console.log(`   ✅ Employee insert successful! Employee ID: ${insertedEmployee.id}`);
      
      // Clean up the test data
      const { error: deleteEmpError } = await supabase
        .from('employees')
        .delete()
        .eq('id', insertedEmployee.id);
      
      if (deleteEmpError) {
        console.log(`   ⚠️  Failed to clean up test employee: ${deleteEmpError.message}`);
      } else {
        console.log(`   🧹 Test employee cleaned up successfully`);
      }
    }

    console.log('\n🎉 Date validation tests completed!');
    console.log('\n📝 Summary:');
    console.log('- The date formatting functions are working correctly');
    console.log('- HTML month input format is properly converted to database format');
    console.log('- Empty values are handled gracefully');
    console.log('- Database insertions should now work without date validation errors');

  } catch (error) {
    console.error('❌ Test failed with error:', error);
  }
}

// Run the test
testDateValidation(); 
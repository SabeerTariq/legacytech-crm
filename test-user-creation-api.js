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

async function testUserCreationAPI() {
  console.log('🧪 Testing User Creation API\n');

  try {
    // First, get an employee to test with
    const { data: employees, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('id, full_name, department, user_management_email')
      .limit(1);

    if (employeeError || !employees || employees.length === 0) {
      console.log('❌ No employees found for testing');
      return;
    }

    const testEmployee = employees[0];
    console.log(`📋 Testing with employee: ${testEmployee.full_name} (${testEmployee.id})`);

    // Test the API endpoint
    const testData = {
      employee_id: testEmployee.id,
      password: 'TestPassword123!'
    };

    console.log('📤 Sending request to API...');
    console.log('Request data:', JSON.stringify(testData, null, 2));

    const response = await fetch('http://localhost:3001/api/admin/create-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    console.log(`📥 Response status: ${response.status}`);

    if (response.ok) {
      const result = await response.json();
      console.log('✅ API call successful!');
      console.log('Response:', JSON.stringify(result, null, 2));
      
      // Verify the user was created
      const { data: userProfiles, error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .select('*')
        .eq('employee_id', testEmployee.id)
        .order('created_at', { ascending: false })
        .limit(1);

      if (profileError) {
        console.log('❌ Error checking user profile:', profileError.message);
      } else if (userProfiles && userProfiles.length > 0) {
        console.log('✅ User profile created successfully');
        console.log('Profile:', userProfiles[0]);
      } else {
        console.log('❌ No user profile found');
      }

      // Check auth users
      const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      if (authError) {
        console.log('❌ Error checking auth users:', authError.message);
      } else {
        const createdUser = authUsers?.users?.find(user => 
          user.email === result.user?.user_management_email || 
          user.email === result.user?.email
        );
        
        if (createdUser) {
          console.log('✅ Auth user created successfully');
          console.log('Auth user:', {
            id: createdUser.id,
            email: createdUser.email,
            created_at: createdUser.created_at
          });
        } else {
          console.log('❌ Auth user not found');
        }
      }

    } else {
      const errorData = await response.json();
      console.log('❌ API call failed');
      console.log('Error:', errorData);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testUserCreationAPI(); 
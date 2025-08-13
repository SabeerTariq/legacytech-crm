import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://yipyteszzyycbqgzpfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHl0ZXN6enl5Y2JxZ3pwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzE5NzQsImV4cCI6MjA1MDU0Nzk3NH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLoginFlow() {
  console.log('Testing login flow...\n');

  // Test 1: Check user profiles
  console.log('1. Checking user profiles...');
  const { data: users, error: usersError } = await supabase
    .from('user_profiles')
    .select('*')
    .limit(5);

  if (usersError) {
    console.error('Error fetching users:', usersError);
  } else {
    console.log('Users found:', users.length);
    users.forEach(user => {
      console.log(`- ${user.email} (ID: ${user.user_id})`);
    });
  }

  // Test 2: Check user roles
  console.log('\n2. Checking user roles...');
  const { data: userRoles, error: rolesError } = await supabase
    .from('user_roles')
    .select(`
      user_id,
      roles (
        id,
        name,
        display_name
      )
    `);

  if (rolesError) {
    console.error('Error fetching user roles:', rolesError);
  } else {
    console.log('User roles found:', userRoles.length);
    userRoles.forEach(ur => {
      console.log(`- User ${ur.user_id}: ${ur.roles?.name || 'No role'}`);
    });
  }

  // Test 3: Test permission function for a specific user
  console.log('\n3. Testing permission function...');
  const testUserId = '78294d98-4280-40c1-bb6d-b85b7203b370'; // adamzainnasir.fro@logicworks.com
  
  const { data: permissions, error: permError } = await supabase.rpc('get_user_permissions', {
    user_uuid: testUserId
  });

  if (permError) {
    console.error('Error fetching permissions:', permError);
  } else {
    console.log('Permissions for test user:');
    permissions.forEach(perm => {
      console.log(`- ${perm.module_name}: read=${perm.can_read}, create=${perm.can_create}`);
    });
  }

  // Test 4: Check if front_sales module is accessible
  console.log('\n4. Testing front_sales module access...');
  const frontSalesPermission = permissions?.find(p => p.module_name === 'front_sales');
  if (frontSalesPermission) {
    console.log('Front sales permission found:', frontSalesPermission.can_read);
  } else {
    console.log('Front sales permission not found');
  }

  console.log('\nTest completed!');
}

testLoginFlow().catch(console.error); 
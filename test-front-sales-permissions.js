import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yipyteszzyycbqgzpfrf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpcHl0ZXN6enl5Y2JxZ3pwZnJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE5NzE5NzAsImV4cCI6MjA0NzU0Nzk3MH0.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testFrontSalesPermissions() {
  console.log('🧪 Testing Front Sales Permissions...\n');

  try {
    // 1. Get front_sales user
    console.log('1. Getting front_sales user...');
    const { data: users, error: userError } = await supabase
      .from('user_roles')
      .select(`
        user_id,
        roles!inner(name, permissions),
        user_profiles!inner(email)
      `)
      .eq('roles.name', 'front_sales')
      .limit(1);

    if (userError) {
      console.log('❌ Error fetching user:', userError.message);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ No front_sales users found');
      return;
    }

    const user = users[0];
    console.log('✅ Found front_sales user:', user.user_profiles.email);
    console.log('   User ID:', user.user_id);
    console.log('   Role permissions:', user.roles.permissions);

    // 2. Test getUserPermissions function
    console.log('\n2. Testing getUserPermissions function...');
    const { data: permissions, error: permError } = await supabase.rpc('get_user_permissions', {
      user_uuid: user.user_id
    });

    if (permError) {
      console.log('❌ Error getting user permissions:', permError.message);
      return;
    }

    console.log('✅ User permissions from database:');
    permissions.forEach(p => {
      console.log(`   - ${p.module_name}: create=${p.can_create}, read=${p.can_read}, update=${p.can_update}, delete=${p.can_delete}, visible=${p.screen_visible}`);
    });

    // 3. Check leads permission specifically
    console.log('\n3. Checking leads permission...');
    const leadsPermission = permissions.find(p => p.module_name === 'leads');
    
    if (leadsPermission) {
      console.log('✅ Leads permission found:');
      console.log(`   - can_create: ${leadsPermission.can_create}`);
      console.log(`   - can_read: ${leadsPermission.can_read}`);
      console.log(`   - can_update: ${leadsPermission.can_update}`);
      console.log(`   - can_delete: ${leadsPermission.can_delete}`);
      console.log(`   - screen_visible: ${leadsPermission.screen_visible}`);
      
      if (leadsPermission.can_delete) {
        console.log('❌ PROBLEM: Front_sales user CAN delete leads!');
      } else {
        console.log('✅ CORRECT: Front_sales user CANNOT delete leads');
      }
    } else {
      console.log('❌ No leads permission found');
    }

    // 4. Test user_has_permission function
    console.log('\n4. Testing user_has_permission function...');
    const { data: canDelete, error: checkError } = await supabase.rpc('user_has_permission', {
      user_uuid: user.user_id,
      module_name: 'leads',
      action: 'delete'
    });

    if (checkError) {
      console.log('❌ Error checking delete permission:', checkError.message);
      return;
    }

    console.log(`✅ user_has_permission('leads', 'delete'): ${canDelete}`);
    
    if (canDelete) {
      console.log('❌ PROBLEM: Database says user CAN delete leads!');
    } else {
      console.log('✅ CORRECT: Database says user CANNOT delete leads');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFrontSalesPermissions(); 
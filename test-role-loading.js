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

async function testRoleLoading() {
  console.log('🧪 Testing Role Loading\n');

  try {
    // 1. Check if roles exist in the database
    console.log('1. Checking roles table...');
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (rolesError) {
      console.log('❌ Error fetching roles:', rolesError.message);
    } else {
      console.log('✅ Roles found:', roles.length);
      roles.forEach(role => {
        console.log(`  - ${role.display_name} (${role.id})`);
        console.log(`    Description: ${role.description}`);
        console.log(`    Active: ${role.is_active}`);
        console.log('');
      });
    }

    // 2. Check role permissions
    console.log('2. Checking role permissions...');
    const { data: rolePermissions, error: permissionsError } = await supabaseAdmin
      .from('role_permissions')
      .select(`
        *,
        roles:roles(display_name)
      `)
      .order('created_at', { ascending: false });

    if (permissionsError) {
      console.log('❌ Error fetching role permissions:', permissionsError.message);
    } else {
      console.log('✅ Role permissions found:', rolePermissions.length);
      rolePermissions.forEach(rp => {
        console.log(`  - Role: ${rp.roles?.display_name}`);
        console.log(`    Module: ${rp.module_name}`);
        console.log(`    Permissions: create=${rp.can_create}, read=${rp.can_read}, update=${rp.can_update}, delete=${rp.can_delete}, visible=${rp.screen_visible}`);
        console.log('');
      });
    }

    // 3. Test the role service function
    console.log('3. Testing role service function...');
    const { data: roleServiceData, error: roleServiceError } = await supabaseAdmin
      .from('roles')
      .select(`
        *,
        role_permissions:role_permissions(*)
      `)
      .eq('is_active', true)
      .order('display_name');

    if (roleServiceError) {
      console.log('❌ Error in role service:', roleServiceError.message);
    } else {
      console.log('✅ Role service data:');
      roleServiceData.forEach(role => {
        console.log(`  - ${role.display_name} (${role.id})`);
        console.log(`    Permissions: ${role.role_permissions?.length || 0} modules`);
        role.role_permissions?.forEach(rp => {
          console.log(`      * ${rp.module_name}: ${rp.can_read ? 'read' : ''} ${rp.can_create ? 'create' : ''} ${rp.can_update ? 'update' : ''} ${rp.can_delete ? 'delete' : ''} ${rp.screen_visible ? 'visible' : ''}`);
        });
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testRoleLoading(); 
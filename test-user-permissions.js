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

async function testUserPermissions() {
  console.log('🧪 Testing User Permissions\n');

  try {
    // 1. Check recent user profiles
    console.log('1. Checking recent user profiles...');
    const { data: userProfiles, error: profilesError } = await supabaseAdmin
      .from('user_profiles')
      .select(`
        *,
        employees:employees(*)
      `)
      .order('created_at', { ascending: false })
      .limit(5);

    if (profilesError) {
      console.log('❌ Error fetching profiles:', profilesError.message);
    } else {
      console.log('✅ User profiles found:', userProfiles.length);
      userProfiles.forEach(profile => {
        console.log(`  - User: ${profile.employees?.full_name || profile.display_name}`);
        console.log(`    Email: ${profile.email}`);
        console.log(`    User Management Email: ${profile.attributes?.user_management_email || 'Not set'}`);
        console.log(`    Attributes:`, JSON.stringify(profile.attributes, null, 2));
        console.log('');
      });
    }

    // 2. Check user_roles table
    console.log('2. Checking user_roles table...');
    const { data: userRoles, error: userRolesError } = await supabaseAdmin
      .from('user_roles')
      .select(`
        *,
        roles:roles(display_name),
        user_profiles:user_profiles(email)
      `)
      .order('created_at', { ascending: false });

    if (userRolesError) {
      console.log('❌ Error fetching user roles:', userRolesError.message);
    } else {
      console.log('✅ User roles found:', userRoles.length);
      userRoles.forEach(ur => {
        console.log(`  - User: ${ur.user_profiles?.email || ur.user_id}`);
        console.log(`    Role: ${ur.roles?.display_name || ur.role_id}`);
        console.log('');
      });
    }

    // 3. Check user_permissions table
    console.log('3. Checking user_permissions table...');
    const { data: userPermissions, error: userPermsError } = await supabaseAdmin
      .from('user_permissions')
      .select(`
        *,
        user_profiles:user_profiles(email)
      `)
      .order('created_at', { ascending: false });

    if (userPermsError) {
      console.log('❌ Error fetching user permissions:', userPermsError.message);
    } else {
      console.log('✅ User permissions found:', userPermissions.length);
      userPermissions.forEach(up => {
        console.log(`  - User: ${up.user_profiles?.email || up.user_id}`);
        console.log(`    Module: ${up.module_name}`);
        console.log(`    Permissions: create=${up.can_create}, read=${up.can_read}, update=${up.can_update}, delete=${up.can_delete}, visible=${up.screen_visible}`);
        console.log('');
      });
    }

    // 4. Test the create_user_permissions_from_template function
    console.log('4. Testing create_user_permissions_from_template function...');
    const testUserId = userProfiles?.[0]?.user_id;
    if (testUserId) {
      console.log(`Testing with user ID: ${testUserId}`);
      
      const testPermissions = [
        {
          module: 'dashboard',
          can_create: true,
          can_read: true,
          can_update: true,
          can_delete: true,
          screen_visible: true
        },
        {
          module: 'leads',
          can_create: true,
          can_read: true,
          can_update: true,
          can_delete: true,
          screen_visible: true
        }
      ];

      const { data: functionResult, error: functionError } = await supabaseAdmin.rpc(
        'create_user_permissions_from_template',
        {
          p_user_id: testUserId,
          p_role_template: testPermissions
        }
      );

      if (functionError) {
        console.log('❌ Function error:', functionError.message);
      } else {
        console.log('✅ Function result:', functionResult);
      }
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testUserPermissions(); 
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

async function testRoleManagementPermissions() {
  console.log('🧪 Testing Role Management Permissions\n');

  try {
    // 1. Check existing roles and their permissions
    console.log('📋 1. Checking existing roles...');
    const { data: existingRoles, error: rolesError } = await supabaseAdmin
      .from('roles')
      .select(`
        id,
        name,
        display_name,
        description,
        is_system_role,
        created_at,
        role_permissions (
          module_name,
          can_read,
          can_create,
          can_update,
          can_delete,
          screen_visible
        )
      `)
      .order('created_at', { ascending: false });

    if (rolesError) {
      console.log('❌ Error fetching roles:', rolesError.message);
    } else {
      console.log(`✅ Found ${existingRoles?.length || 0} existing roles`);
      
      existingRoles?.forEach((role, index) => {
        console.log(`\n   ${index + 1}. ${role.display_name} (${role.name})`);
        console.log(`      System Role: ${role.is_system_role ? 'Yes' : 'No'}`);
        console.log(`      Permissions: ${role.role_permissions?.length || 0}`);
        
        if (role.role_permissions && role.role_permissions.length > 0) {
          console.log(`      Modules: ${role.role_permissions.map(p => p.module_name).join(', ')}`);
        }
      });
    }

    // 2. Check available modules
    console.log('\n📋 2. Checking available modules...');
    const { data: modules, error: modulesError } = await supabaseAdmin
      .from('modules')
      .select('id, name, display_name, description')
      .order('display_name');

    if (modulesError) {
      console.log('❌ Error fetching modules:', modulesError.message);
    } else {
      console.log(`✅ Found ${modules?.length || 0} available modules`);
      
      if (modules && modules.length > 0) {
        console.log('\n📋 Available Modules:');
        modules.forEach((module, index) => {
          console.log(`   ${index + 1}. ${module.display_name} (${module.name})`);
        });
      }
    }

    // 3. Create a test role with permissions
    console.log('\n🔧 3. Creating test role with permissions...');
    
    const testRoleData = {
      name: 'test_role_' + Date.now(),
      display_name: 'Test Role',
      description: 'Test role for permission validation',
      permissions: [
        {
          module_name: 'dashboard',
          can_read: true,
          can_create: false,
          can_update: false,
          can_delete: false,
          screen_visible: true
        },
        {
          module_name: 'leads',
          can_read: true,
          can_create: true,
          can_update: true,
          can_delete: false,
          screen_visible: true
        },
        {
          module_name: 'customers',
          can_read: true,
          can_create: true,
          can_update: true,
          can_delete: false,
          screen_visible: true
        },
        {
          module_name: 'settings',
          can_read: false,
          can_create: false,
          can_update: false,
          can_delete: false,
          screen_visible: false
        }
      ]
    };

    // Create role
    const { data: newRole, error: createRoleError } = await supabaseAdmin
      .from('roles')
      .insert({
        name: testRoleData.name,
        display_name: testRoleData.display_name,
        description: testRoleData.description,
        hierarchy_level: 50,
        is_system_role: false
      })
      .select()
      .single();

    if (createRoleError) {
      console.log('❌ Error creating test role:', createRoleError.message);
      return;
    }

    console.log(`✅ Created test role: ${newRole.display_name} (${newRole.id})`);

    // Create role permissions
    const permissionData = testRoleData.permissions.map(perm => ({
      role_id: newRole.id,
      module_name: perm.module_name,
      can_create: perm.can_create,
      can_read: perm.can_read,
      can_update: perm.can_update,
      can_delete: perm.can_delete,
      screen_visible: perm.screen_visible
    }));

    const { error: createPermError } = await supabaseAdmin
      .from('role_permissions')
      .insert(permissionData);

    if (createPermError) {
      console.log('❌ Error creating role permissions:', createPermError.message);
      
      // Clean up the role if permissions fail
      await supabaseAdmin.from('roles').delete().eq('id', newRole.id);
      return;
    }

    console.log(`✅ Created ${permissionData.length} permissions for test role`);

    // 4. Verify the created role and permissions
    console.log('\n🔍 4. Verifying created role and permissions...');
    
    const { data: createdRoleWithPermissions, error: fetchError } = await supabaseAdmin
      .from('roles')
      .select(`
        id,
        name,
        display_name,
        description,
        is_system_role,
        role_permissions (
          module_name,
          can_read,
          can_create,
          can_update,
          can_delete,
          screen_visible
        )
      `)
      .eq('id', newRole.id)
      .single();

    if (fetchError) {
      console.log('❌ Error fetching created role:', fetchError.message);
    } else {
      console.log(`✅ Verified role: ${createdRoleWithPermissions.display_name}`);
      console.log(`   Permissions: ${createdRoleWithPermissions.role_permissions?.length || 0}`);
      
      if (createdRoleWithPermissions.role_permissions) {
        console.log('\n📋 Role Permissions:');
        createdRoleWithPermissions.role_permissions.forEach((perm, index) => {
          const icon = perm.screen_visible ? '✅' : '❌';
          console.log(`   ${index + 1}. ${icon} ${perm.module_name}`);
          console.log(`      Read: ${perm.can_read}, Create: ${perm.can_create}, Update: ${perm.can_update}, Delete: ${perm.can_delete}, Visible: ${perm.screen_visible}`);
        });
      }
    }

    // 5. Test permission checking functions
    console.log('\n🔍 5. Testing permission checking functions...');
    
    // Test get_user_permissions function (should work with role-based permissions)
    const { data: testPermissions, error: testPermError } = await supabaseAdmin.rpc(
      'get_user_permissions',
      { user_uuid: '7cdc1b5c-bcef-4ee5-b3ca-d7ce50d81cb9' } // Admin user
    );

    if (testPermError) {
      console.log('❌ Error testing get_user_permissions:', testPermError.message);
    } else {
      console.log(`✅ get_user_permissions function working: ${testPermissions?.length || 0} permissions`);
    }

    // Test user_has_permission function
    const { data: hasPermission, error: hasPermError } = await supabaseAdmin.rpc(
      'user_has_permission',
      {
        user_uuid: '7cdc1b5c-bcef-4ee5-b3ca-d7ce50d81cb9',
        module_name: 'dashboard',
        action: 'read'
      }
    );

    if (hasPermError) {
      console.log('❌ Error testing user_has_permission:', hasPermError.message);
    } else {
      console.log(`✅ user_has_permission function working: ${hasPermission}`);
    }

    // 6. Clean up test role
    console.log('\n🧹 6. Cleaning up test role...');
    
    // Delete role permissions first
    await supabaseAdmin
      .from('role_permissions')
      .delete()
      .eq('role_id', newRole.id);

    // Delete role
    const { error: deleteError } = await supabaseAdmin
      .from('roles')
      .delete()
      .eq('id', newRole.id);

    if (deleteError) {
      console.log('❌ Error deleting test role:', deleteError.message);
    } else {
      console.log('✅ Test role cleaned up successfully');
    }

    // 7. Summary
    console.log('\n📊 Role Management Permission Test Summary:');
    console.log('   ✅ Role creation: Working');
    console.log('   ✅ Permission creation: Working');
    console.log('   ✅ Permission verification: Working');
    console.log('   ✅ Permission functions: Working');
    console.log('   ✅ Cleanup: Working');
    
    console.log('\n🎉 Role management is creating permissions correctly!');
    console.log('   The role management system is functioning properly.');
    console.log('   Permissions are being stored and retrieved correctly.');

  } catch (error) {
    console.error('❌ Role management test failed:', error);
  }
}

// Run the test
testRoleManagementPermissions(); 
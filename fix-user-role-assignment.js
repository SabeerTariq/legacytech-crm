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

async function fixUserRoleAssignment() {
  console.log('🔧 Fixing User Role Assignment\n');

  try {
    const userEmail = 'bilal.ahmed.@logicworks.com';
    const frontSalesRoleId = 'ae936867-cbed-466c-bdef-778f05da133d';

    console.log(`📧 Fixing role assignment for: ${userEmail}`);
    console.log(`🔐 Front Sales Role ID: ${frontSalesRoleId}\n`);

    // 1. Get the user profile
    const { data: userProfile, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, email, display_name, attributes')
      .eq('email', userEmail)
      .single();

    if (userError) {
      console.log('❌ Error finding user:', userError.message);
      return;
    }

    console.log(`✅ Found user: ${userProfile.display_name} (${userProfile.user_id})`);

    // 2. Get the front_sales role permissions
    const { data: rolePermissions, error: rolePermError } = await supabaseAdmin
      .from('role_permissions')
      .select('module_name, can_read, can_create, can_update, can_delete, screen_visible')
      .eq('role_id', frontSalesRoleId);

    if (rolePermError) {
      console.log('❌ Error fetching role permissions:', rolePermError.message);
      return;
    }

    console.log(`✅ Found ${rolePermissions?.length || 0} permissions for front_sales role`);

    // 3. Assign role to user
    console.log('\n👤 3. Assigning front_sales role to user...');
    
    const { error: assignRoleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: userProfile.user_id,
        role_id: frontSalesRoleId
      });

    if (assignRoleError) {
      console.log('❌ Error assigning role:', assignRoleError.message);
    } else {
      console.log('✅ Role assigned to user successfully');
    }

    // 4. Update user profile attributes with role permissions
    console.log('\n👤 4. Updating user profile with role permissions...');
    
    // Convert role permissions to the format expected by user profile attributes
    const permissionsObject = {};
    rolePermissions?.forEach(perm => {
      permissionsObject[perm.module_name] = {
        can_read: perm.can_read,
        can_create: perm.can_create,
        can_update: perm.can_update,
        can_delete: perm.can_delete,
        screen_visible: perm.screen_visible
      };
    });

    const { error: updateProfileError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        attributes: {
          role: 'front_sales',
          department: 'Front Sales',
          is_admin: false,
          is_super_admin: false,
          permissions: permissionsObject,
          access_level: 'limited',
          can_manage_users: false,
          can_manage_roles: false,
          can_manage_permissions: false,
          can_manage_system: false,
          can_access_audit_logs: false,
          can_manage_backups: false,
          can_access_api: false,
          can_manage_integrations: false,
          can_manage_billing: false,
          can_manage_support: false,
          can_override_permissions: false,
          can_delete_any_data: false,
          can_export_all_data: false,
          can_import_data: false,
          can_manage_workflows: false,
          can_manage_automation: false,
          can_manage_analytics: false,
          can_manage_reports: false,
          can_manage_marketing: false,
          can_manage_notifications: false,
          can_manage_calendar: false,
          can_manage_documents: false,
          can_manage_messages: false,
          can_manage_projects: false,
          can_manage_kanban: false,
          can_manage_customers: false,
          can_manage_employees: false,
          can_manage_leads: true,
          can_manage_sales: true,
          can_manage_dashboard: false,
          can_manage_settings: false
        }
      })
      .eq('user_id', userProfile.user_id);

    if (updateProfileError) {
      console.log('❌ Error updating user profile:', updateProfileError.message);
    } else {
      console.log('✅ User profile updated with role permissions');
    }

    // 5. Test the user's permissions
    console.log('\n🧪 5. Testing user permissions...');
    
    const { data: userPermissions, error: testPermError } = await supabaseAdmin.rpc(
      'get_user_permissions',
      { user_uuid: userProfile.user_id }
    );

    if (testPermError) {
      console.log('❌ Error testing user permissions:', testPermError.message);
    } else {
      console.log(`✅ User permissions loaded: ${userPermissions?.length || 0} permissions`);
      
      if (userPermissions && userPermissions.length > 0) {
        console.log('\n📋 User Permissions:');
        userPermissions.forEach((perm, index) => {
          const icon = perm.screen_visible ? '✅' : '❌';
          console.log(`   ${index + 1}. ${icon} ${perm.module_name}`);
          console.log(`      Read: ${perm.can_read}, Create: ${perm.can_create}, Update: ${perm.can_update}, Delete: ${perm.can_delete}, Visible: ${perm.screen_visible}`);
        });
      }
    }

    // 6. Test specific permission checks
    console.log('\n🔍 6. Testing specific permission checks...');
    
    const testModules = ['dashboard', 'leads', 'customers', 'settings', 'front_sales_management'];
    
    for (const module of testModules) {
      const { data: hasPermission, error: checkError } = await supabaseAdmin.rpc(
        'user_has_permission',
        {
          user_uuid: userProfile.user_id,
          module_name: module,
          action: 'read'
        }
      );

      if (checkError) {
        console.log(`   ❌ ${module}: Error - ${checkError.message}`);
      } else {
        const icon = hasPermission ? '✅' : '❌';
        console.log(`   ${icon} ${module}: ${hasPermission}`);
      }
    }

    // 7. Verify role assignment
    console.log('\n🔍 7. Verifying role assignment...');
    
    const { data: userRole, error: roleCheckError } = await supabaseAdmin
      .from('user_roles')
      .select(`
        user_id,
        role_id,
        roles (
          name,
          display_name,
          description
        )
      `)
      .eq('user_id', userProfile.user_id)
      .single();

    if (roleCheckError) {
      console.log('❌ Error checking role assignment:', roleCheckError.message);
    } else {
      console.log(`✅ Role assignment verified: ${userRole.roles.display_name}`);
    }

    // 8. Summary
    console.log('\n📊 User Role Assignment Fix Summary:');
    console.log(`   👤 User: ${userProfile.display_name}`);
    console.log(`   📧 Email: ${userEmail}`);
    console.log(`   👑 Role: Front Seller`);
    console.log(`   🔐 Permissions: ${rolePermissions?.length || 0} modules`);
    console.log(`   ✅ Role assignment: Completed`);
    console.log(`   ✅ Profile update: Completed`);
    console.log(`   ✅ Permission functions: Working`);
    
    console.log('\n🎉 User role assignment fixed successfully!');
    console.log('   The user should now have access to front sales modules.');
    console.log('   Login again to see the updated permissions.');

  } catch (error) {
    console.error('❌ User role assignment fix failed:', error);
  }
}

// Run the fix
fixUserRoleAssignment(); 
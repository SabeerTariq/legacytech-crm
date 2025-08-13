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

async function fixAdminNavigationPermissions() {
  console.log('🔧 Fixing Admin Navigation Permissions\n');

  try {
    const adminUserId = '7cdc1b5c-bcef-4ee5-b3ca-d7ce50d81cb9';
    const adminEmail = 'admin@logicworks.com';

    console.log(`📧 Updating permissions for: ${adminEmail}`);
    console.log(`🔐 User ID: ${adminUserId}\n`);

    // Get current admin user profile
    const { data: adminUser, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, email, display_name, attributes')
      .eq('email', adminEmail)
      .single();

    if (userError) {
      console.log('❌ Error finding admin user:', userError.message);
      return;
    }

    console.log(`✅ Found admin user: ${adminUser.display_name}`);

    // Define all modules that should be visible in navigation
    const allNavigationModules = {
      // Core CRM modules
      dashboard: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      leads: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      customers: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      sales: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      sales_form: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      upsell: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      projects: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      kanban: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      payments: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      recurring_services: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      messages: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      calendar: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      documents: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      settings: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      
      // Administrative modules
      admin: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      user_management: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      role_management: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      employees: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      
      // Department modules
      development: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      front_sales: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      hr: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      marketing: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      other: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      production: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      upseller: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      
      // Additional modules
      automation: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      analytics: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      reports: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      integrations: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      billing: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      support: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      notifications: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      audit: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      backup: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      api: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      system: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      
      // Special modules
      front_sales_management: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      my_dashboard: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      better_ask_saul: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true }
    };

    // Update user profile with comprehensive permissions
    console.log('\n👤 Updating user profile with all navigation permissions...');
    
    const { error: profileUpdateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        attributes: {
          role: 'super_admin',
          department: 'Administration',
          is_admin: true,
          is_super_admin: true,
          permissions: allNavigationModules,
          access_level: 'full',
          can_manage_users: true,
          can_manage_roles: true,
          can_manage_permissions: true,
          can_manage_system: true,
          can_access_audit_logs: true,
          can_manage_backups: true,
          can_access_api: true,
          can_manage_integrations: true,
          can_manage_billing: true,
          can_manage_support: true,
          can_override_permissions: true,
          can_delete_any_data: true,
          can_export_all_data: true,
          can_import_data: true,
          can_manage_workflows: true,
          can_manage_automation: true,
          can_manage_analytics: true,
          can_manage_reports: true,
          can_manage_marketing: true,
          can_manage_notifications: true,
          can_manage_calendar: true,
          can_manage_documents: true,
          can_manage_messages: true,
          can_manage_projects: true,
          can_manage_kanban: true,
          can_manage_customers: true,
          can_manage_employees: true,
          can_manage_leads: true,
          can_manage_sales: true,
          can_manage_dashboard: true,
          can_manage_settings: true
        }
      })
      .eq('user_id', adminUser.user_id);

    if (profileUpdateError) {
      console.log('❌ Error updating user profile:', profileUpdateError.message);
    } else {
      console.log('✅ User profile updated with all navigation permissions');
    }

    // Test the updated permissions
    console.log('\n🧪 Testing updated permissions...');
    const { data: updatedPermissions, error: testError } = await supabaseAdmin.rpc(
      'get_user_permissions',
      { user_uuid: adminUserId }
    );

    if (testError) {
      console.log('❌ Error testing updated permissions:', testError.message);
    } else {
      console.log(`✅ Successfully loaded ${updatedPermissions?.length || 0} permissions`);
      
      // Show visible modules
      const visibleModules = updatedPermissions?.filter(p => p.screen_visible) || [];
      console.log(`📋 Visible modules: ${visibleModules.length}`);
      
      if (visibleModules.length > 0) {
        console.log('\n📋 Visible Modules:');
        visibleModules.forEach((perm, index) => {
          console.log(`   ${index + 1}. ✅ ${perm.module_name}`);
        });
      }
    }

    // Summary
    console.log('\n📊 Navigation Permission Fix Summary:');
    console.log(`   🔐 Total modules: ${Object.keys(allNavigationModules).length}`);
    console.log(`   👤 Admin user: ${adminUser.display_name}`);
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   ✅ All navigation modules: Added`);
    console.log(`   ✅ Screen visibility: Enabled for all modules`);
    
    console.log('\n🎉 Admin user now has access to ALL navigation menus!');
    console.log('   All menu items should now be visible in the navigation.');
    console.log('   Refresh the page to see the updated navigation menu.');

  } catch (error) {
    console.error('❌ Permission fix failed:', error);
  }
}

// Run the fix
fixAdminNavigationPermissions(); 
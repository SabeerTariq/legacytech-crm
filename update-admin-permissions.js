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

async function updateAdminPermissions() {
  console.log('🔐 Updating Admin User with All Permissions\n');

  try {
    // Get admin user
    const adminEmail = 'admin@logicworks.com';
    console.log(`📧 Finding admin user: ${adminEmail}`);

    const { data: adminUser, error: userError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, email, display_name')
      .eq('email', adminEmail)
      .single();

    if (userError) {
      console.log('❌ Error finding admin user:', userError.message);
      return;
    }

    console.log(`✅ Found admin user: ${adminUser.display_name} (${adminUser.user_id})`);

    // 1. Update user profile with comprehensive permissions
    console.log('\n👤 1. Updating user profile with all permissions...');
    
    const comprehensivePermissions = {
      dashboard: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      leads: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      sales: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      customers: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      employees: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      admin: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      user_management: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      role_management: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      projects: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      documents: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      messages: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      calendar: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      settings: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      kanban: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      analytics: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      reports: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      marketing: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      automation: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      integrations: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      billing: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      support: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      notifications: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      audit: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      backup: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      api: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      system: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true }
    };

    const { error: profileUpdateError } = await supabaseAdmin
      .from('user_profiles')
      .update({
        attributes: {
          role: 'super_admin',
          department: 'Administration',
          is_admin: true,
          is_super_admin: true,
          permissions: comprehensivePermissions,
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
      console.log('✅ User profile updated with comprehensive permissions');
    }

    // 2. Create or update admin role with all permissions
    console.log('\n👑 2. Creating/updating admin role...');
    
    // Check if admin role exists
    const { data: existingRole, error: roleCheckError } = await supabaseAdmin
      .from('roles')
      .select('*')
      .eq('name', 'Super Admin')
      .single();

    if (roleCheckError && roleCheckError.code !== 'PGRST116') {
      console.log('❌ Error checking admin role:', roleCheckError.message);
    } else if (!existingRole) {
      // Create super admin role
      const { data: newRole, error: createRoleError } = await supabaseAdmin
        .from('roles')
        .insert({
          name: 'Super Admin',
          description: 'Full system administrator with all possible permissions',
          permissions: comprehensivePermissions
        })
        .select()
        .single();

      if (createRoleError) {
        console.log('❌ Error creating super admin role:', createRoleError.message);
      } else {
        console.log('✅ Super admin role created');
        
        // Assign role to user
        const { error: userRoleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: adminUser.user_id,
            role_id: newRole.id
          });

        if (userRoleError) {
          console.log('❌ Error assigning super admin role:', userRoleError.message);
        } else {
          console.log('✅ Super admin role assigned to user');
        }
      }
    } else {
      console.log('✅ Super admin role already exists');
      
      // Update existing role with all permissions
      const { error: updateRoleError } = await supabaseAdmin
        .from('roles')
        .update({
          description: 'Full system administrator with all possible permissions',
          permissions: comprehensivePermissions
        })
        .eq('name', 'Super Admin');

      if (updateRoleError) {
        console.log('❌ Error updating super admin role:', updateRoleError.message);
      } else {
        console.log('✅ Super admin role updated with all permissions');
      }
    }

    // 3. Insert comprehensive user permissions
    console.log('\n🔐 3. Inserting comprehensive user permissions...');
    
    const allModules = Object.keys(comprehensivePermissions);
    
    for (const module of allModules) {
      const { error: permError } = await supabaseAdmin
        .from('user_permissions')
        .upsert({
          user_id: adminUser.user_id,
          module: module,
          can_read: true,
          can_create: true,
          can_update: true,
          can_delete: true,
          screen_visible: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id,module'
        });

      if (permError) {
        console.log(`   ⚠️  Permission ${module}:`, permError.message);
      } else {
        console.log(`   ✅ Permission ${module} granted`);
      }
    }

    // 4. Show final status
    console.log('\n📊 4. Admin Permissions Summary:');
    console.log(`   🔐 User ID: ${adminUser.user_id}`);
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   👤 Display Name: ${adminUser.display_name}`);
    console.log(`   👑 Role: Super Admin`);
    console.log(`   🔐 Total Modules: ${allModules.length}`);
    console.log(`   ✅ All Permissions: Granted`);

    console.log('\n✅ Admin user now has ALL permissions!');
    console.log('\n📝 Permission Summary:');
    console.log('   ✅ Full access to all modules');
    console.log('   ✅ Can manage users, roles, and permissions');
    console.log('   ✅ Can access system settings and audit logs');
    console.log('   ✅ Can manage integrations and API access');
    console.log('   ✅ Can override any permission restrictions');
    console.log('   ✅ Can export/import all data');
    console.log('   ✅ Can manage workflows and automation');
    console.log('   ✅ Can access all analytics and reports');

    console.log('\n🎉 Admin user is now a Super Administrator with full system access!');

  } catch (error) {
    console.error('❌ Permission update failed:', error);
  }
}

// Run the permission update
updateAdminPermissions(); 
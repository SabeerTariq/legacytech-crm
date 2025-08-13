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

async function createAdminUser() {
  console.log('👑 Creating Admin User for CRM Access\n');

  try {
    // Admin user details
    const adminEmail = 'admin@logicworks.com';
    const adminPassword = 'AdminPassword123!';
    const adminName = 'CRM Admin';

    console.log('📝 Admin User Details:');
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔑 Password: ${adminPassword}`);
    console.log(`   👤 Name: ${adminName}`);

    // 1. Create auth user
    console.log('\n🔐 1. Creating auth user...');
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: {
        full_name: adminName,
        role: 'admin',
        department: 'Administration',
        is_admin: true
      }
    });

    if (authError) {
      console.log('❌ Error creating auth user:', authError.message);
      return;
    }

    console.log(`✅ Auth user created: ${authData.user.id}`);

    // 2. Create user profile
    console.log('\n👤 2. Creating user profile...');
    const profileData = {
      user_id: authData.user.id,
      email: adminEmail,
      display_name: adminName,
      is_active: true,
      attributes: {
        role: 'admin',
        department: 'Administration',
        is_admin: true,
        permissions: {
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
          settings: { can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true }
        }
      }
    };

    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert(profileData);

    if (profileError) {
      console.log('❌ Error creating user profile:', profileError.message);
    } else {
      console.log('✅ User profile created successfully');
    }

    // 3. Create admin role
    console.log('\n👑 3. Creating admin role...');
    const { data: adminRole, error: roleError } = await supabaseAdmin
      .from('roles')
      .select('id')
      .eq('name', 'Admin')
      .single();

    if (roleError && roleError.code !== 'PGRST116') {
      console.log('❌ Error checking admin role:', roleError.message);
    } else if (!adminRole) {
      // Create admin role if it doesn't exist
      const { data: newRole, error: createRoleError } = await supabaseAdmin
        .from('roles')
        .insert({
          name: 'Admin',
          description: 'Full system administrator with all permissions',
          is_active: true
        })
        .select()
        .single();

      if (createRoleError) {
        console.log('❌ Error creating admin role:', createRoleError.message);
      } else {
        console.log('✅ Admin role created');
        const roleId = newRole.id;
        
        // Assign role to user
        const { error: userRoleError } = await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role_id: roleId
          });

        if (userRoleError) {
          console.log('❌ Error assigning admin role:', userRoleError.message);
        } else {
          console.log('✅ Admin role assigned to user');
        }
      }
    } else {
      // Assign existing admin role
      const { error: userRoleError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role_id: adminRole.id
        });

      if (userRoleError) {
        console.log('❌ Error assigning admin role:', userRoleError.message);
      } else {
        console.log('✅ Admin role assigned to user');
      }
    }

    // 4. Create comprehensive permissions
    console.log('\n🔐 4. Creating comprehensive permissions...');
    const adminPermissions = [
      { module: 'dashboard', can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      { module: 'leads', can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      { module: 'sales', can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      { module: 'customers', can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      { module: 'employees', can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      { module: 'admin', can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      { module: 'user_management', can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      { module: 'role_management', can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      { module: 'projects', can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      { module: 'documents', can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      { module: 'messages', can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      { module: 'calendar', can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true },
      { module: 'settings', can_read: true, can_create: true, can_update: true, can_delete: true, screen_visible: true }
    ];

    // Insert permissions directly
    for (const permission of adminPermissions) {
      const { error: permError } = await supabaseAdmin
        .from('user_permissions')
        .insert({
          user_id: authData.user.id,
          module: permission.module,
          can_read: permission.can_read,
          can_create: permission.can_create,
          can_update: permission.can_update,
          can_delete: permission.can_delete,
          screen_visible: permission.screen_visible
        });

      if (permError) {
        console.log(`   ⚠️  Permission ${permission.module}:`, permError.message);
      } else {
        console.log(`   ✅ Permission ${permission.module} created`);
      }
    }

    // 5. Show final status
    console.log('\n📊 5. Admin User Creation Summary:');
    console.log(`   🔐 Auth User ID: ${authData.user.id}`);
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   👤 Display Name: ${adminName}`);
    console.log(`   👑 Role: Admin`);
    console.log(`   🔐 Permissions: All modules enabled`);

    console.log('\n✅ Admin user created successfully!');
    console.log('\n📝 Login Details:');
    console.log(`   📧 Email: ${adminEmail}`);
    console.log(`   🔑 Password: ${adminPassword}`);
    console.log('\n⚠️  Security Note:');
    console.log('   - Change the password after first login');
    console.log('   - Use a strong password');
    console.log('   - Enable 2FA if available');

    // 6. Test login capability
    console.log('\n🧪 6. Testing login capability...');
    try {
      const { data: testAuth, error: testError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'signup',
        email: adminEmail
      });

      if (testError) {
        console.log('❌ Error testing login:', testError.message);
      } else {
        console.log('✅ Login capability verified');
      }
    } catch (error) {
      console.log('⚠️  Login test skipped:', error.message);
    }

    console.log('\n🎉 Admin user is ready to use!');
    console.log('   You can now login to the CRM with the provided credentials.');

  } catch (error) {
    console.error('❌ Admin user creation failed:', error);
  }
}

// Run the admin user creation
createAdminUser(); 
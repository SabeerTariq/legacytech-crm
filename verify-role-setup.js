import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function verifyRoleSetup() {
  console.log('🔍 Verifying Role Management Setup...');

  try {
    // Check if roles table exists
    console.log('1. Checking roles table...');
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .limit(5);

    if (rolesError) {
      console.log('❌ Roles table error:', rolesError.message);
    } else {
      console.log('✅ Roles table exists with', roles?.length || 0, 'roles');
      if (roles && roles.length > 0) {
        console.log('Roles found:', roles.map(r => r.name));
      }
    }

    // Check if role_permissions table exists
    console.log('2. Checking role_permissions table...');
    const { data: rolePerms, error: rolePermsError } = await supabase
      .from('role_permissions')
      .select('*')
      .limit(5);

    if (rolePermsError) {
      console.log('❌ Role permissions table error:', rolePermsError.message);
    } else {
      console.log('✅ Role permissions table exists with', rolePerms?.length || 0, 'permissions');
    }

    // Check if user_roles table exists
    console.log('3. Checking user_roles table...');
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select('*')
      .limit(5);

    if (userRolesError) {
      console.log('❌ User roles table error:', userRolesError.message);
    } else {
      console.log('✅ User roles table exists with', userRoles?.length || 0, 'user roles');
    }

    // Check modules
    console.log('4. Checking modules...');
    const { data: modules, error: modulesError } = await supabase
      .from('modules')
      .select('name, display_name')
      .limit(10);

    if (modulesError) {
      console.log('❌ Modules table error:', modulesError.message);
    } else {
      console.log('✅ Modules table exists with', modules?.length || 0, 'modules');
      console.log('Available modules:', modules?.map(m => m.name) || []);
    }

    // Try to create admin role if it doesn't exist
    if (rolesError) {
      console.log('❌ Cannot create admin role - roles table does not exist');
      console.log('Please run the SQL migration in your Supabase SQL editor first.');
    } else if (!roles || roles.length === 0) {
      console.log('5. Creating admin role...');
      const { data: adminRole, error: adminError } = await supabase
        .from('roles')
        .insert([{
          name: 'admin',
          display_name: 'Administrator',
          description: 'Full system access with all permissions',
          hierarchy_level: 100,
          is_system_role: true,
          permissions: [
            {"resource": "*", "action": "*"},
            {"resource": "users", "action": "manage"},
            {"resource": "roles", "action": "manage"},
            {"resource": "audit", "action": "view"}
          ]
        }])
        .select()
        .single();

      if (adminError) {
        console.log('❌ Admin role creation error:', adminError.message);
      } else {
        console.log('✅ Admin role created successfully');
      }
    } else {
      console.log('✅ Admin role already exists');
    }

    console.log('🎉 Verification completed!');

  } catch (error) {
    console.error('❌ Error during verification:', error);
  }
}

verifyRoleSetup(); 
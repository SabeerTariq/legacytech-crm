import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Using service role key for admin access

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUsersNewSchema() {
  try {
    console.log('🔍 Checking users with new schema...');
    
    // Check user_profiles table
    const { data: userProfiles, error: profilesError } = await supabase
      .from('user_profiles')
      .select(`
        id,
        user_id,
        employee_id,
        email,
        display_name,
        is_active,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (profilesError) {
      console.error('❌ Error fetching user_profiles:', profilesError.message);
      return;
    }

    console.log('\n📋 User Profiles:');
    if (userProfiles && userProfiles.length > 0) {
      userProfiles.forEach((profile, index) => {
        console.log(`${index + 1}. ${profile.display_name || 'No name'} (${profile.email}) - Active: ${profile.is_active}`);
        console.log(`   User ID: ${profile.user_id}`);
        console.log(`   Employee ID: ${profile.employee_id || 'None'}`);
        console.log('---');
      });
    } else {
      console.log('❌ No user profiles found in the database');
    }

    // Check auth.users table
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message);
      return;
    }

    console.log('\n🔐 Auth Users:');
    if (authUsers && authUsers.users && authUsers.users.length > 0) {
      authUsers.users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.email} - Status: ${user.user_metadata?.status || 'active'}`);
        console.log(`   User ID: ${user.id}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('---');
      });
    } else {
      console.log('❌ No auth users found');
    }

    // Check roles table
    const { data: roles, error: rolesError } = await supabase
      .from('roles')
      .select('*')
      .order('hierarchy_level', { ascending: true });

    if (rolesError) {
      console.error('❌ Error fetching roles:', rolesError.message);
    } else {
      console.log('\n👥 Available Roles:');
      if (roles && roles.length > 0) {
        roles.forEach((role, index) => {
          console.log(`${index + 1}. ${role.display_name} (${role.name}) - Level: ${role.hierarchy_level}`);
          console.log(`   Description: ${role.description || 'No description'}`);
          console.log('---');
        });
      } else {
        console.log('❌ No roles found');
      }
    }

    // Check user_roles table
    const { data: userRoles, error: userRolesError } = await supabase
      .from('user_roles')
      .select(`
        id,
        user_id,
        role_id,
        granted_at,
        expires_at,
        roles(name, display_name)
      `)
      .order('granted_at', { ascending: false });

    if (userRolesError) {
      console.error('❌ Error fetching user roles:', userRolesError.message);
    } else {
      console.log('\n🎭 User Role Assignments:');
      if (userRoles && userRoles.length > 0) {
        userRoles.forEach((userRole, index) => {
          console.log(`${index + 1}. User: ${userRole.user_id} - Role: ${userRole.roles?.display_name || userRole.roles?.name}`);
          console.log(`   Granted: ${userRole.granted_at}`);
          console.log(`   Expires: ${userRole.expires_at || 'Never'}`);
          console.log('---');
        });
      } else {
        console.log('❌ No user role assignments found');
      }
    }

  } catch (error) {
    console.error('❌ Error checking users:', error.message);
  }
}

checkUsersNewSchema(); 
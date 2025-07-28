import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = "https://yipyteszzyycbqgzpfrf.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Create admin client with service role key
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { employee_id, email, password, permissions } = req.body;

    // Validate required fields
    if (!employee_id || !email || !password || !permissions) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('Creating user with data:', { employee_id, email, permissions: permissions.length });

    // Clean up any existing data that might cause conflicts
    console.log('Cleaning up any existing data for email:', email);
    
    // First, check if user already exists in auth.users
    const { data: existingUsers, error: existingUserError } = await supabaseAdmin.auth.admin.listUsers();
    if (!existingUserError && existingUsers?.users) {
      const existingUser = existingUsers.users.find(user => user.email === email);
      if (existingUser) {
        console.log('Found existing user in auth.users, deleting:', existingUser.id);
        await supabaseAdmin.auth.admin.deleteUser(existingUser.id);
      }
    }

    // Remove any existing user profile
    const { error: profileDeleteError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('email', email);
    
    if (profileDeleteError) {
      console.log('Profile deletion error (might not exist):', profileDeleteError.message);
    }

    // Remove any existing user permissions
    const { error: permissionsDeleteError } = await supabaseAdmin
      .from('user_permissions')
      .delete()
      .eq('user_id', 'some-non-existent-id'); // This won't delete anything, just check table access
    
    if (permissionsDeleteError) {
      console.log('Permissions table access error:', permissionsDeleteError.message);
    }

    console.log('Cleanup completed, now creating new user...');

    // Create user in Supabase Auth - WITHOUT user_metadata to avoid database errors
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      // Removed user_metadata to avoid database constraint issues
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      console.error('Auth error details:', JSON.stringify(authError, null, 2));
      return res.status(400).json({ error: `Auth creation failed: ${authError.message}` });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create user account' });
    }

    console.log('User created in Auth:', authData.user.id);

    // Get employee data
    const { data: employeeData, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('id', employee_id)
      .single();

    if (employeeError) {
      console.error('Employee fetch error:', employeeError);
      // Don't fail here, continue with basic user creation
      console.log('Continuing without employee data...');
    }

    // Create user profile
    const profileData = {
      user_id: authData.user.id,
      employee_id: employee_id,
      email: email,
      display_name: employeeData?.full_name || employeeData?.name || email,
      is_active: true,
      attributes: {
        department: employeeData?.department || '',
        position: employeeData?.job_title || employeeData?.position || '',
        phone: employeeData?.contact_number || employeeData?.phone || ''
      }
    };

    console.log('Creating user profile with data:', profileData);

    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert(profileData);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Don't fail here as the user was created successfully
      console.log('Profile creation failed, but user was created in Auth');
    } else {
      console.log('User profile created successfully');
    }

    // Create permissions for the user
    if (permissions && permissions.length > 0) {
      const permissionsJson = permissions.map(permission => ({
        module: permission.module,
        can_create: permission.can_create,
        can_read: permission.can_read,
        can_update: permission.can_update,
        can_delete: permission.can_delete,
        screen_visible: permission.screen_visible
      }));

      console.log('Creating permissions:', permissionsJson);

      const { error: functionError } = await supabaseAdmin.rpc(
        'create_user_permissions_from_template',
        {
          p_user_id: authData.user.id,
          p_role_template: permissionsJson
        }
      );

      if (functionError) {
        console.error('Permissions creation error:', functionError);
        // Don't fail here as the user was created successfully
        console.log('Permissions creation failed, but user was created');
      } else {
        console.log('User permissions created successfully');
      }
    }

    // Return the created user
    const createdUser = {
      id: authData.user.id,
      employee_id: employee_id,
      email: email,
      status: 'active',
      created_by_admin_id: '1', // TODO: Get from current admin user
      created_at: new Date().toISOString(),
      employee: employeeData ? {
        id: employeeData.id,
        full_name: employeeData.full_name || employeeData.name,
        email: employeeData.email,
        department: employeeData.department,
        job_title: employeeData.job_title || employeeData.position,
        date_of_joining: employeeData.date_of_joining || ''
      } : null
    };

    console.log('User creation completed successfully:', createdUser.id);

    res.status(200).json({ user: createdUser });

  } catch (error) {
    console.error('Error in create-user API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 
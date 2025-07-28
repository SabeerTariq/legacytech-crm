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

    // Step 1: Create user in Supabase Auth with minimal data
    console.log('Step 1: Creating user in Supabase Auth...');
    
    const createUserOptions = {
      email: email,
      password: password,
      email_confirm: true,
      email_confirm_redirect_to: null,
      // Remove all metadata to avoid database constraints
    };

    console.log('Create user options:', createUserOptions);

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser(createUserOptions);

    if (authError) {
      console.error('Auth creation error details:', {
        message: authError.message,
        status: authError.status,
        code: authError.code,
        details: authError
      });
      
      // Provide more specific error messages
      if (authError.message.includes('Database error')) {
        return res.status(400).json({ 
          error: 'Database configuration issue. Please check Supabase project settings and run database fixes.',
          details: authError.message 
        });
      }
      
      return res.status(400).json({ error: `Auth creation failed: ${authError.message}` });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create user account' });
    }

    console.log('✅ User created in Auth:', authData.user.id);

    // Step 2: Get employee data
    console.log('Step 2: Fetching employee data...');
    const { data: employeeData, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('id', employee_id)
      .single();

    if (employeeError) {
      console.error('Employee fetch error:', employeeError);
      console.log('Continuing without employee data...');
    }

    // Step 3: Create user profile
    console.log('Step 3: Creating user profile...');
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

    console.log('Profile data:', profileData);

    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert(profileData);

    if (profileError) {
      console.error('Profile creation error:', profileError);
      console.log('Profile creation failed, but user was created in Auth');
    } else {
      console.log('✅ User profile created successfully');
    }

    // Step 4: Create permissions
    if (permissions && permissions.length > 0) {
      console.log('Step 4: Creating user permissions...');
      const permissionsJson = permissions.map(permission => ({
        module: permission.module,
        can_create: permission.can_create,
        can_read: permission.can_read,
        can_update: permission.can_update,
        can_delete: permission.can_delete,
        screen_visible: permission.screen_visible
      }));

      console.log('Permissions data:', permissionsJson);

      const { error: functionError } = await supabaseAdmin.rpc(
        'create_user_permissions_from_template',
        {
          p_user_id: authData.user.id,
          p_role_template: permissionsJson
        }
      );

      if (functionError) {
        console.error('Permissions creation error:', functionError);
        console.log('Permissions creation failed, but user was created');
      } else {
        console.log('✅ User permissions created successfully');
      }
    }

    // Return the created user
    const createdUser = {
      id: authData.user.id,
      employee_id: employee_id,
      email: email,
      status: 'active',
      created_by_admin_id: '1',
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

    console.log('✅ User creation completed successfully:', createdUser.id);

    res.status(200).json({ user: createdUser });

  } catch (error) {
    console.error('Unexpected error in create-user API:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
} 
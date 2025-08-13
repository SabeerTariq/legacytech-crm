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
    const { employee_id, password, permissions } = req.body;

    // Validate required fields
    if (!employee_id || !password) {
      return res.status(400).json({ error: 'Missing required fields: employee_id and password' });
    }

    console.log('Creating user for employee:', employee_id);

    // Get employee data first
    const { data: employeeData, error: employeeError } = await supabaseAdmin
      .from('employees')
      .select('*')
      .eq('id', employee_id)
      .single();

    if (employeeError || !employeeData) {
      console.error('Employee fetch error:', employeeError);
      return res.status(400).json({ error: 'Employee not found' });
    }

    console.log('Employee found:', employeeData.full_name);

    // Generate or get user management email
    let userManagementEmail = employeeData.user_management_email;
    
    if (!userManagementEmail) {
      // Generate user management email using the database function
      const { data: emailResult, error: emailError } = await supabaseAdmin.rpc(
        'generate_employee_user_email',
        {
          employee_full_name: employeeData.full_name,
          employee_department: employeeData.department
        }
      );

      if (emailError) {
        console.error('Email generation error:', emailError);
        return res.status(400).json({ error: 'Failed to generate user management email' });
      }

      userManagementEmail = emailResult;

      // Update employee with the generated email
      const { error: updateError } = await supabaseAdmin
        .from('employees')
        .update({ user_management_email: userManagementEmail })
        .eq('id', employee_id);

      if (updateError) {
        console.error('Employee update error:', updateError);
        // Continue anyway as the email was generated
      }
    }

    console.log('Using user management email:', userManagementEmail);

    // Clean up any existing data that might cause conflicts
    console.log('Cleaning up any existing data for employee:', employee_id);
    
    // Check if user profile already exists for this employee
    const { data: existingProfile, error: profileCheckError } = await supabaseAdmin
      .from('user_profiles')
      .select('user_id, email')
      .eq('employee_id', employee_id)
      .single();

    if (existingProfile) {
      console.log('Found existing profile for employee, deleting auth user:', existingProfile.user_id);
      await supabaseAdmin.auth.admin.deleteUser(existingProfile.user_id);
    }

    // Remove any existing user profile for this employee
    const { error: profileDeleteError } = await supabaseAdmin
      .from('user_profiles')
      .delete()
      .eq('employee_id', employee_id);
    
    if (profileDeleteError) {
      console.log('Profile deletion error (might not exist):', profileDeleteError.message);
    }

    console.log('Cleanup completed, now creating new user...');

    // Create user in Supabase Auth with user management email
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: userManagementEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        employee_id: employee_id,
        full_name: employeeData.full_name,
        department: employeeData.department,
        job_title: employeeData.job_title,
        personal_email: employeeData.personal_email || employeeData.email,
        user_management_email: userManagementEmail
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(400).json({ error: `Auth creation failed: ${authError.message}` });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create user account' });
    }

    console.log('User created in Auth:', authData.user.id);

    // Create user profile with employee linking (manually instead of relying on trigger)
    const profileData = {
      user_id: authData.user.id,
      employee_id: employee_id,
      email: userManagementEmail,
      display_name: employeeData.full_name,
      is_active: true,
      attributes: {
        department: employeeData.department,
        position: employeeData.job_title || employeeData.position,
        phone: employeeData.contact_number || employeeData.phone,
        personal_email: employeeData.personal_email || employeeData.email,
        user_management_email: userManagementEmail,
        permissions: {} // Initialize empty permissions object
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

    // Create permissions for the user if provided
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

      // Create permissions object for user profile
      const permissionsObject = {};
      permissionsJson.forEach(perm => {
        permissionsObject[perm.module] = {
          can_create: perm.can_create,
          can_read: perm.can_read,
          can_update: perm.can_update,
          can_delete: perm.can_delete,
          screen_visible: perm.screen_visible
        };
      });

      console.log('Updating user profile with permissions:', permissionsObject);

      // Update user profile with permissions
      const { error: updateError } = await supabaseAdmin
        .from('user_profiles')
        .update({
          attributes: {
            ...profileData.attributes,
            permissions: permissionsObject
          }
        })
        .eq('user_id', authData.user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        console.log('Permissions creation failed, but user was created');
      } else {
        console.log('User permissions created successfully via profile update');
      }

      // Also try to create permissions using the function as backup
      const { error: functionError } = await supabaseAdmin.rpc(
        'create_user_permissions_from_template',
        {
          p_user_id: authData.user.id,
          p_role_template: permissionsJson
        }
      );

      if (functionError) {
        console.error('Function permissions creation error:', functionError);
      } else {
        console.log('User permissions also created successfully via function');
      }
    }

    // Assign role to user if role template was selected
    if (req.body.role_id) {
      console.log('Assigning role to user:', req.body.role_id);
      
      const { error: roleAssignmentError } = await supabaseAdmin
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role_id: req.body.role_id
        });

      if (roleAssignmentError) {
        console.error('Role assignment error:', roleAssignmentError);
        console.log('Role assignment failed, but user was created successfully');
      } else {
        console.log('Role assigned successfully to user');
      }
    }

    // Return the created user with both email types
    const createdUser = {
      id: authData.user.id,
      employee_id: employee_id,
      user_management_email: userManagementEmail,
      personal_email: employeeData.personal_email || employeeData.email,
      status: 'active',
      created_at: new Date().toISOString(),
      employee: {
        id: employeeData.id,
        full_name: employeeData.full_name,
        department: employeeData.department,
        job_title: employeeData.job_title || employeeData.position,
        date_of_joining: employeeData.date_of_joining || '',
        personal_email: employeeData.personal_email || employeeData.email,
        user_management_email: userManagementEmail
      }
    };

    console.log('User creation completed successfully:', createdUser.id);
    console.log('User Management Email:', userManagementEmail);
    console.log('Personal Email:', employeeData.personal_email || employeeData.email);

    res.status(200).json({ 
      user: createdUser,
      message: 'User created successfully with user management email system'
    });

  } catch (error) {
    console.error('Error in create-user API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 
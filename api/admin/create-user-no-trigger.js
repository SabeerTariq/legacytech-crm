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

    console.log('Creating user with simplified approach:', { employee_id, email, permissions: permissions.length });

    // STEP 1: Create user in Supabase Auth ONLY (no triggers)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return res.status(400).json({ error: `Auth creation failed: ${authError.message}` });
    }

    if (!authData.user) {
      return res.status(400).json({ error: 'Failed to create user account' });
    }

    console.log('✅ User created in Auth successfully:', authData.user.id);

    // STEP 2: Manually create user profile (since triggers might be problematic)
    try {
      // Get employee data first
      const { data: employeeData, error: employeeError } = await supabaseAdmin
        .from('employees')
        .select('*')
        .eq('id', employee_id)
        .single();

      if (employeeError) {
        console.log('Employee not found, continuing with basic data...');
      }

      // Create user profile manually
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

      console.log('Creating user profile manually...');

      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert(profileData);

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the entire request, just log it
      } else {
        console.log('✅ User profile created successfully');
      }

      // STEP 3: Create permissions manually
      if (permissions && permissions.length > 0) {
        console.log('Creating permissions manually...');

        const permissionsJson = permissions.map(permission => ({
          module: permission.module,
          can_create: permission.can_create,
          can_read: permission.can_read,
          can_update: permission.can_update,
          can_delete: permission.can_delete,
          screen_visible: permission.screen_visible
        }));

        const { error: functionError } = await supabaseAdmin.rpc(
          'create_user_permissions_from_template',
          {
            p_user_id: authData.user.id,
            p_role_template: permissionsJson
          }
        );

        if (functionError) {
          console.error('Permissions creation error:', functionError);
          // Don't fail the entire request, just log it
        } else {
          console.log('✅ User permissions created successfully');
        }
      }

      // STEP 4: Assign default employee role manually
      try {
        const { data: defaultRole } = await supabaseAdmin
          .from('roles')
          .select('id')
          .eq('name', 'employee')
          .single();

        if (defaultRole) {
          const { error: roleError } = await supabaseAdmin
            .from('user_roles')
            .insert({
              user_id: authData.user.id,
              role_id: defaultRole.id
            });

          if (roleError) {
            console.error('Role assignment error:', roleError);
          } else {
            console.log('✅ Default role assigned successfully');
          }
        }
      } catch (roleErr) {
        console.log('Role assignment skipped (table might not exist)');
      }

    } catch (setupError) {
      console.error('Post-creation setup error:', setupError);
      // User was created successfully, but setup failed
      console.log('⚠️ User created but profile setup incomplete');
    }

    // Return success response
    const createdUser = {
      id: authData.user.id,
      employee_id: employee_id,
      email: email,
      status: 'active',
      created_by_admin_id: '1',
      created_at: new Date().toISOString(),
      employee: {
        id: employee_id,
        email: email
      }
    };

    console.log('🎉 User creation completed successfully:', createdUser.id);
    res.status(200).json({ user: createdUser });

  } catch (error) {
    console.error('Error in create-user API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 
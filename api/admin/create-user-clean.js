import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || "https://yipyteszzyycbqgzpfrf.supabase.com";
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables
if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
}

if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL is not set in environment variables');
  throw new Error('Missing SUPABASE_URL environment variable');
}

console.log('✅ Environment variables loaded successfully');
console.log('📍 SUPABASE_URL:', SUPABASE_URL);
console.log('🔑 SUPABASE_SERVICE_ROLE_KEY length:', SUPABASE_SERVICE_ROLE_KEY.length);

// Supabase Admin Client (following the guide)
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

    // Validate inputs (from guide)
    if (!email || !password) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    if (!employee_id || !permissions) {
      return res.status(400).json({ error: 'Missing employee_id or permissions' });
    }

    console.log('Creating user following guide approach:', { employee_id, email, permissions: permissions.length });

    // Step 1: Prevent duplicates (from guide)
    const { data: existingUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    if (!listError && existingUsers?.users) {
      const existing = existingUsers.users.find(user => user.email === email);
      if (existing) {
        return res.status(409).json({ error: 'User already exists' });
      }
    }

    // Step 2: Create user in Supabase Auth (modified from guide to avoid metadata issues)
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true
      // Removed user_metadata to avoid database conflicts
    });

    if (error) {
      console.error('Auth creation error:', error);
      return res.status(500).json({ error: error.message });
    }

    const user_id = data.user.id;
    console.log('✅ User created in Supabase Auth:', user_id);

    // Step 3: Insert into CRM users table (following guide structure)
    try {
      // Validate employee_id exists in database
      let validEmployeeId = null;
      if (employee_id && employee_id.length === 36 && employee_id.includes('-')) {
        // Check if employee actually exists
        const { data: existingEmployee } = await supabaseAdmin
          .from('employees')
          .select('id')
          .eq('id', employee_id)
          .single();
          
        if (existingEmployee) {
          validEmployeeId = employee_id;
          console.log('✅ Employee found, linking to user');
        } else {
          console.log('⚠️  Employee not found, creating user without employee link');
        }
      } else {
        console.log('⚠️  Invalid employee_id format, creating user without employee link');
      }

      const { error: profileError } = await supabaseAdmin
        .from('user_profiles')
        .insert({
          user_id: user_id,      // Fix: Use user_id field, not id
          employee_id: validEmployeeId, // Only set if employee exists
          email: email,
          display_name: email,   // Default display name
          is_active: true,
          created_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Don't fail the entire request - user was created successfully
      } else {
        console.log('✅ User profile created in CRM');
      }
    } catch (profileErr) {
      console.error('Profile creation failed:', profileErr);
    }

    // Step 4: Insert permissions (following guide approach)
    try {
      if (permissions && permissions.length > 0) {
        // First, get module IDs from module names
        const moduleNames = permissions.map(p => p.module_id || p.module);
        const { data: modules, error: moduleError } = await supabaseAdmin
          .from('modules')
          .select('id, name')
          .in('name', moduleNames);

        if (moduleError) {
          console.error('Error fetching modules:', moduleError);
        } else {
          // Create a map of module names to IDs
          const moduleMap = {};
          modules.forEach(mod => {
            moduleMap[mod.name] = mod.id;
          });

          // Format permissions with correct module IDs
          const formattedPermissions = permissions
            .map(permission => {
              const moduleName = permission.module_id || permission.module;
              const moduleId = moduleMap[moduleName];
              
              if (!moduleId) {
                console.log(`⚠️  Module '${moduleName}' not found, skipping`);
                return null;
              }

              return {
                user_id: user_id,
                module_id: moduleId,  // Use the numeric ID from database
                can_create: permission.can_create || false,
                can_read: permission.can_read || false,
                can_update: permission.can_update || false,
                can_delete: permission.can_delete || false,
                screen_visible: permission.screen_visible || false
              };
            })
            .filter(p => p !== null);  // Remove null entries

          if (formattedPermissions.length > 0) {
            const { error: permError } = await supabaseAdmin
              .from('user_permissions')
              .insert(formattedPermissions);

            if (permError) {
              console.error('Permissions creation error:', permError);
              // Don't fail - user was created successfully
            } else {
              console.log('✅ User permissions created');
            }
          } else {
            console.log('⚠️  No valid permissions to create');
          }
        }
      }
    } catch (permErr) {
      console.error('Permissions creation failed:', permErr);
    }

    // Step 5: Get employee data for response
    let employeeData = null;
    try {
      const { data: emp, error: empError } = await supabaseAdmin
        .from('employees')
        .select('*')
        .eq('id', employee_id)
        .single();

      if (!empError && emp) {
        employeeData = emp;
      }
    } catch (empErr) {
      console.log('Employee data not found, continuing...');
    }

    // Return success response (following guide format)
    const responseUser = {
      id: user_id,
      employee_id: employee_id,
      email: email,
      status: 'active',
      created_by_admin_id: '1', // TODO: Get from current admin user
      created_at: new Date().toISOString(),
      employee: employeeData ? {
        id: employeeData.id,
        name: employeeData.name || employeeData.full_name,
        email: employeeData.email,
        department: employeeData.department,
        position: employeeData.position || employeeData.job_title
      } : null
    };

    console.log('🎉 User creation completed following guide:', responseUser.id);
    res.status(201).json({ 
      message: 'User created', 
      user_id: user_id,
      user: responseUser 
    });

  } catch (error) {
    console.error('Error in create-user API:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 
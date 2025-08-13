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

async function createFrontSalesUsers() {
  console.log('🚀 Creating User Management Accounts for Front Sales Employees\n');

  try {
    // 1. Get all Front Sales employees who need accounts
    console.log('📊 1. Fetching Front Sales employees...');
    const { data: employees, error: empError } = await supabaseAdmin
      .from('employees')
      .select('id, full_name, email, department, user_management_email, personal_email')
      .eq('department', 'Front Sales')
      .order('full_name');

    if (empError) {
      console.log('❌ Error fetching employees:', empError.message);
      return;
    }

    console.log(`✅ Found ${employees?.length || 0} Front Sales employees\n`);

    // 2. Generate user management emails for employees who don't have them
    console.log('📧 2. Generating user management emails...');
    for (const employee of employees || []) {
      if (!employee.user_management_email) {
        console.log(`   Generating email for: ${employee.full_name}`);
        
        const { data: generatedEmail, error: genError } = await supabaseAdmin.rpc(
          'generate_employee_user_email',
          {
            employee_full_name: employee.full_name,
            employee_department: employee.department
          }
        );

        if (genError) {
          console.log(`   ❌ Error generating email for ${employee.full_name}:`, genError.message);
          continue;
        }

        // Update employee with generated email
        const { error: updateError } = await supabaseAdmin
          .from('employees')
          .update({ 
            user_management_email: generatedEmail,
            personal_email: employee.email 
          })
          .eq('id', employee.id);

        if (updateError) {
          console.log(`   ❌ Error updating ${employee.full_name}:`, updateError.message);
        } else {
          console.log(`   ✅ Generated: ${generatedEmail}`);
        }
      } else {
        console.log(`   ✅ Already has email: ${employee.user_management_email}`);
      }
    }

    // 3. Check which employees need user accounts
    console.log('\n👥 3. Checking which employees need user accounts...');
    const { data: linkingStatus, error: linkError } = await supabaseAdmin
      .from('employee_user_linking_status')
      .select('*')
      .eq('department', 'Front Sales')
      .eq('linking_status', 'NEEDS_EMAIL_GENERATION');

    if (linkError) {
      console.log('❌ Error checking linking status:', linkError.message);
    } else {
      console.log(`   Found ${linkingStatus?.length || 0} employees needing user accounts`);
    }

    // 4. Create user accounts for employees who need them
    console.log('\n🔧 4. Creating user accounts...');
    const employeesNeedingAccounts = employees?.filter(emp => {
      // Check if employee already has a user profile
      return !emp.user_management_email || emp.user_management_email === '';
    }) || [];

    console.log(`   Found ${employeesNeedingAccounts.length} employees needing accounts`);

    for (const employee of employeesNeedingAccounts) {
      console.log(`\n   📝 Creating account for: ${employee.full_name}`);
      
      try {
        // Generate user management email if not already set
        let userManagementEmail = employee.user_management_email;
        if (!userManagementEmail) {
          const { data: generatedEmail, error: genError } = await supabaseAdmin.rpc(
            'generate_employee_user_email',
            {
              employee_full_name: employee.full_name,
              employee_department: employee.department
            }
          );

          if (genError) {
            console.log(`     ❌ Error generating email:`, genError.message);
            continue;
          }

          userManagementEmail = generatedEmail;

          // Update employee with generated email
          await supabaseAdmin
            .from('employees')
            .update({ 
              user_management_email: userManagementEmail,
              personal_email: employee.email 
            })
            .eq('id', employee.id);
        }

        console.log(`     📧 User Management Email: ${userManagementEmail}`);
        console.log(`     📧 Personal Email: ${employee.email}`);

        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: userManagementEmail,
          password: 'TemporaryPassword123!', // You should generate a secure password
          email_confirm: true,
          user_metadata: {
            employee_id: employee.id,
            full_name: employee.full_name,
            department: employee.department,
            personal_email: employee.email,
            user_management_email: userManagementEmail
          }
        });

        if (authError) {
          console.log(`     ❌ Auth creation error:`, authError.message);
          continue;
        }

        console.log(`     ✅ Auth user created: ${authData.user.id}`);

        // Create user profile
        const profileData = {
          user_id: authData.user.id,
          employee_id: employee.id,
          email: userManagementEmail,
          display_name: employee.full_name,
          is_active: true,
          attributes: {
            department: employee.department,
            personal_email: employee.email,
            user_management_email: userManagementEmail
          }
        };

        const { error: profileError } = await supabaseAdmin
          .from('user_profiles')
          .insert(profileData);

        if (profileError) {
          console.log(`     ❌ Profile creation error:`, profileError.message);
        } else {
          console.log(`     ✅ User profile created successfully`);
        }

        // Create basic permissions (you can customize this)
        const basicPermissions = [
          {
            module: 'dashboard',
            can_read: true,
            can_create: false,
            can_update: false,
            can_delete: false,
            screen_visible: true
          },
          {
            module: 'leads',
            can_read: true,
            can_create: true,
            can_update: true,
            can_delete: false,
            screen_visible: true
          },
          {
            module: 'sales',
            can_read: true,
            can_create: true,
            can_update: true,
            can_delete: false,
            screen_visible: true
          }
        ];

        const { error: permError } = await supabaseAdmin.rpc(
          'create_user_permissions_from_template',
          {
            p_user_id: authData.user.id,
            p_role_template: basicPermissions
          }
        );

        if (permError) {
          console.log(`     ⚠️  Permissions creation error:`, permError.message);
        } else {
          console.log(`     ✅ Basic permissions assigned`);
        }

        console.log(`     🎉 Account creation completed for ${employee.full_name}`);

      } catch (error) {
        console.log(`     ❌ Error creating account for ${employee.full_name}:`, error.message);
      }
    }

    // 5. Show final status
    console.log('\n📊 5. Final Status Report:');
    const { data: finalStatus, error: statusError } = await supabaseAdmin
      .from('employee_user_linking_status')
      .select('*')
      .eq('department', 'Front Sales')
      .order('employee_name');

    if (statusError) {
      console.log('❌ Error fetching final status:', statusError.message);
    } else {
      console.log('\n   Employee Account Status:');
      finalStatus?.forEach((status, index) => {
        const icon = status.linking_status === 'LINKED' ? '✅' : '❌';
        console.log(`   ${index + 1}. ${icon} ${status.employee_name}`);
        console.log(`      Status: ${status.linking_status}`);
        console.log(`      System Email: ${status.system_email || 'Not set'}`);
        console.log(`      Profile Email: ${status.profile_email || 'No profile'}`);
        console.log('');
      });
    }

    console.log('\n✅ Front Sales user creation process completed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Users can login with their user management emails');
    console.log('   2. Default password is: TemporaryPassword123!');
    console.log('   3. Users should change their passwords on first login');
    console.log('   4. Review and adjust permissions as needed');

  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

// Run the script
createFrontSalesUsers(); 
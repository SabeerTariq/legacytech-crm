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

async function createMissingAccounts() {
  console.log('🔧 Creating Missing User Accounts for Front Sales Employees\n');

  try {
    // 1. Get employees who have user management emails but no user profiles
    console.log('📊 1. Finding employees needing user accounts...');
    const { data: employeesNeedingAccounts, error: empError } = await supabaseAdmin
      .from('employee_user_linking_status')
      .select('*')
      .eq('department', 'Front Sales')
      .eq('linking_status', 'NEEDS_ACCOUNT_CREATION')
      .order('employee_name');

    if (empError) {
      console.log('❌ Error fetching employees:', empError.message);
      return;
    }

    console.log(`✅ Found ${employeesNeedingAccounts?.length || 0} employees needing user accounts\n`);

    if (!employeesNeedingAccounts || employeesNeedingAccounts.length === 0) {
      console.log('✅ All employees already have user accounts!');
      return;
    }

    // 2. Create user accounts for each employee
    console.log('🔧 2. Creating user accounts...');
    
    for (const employee of employeesNeedingAccounts) {
      console.log(`\n   📝 Creating account for: ${employee.employee_name}`);
      console.log(`   📧 User Management Email: ${employee.system_email}`);
      console.log(`   📧 Personal Email: ${employee.original_email}`);
      
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: employee.system_email,
          password: 'TemporaryPassword123!',
          email_confirm: true,
          user_metadata: {
            employee_id: employee.employee_id,
            full_name: employee.employee_name,
            department: employee.department,
            personal_email: employee.original_email,
            user_management_email: employee.system_email
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
          employee_id: employee.employee_id,
          email: employee.system_email,
          display_name: employee.employee_name,
          is_active: true,
          attributes: {
            department: employee.department,
            personal_email: employee.original_email,
            user_management_email: employee.system_email
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

        // Create basic permissions
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

        console.log(`     🎉 Account creation completed for ${employee.employee_name}`);

      } catch (error) {
        console.log(`     ❌ Error creating account for ${employee.employee_name}:`, error.message);
      }
    }

    // 3. Show final status
    console.log('\n📊 3. Final Status Report:');
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

    // 4. Show team members summary
    console.log('👥 4. Team Members Summary:');
    const { data: teamMembers, error: tmError } = await supabaseAdmin
      .from('team_members')
      .select(`
        member_id,
        role,
        teams!inner(name, department),
        employees!inner(full_name, user_management_email)
      `)
      .eq('teams.department', 'Front Sales')
      .order('teams.name');

    if (tmError) {
      console.log('❌ Error fetching team members:', tmError.message);
    } else {
      let currentTeam = '';
      teamMembers?.forEach((member) => {
        if (member.teams.name !== currentTeam) {
          currentTeam = member.teams.name;
          console.log(`\n   🏢 ${currentTeam}:`);
        }
        const icon = member.role === 'leader' ? '👑' : '👤';
        console.log(`      ${icon} ${member.employees.full_name} (${member.role})`);
        console.log(`         Email: ${member.employees.user_management_email}`);
      });
    }

    console.log('\n✅ User account creation completed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Users can login with their user management emails');
    console.log('   2. Default password is: TemporaryPassword123!');
    console.log('   3. Users should change their passwords on first login');
    console.log('   4. Check the sales management dashboard for team members');

  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

// Run the script
createMissingAccounts(); 
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

async function fixTeamMembers() {
  console.log('🔧 Fixing Team Members and User Accounts\n');

  try {
    // 1. Get all Front Sales employees
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

    // 2. Get existing teams
    console.log('🏢 2. Fetching existing teams...');
    const { data: teams, error: teamsError } = await supabaseAdmin
      .from('teams')
      .select('id, name, department')
      .eq('department', 'Front Sales')
      .order('name');

    if (teamsError) {
      console.log('❌ Error fetching teams:', teamsError.message);
      return;
    }

    console.log(`✅ Found ${teams?.length || 0} Front Sales teams\n`);

    // 3. Get existing team members
    console.log('👥 3. Checking existing team members...');
    const { data: existingMembers, error: membersError } = await supabaseAdmin
      .from('team_members')
      .select('member_id, team_id, role')
      .in('team_id', teams?.map(t => t.id) || []);

    if (membersError) {
      console.log('❌ Error fetching team members:', membersError.message);
      return;
    }

    const existingMemberIds = existingMembers?.map(m => m.member_id) || [];
    console.log(`✅ Found ${existingMembers?.length || 0} existing team members\n`);

    // 4. Add missing team members
    console.log('➕ 4. Adding missing team members...');
    const employeesNeedingTeams = employees?.filter(emp => !existingMemberIds.includes(emp.id)) || [];
    
    if (employeesNeedingTeams.length > 0) {
      console.log(`   Found ${employeesNeedingTeams.length} employees needing team assignment`);
      
      // Assign to teams in round-robin fashion
      for (let i = 0; i < employeesNeedingTeams.length; i++) {
        const employee = employeesNeedingTeams[i];
        const team = teams?.[i % teams.length];
        
        if (team) {
          const { error: addError } = await supabaseAdmin
            .from('team_members')
            .insert({
              member_id: employee.id,
              team_id: team.id,
              role: 'member'
            });

          if (addError) {
            console.log(`   ❌ Error adding ${employee.full_name} to ${team.name}:`, addError.message);
          } else {
            console.log(`   ✅ Added ${employee.full_name} to ${team.name}`);
          }
        }
      }
    } else {
      console.log('   ✅ All employees are already team members');
    }

    // 5. Create user accounts for employees who need them
    console.log('\n🔧 5. Creating user accounts for employees who need them...');
    const employeesNeedingAccounts = employees?.filter(emp => {
      // Check if employee already has a user profile
      return !emp.user_management_email || emp.user_management_email === '';
    }) || [];

    console.log(`   Found ${employeesNeedingAccounts.length} employees needing user accounts`);

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
          password: 'TemporaryPassword123!',
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

        console.log(`     🎉 Account creation completed for ${employee.full_name}`);

      } catch (error) {
        console.log(`     ❌ Error creating account for ${employee.full_name}:`, error.message);
      }
    }

    // 6. Show final status
    console.log('\n📊 6. Final Team Members Status:');
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

    // 7. Show team members
    console.log('👥 7. Team Members by Team:');
    const { data: teamMembers, error: tmError } = await supabaseAdmin
      .from('team_members')
      .select(`
        member_id,
        role,
        teams!inner(name, department),
        employees!inner(full_name, user_management_email)
      `)
      .eq('teams.department', 'Front Sales')
      .order('teams.name')
      .order('employees.full_name');

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

    console.log('\n✅ Team members fix completed!');
    console.log('\n📝 Next Steps:');
    console.log('   1. Users can login with their user management emails');
    console.log('   2. Default password is: TemporaryPassword123!');
    console.log('   3. Users should change their passwords on first login');
    console.log('   4. Check the sales management dashboard for team members');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  }
}

// Run the fix
fixTeamMembers(); 
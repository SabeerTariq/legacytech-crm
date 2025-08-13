import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_PUBLISHABLE_KEY
);

async function checkTeamMembers() {
  console.log('🔍 Checking Team Members...\n');

  try {
    // Check all teams
    console.log('📋 All Teams:');
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .eq('department', 'Front Sales');

    if (teamsError) {
      console.log('❌ Error fetching teams:', teamsError);
    } else {
      teams.forEach(team => {
        console.log(`  - Team: ${team.name} (ID: ${team.id})`);
      });
    }

    // Check all team members
    console.log('\n👥 All Team Members:');
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select(`
        *,
        teams!inner(name),
        employees!inner(full_name, email)
      `)
      .eq('teams.department', 'Front Sales');

    if (membersError) {
      console.log('❌ Error fetching team members:', membersError);
    } else {
      console.log(`  - Total team members: ${teamMembers.length}`);
      teamMembers.forEach(member => {
        console.log(`    - ${member.employees.full_name} (${member.employees.email}) in team "${member.teams.name}" (Role: ${member.role})`);
      });
    }

    // Check for duplicate team memberships
    console.log('\n🔍 Checking for Duplicate Memberships:');
    const memberCounts = {};
    teamMembers.forEach(member => {
      const key = `${member.team_id}-${member.member_id}`;
      memberCounts[key] = (memberCounts[key] || 0) + 1;
    });

    const duplicates = Object.entries(memberCounts).filter(([key, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('❌ Found duplicate memberships:');
      duplicates.forEach(([key, count]) => {
        console.log(`    - ${key}: ${count} times`);
      });
    } else {
      console.log('✅ No duplicate memberships found');
    }

    // Check specific team mentioned in error
    const specificTeamId = '20f1cfe8-0789-4606-bc6a-c0d3faa52320';
    const specificMemberId = 'c03345a8-e1dc-424e-b835-f4b1002ee8af';

    console.log(`\n🔍 Checking Specific Team (${specificTeamId}):`);
    const { data: specificTeam, error: specificTeamError } = await supabase
      .from('teams')
      .select('*')
      .eq('id', specificTeamId)
      .single();

    if (specificTeamError) {
      console.log('❌ Error fetching specific team:', specificTeamError);
    } else {
      console.log(`  - Team Name: ${specificTeam.name}`);
      console.log(`  - Department: ${specificTeam.department}`);
    }

    console.log(`\n🔍 Checking Specific Member (${specificMemberId}):`);
    const { data: specificMember, error: specificMemberError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', specificMemberId)
      .single();

    if (specificMemberError) {
      console.log('❌ Error fetching specific member:', specificMemberError);
    } else {
      console.log(`  - Member Name: ${specificMember.full_name}`);
      console.log(`  - Email: ${specificMember.email}`);
      console.log(`  - Department: ${specificMember.department}`);
    }

    // Check if this specific combination already exists
    console.log(`\n🔍 Checking if member ${specificMemberId} is already in team ${specificTeamId}:`);
    const { data: existingMembership, error: existingError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', specificTeamId)
      .eq('member_id', specificMemberId);

    if (existingError) {
      console.log('❌ Error checking existing membership:', existingError);
    } else {
      console.log(`  - Found ${existingMembership.length} existing memberships for this combination`);
      existingMembership.forEach(membership => {
        console.log(`    - ID: ${membership.id}, Role: ${membership.role}, Joined: ${membership.joined_at}`);
      });
    }

    // Show all employees available for team assignment
    console.log('\n👥 All Front Sales Employees:');
    const { data: employees, error: employeesError } = await supabase
      .from('employees')
      .select('*')
      .eq('department', 'Front Sales')
      .order('full_name');

    if (employeesError) {
      console.log('❌ Error fetching employees:', employeesError);
    } else {
      employees.forEach(employee => {
        const isInAnyTeam = teamMembers.some(member => member.member_id === employee.id);
        const isInSpecificTeam = teamMembers.some(member => 
          member.member_id === employee.id && member.team_id === specificTeamId
        );
        console.log(`  - ${employee.full_name} (${employee.email}) - In any team: ${isInAnyTeam}, In specific team: ${isInSpecificTeam}`);
      });
    }

  } catch (error) {
    console.error('Error in checkTeamMembers:', error);
  }
}

checkTeamMembers(); 
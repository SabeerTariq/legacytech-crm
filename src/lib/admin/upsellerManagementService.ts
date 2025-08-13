import { supabase } from '../../integrations/supabase/client';
import {
  UpsellerTeam,
  UpsellerTeamMember,
  UpsellerTargetManagement,
  CreateTeamRequest,
  UpdateTeamRequest,
  AddTeamMemberRequest,
  SetTargetRequest,
  TeamPerformanceSummary,
  UpsellerPerformanceSummary,
  DashboardStats,
  EmployeeBasic
} from '../../types/upsellerManagement';

export class UpsellerManagementService {
  // Team Management
  static async createTeam(teamData: CreateTeamRequest, createdBy: string): Promise<UpsellerTeam> {
    const { data: team, error } = await supabase
      .from('upseller_teams')
      .insert({
        name: teamData.name,
        description: teamData.description,
        team_lead_id: teamData.team_lead_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Add team members
    if (teamData.member_ids.length > 0) {
      const memberPromises = teamData.member_ids.map(employeeId =>
        this.addTeamMember({
          team_id: team.id,
          employee_id: employeeId,
          role: 'member'
        })
      );
      await Promise.all(memberPromises);
    }

    return team;
  }

  static async getTeams(): Promise<UpsellerTeam[]> {
    // Only get teams that have members with user accounts
    const { data, error } = await supabase
      .from('upseller_teams')
      .select(`
        *,
        team_lead:employees!upseller_teams_team_lead_id_fkey(id, full_name, email, department)
      `)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    // Get member counts separately and map them to the teams
    const teamsWithCounts = await Promise.all(
      (data || []).map(async (team) => {
        // Only count members who have user accounts
        const { count } = await supabase
          .from('upseller_team_members')
          .select(`
            *,
            employee:employees!upseller_team_members_employee_id_fkey(id, user_management_email)
          `, { count: 'exact', head: true })
          .eq('team_id', team.id)
          .eq('is_active', true)
          .not('employee.user_management_email', 'is', null);

        return {
          ...team,
          member_count: count || 0
        };
      })
    );

    // Only return teams that have at least one member with a user account
    return teamsWithCounts.filter(team => team.member_count > 0);
  }

  static async updateTeam(teamId: string, updates: UpdateTeamRequest): Promise<UpsellerTeam> {
    const { data, error } = await supabase
      .from('upseller_teams')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', teamId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteTeam(teamId: string): Promise<void> {
    const { error } = await supabase
      .from('upseller_teams')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', teamId);

    if (error) throw error;
  }

  // Team Member Management
  static async addTeamMember(memberData: AddTeamMemberRequest): Promise<UpsellerTeamMember> {
    const { data, error } = await supabase
      .from('upseller_team_members')
      .insert({
        team_id: memberData.team_id,
        employee_id: memberData.employee_id,
        role: memberData.role || 'member',
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async removeTeamMember(teamId: string, employeeId: string): Promise<void> {
    const { error } = await supabase
      .from('upseller_team_members')
      .update({ is_active: false })
      .eq('team_id', teamId)
      .eq('employee_id', employeeId);

    if (error) throw error;
  }

  static async getTeamMembers(teamId: string): Promise<UpsellerTeamMember[]> {
    const { data, error } = await supabase
      .from('upseller_team_members')
      .select(`
        *,
        employee:employees!upseller_team_members_employee_id_fkey(id, full_name, email, department, position),
        team:upseller_teams!upseller_team_members_team_id_fkey(id, name)
      `)
      .eq('team_id', teamId)
      .eq('is_active', true)
      .order('joined_at');

    if (error) throw error;
    return data || [];
  }

  // Target Management
  static async setTarget(targetData: SetTargetRequest, setBy: string): Promise<UpsellerTargetManagement> {
    const { data, error } = await supabase
      .from('upseller_targets_management')
      .upsert({
        employee_id: targetData.employee_id,
        month: targetData.month,
        target_accounts: targetData.target_accounts,
        target_gross: targetData.target_gross,
        target_cash_in: targetData.target_cash_in,
        set_by: setBy,
        notes: targetData.notes,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getTargets(month?: string): Promise<UpsellerTargetManagement[]> {
    let query = supabase
      .from('upseller_targets_management')
      .select(`
        *,
        employee:employees!upseller_targets_management_employee_id_fkey(id, full_name, email, department, user_management_email),
        set_by_employee:employees!upseller_targets_management_set_by_fkey(id, full_name, email)
      `)
      .order('month', { ascending: false });

    if (month) {
      query = query.eq('month', month);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    // Only return targets for employees who have user accounts
    return (data || []).filter(target => target.employee?.user_management_email);
  }

  // Performance Monitoring
  static async getTeamPerformance(month: string): Promise<TeamPerformanceSummary[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_team_performance_summary', { p_month: month });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getTeamPerformance:', error);
      throw error;
    }
  }

  static async getUpsellerPerformance(month: string): Promise<UpsellerPerformanceSummary[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_upseller_performance_summary', { p_month: month });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error in getUpsellerPerformance:', error);
      throw error;
    }
  }

  static async getDashboardStats(): Promise<DashboardStats> {
    // Get basic counts for employees with user accounts only
    const [teamsResult, targetsResult, performanceResult] = await Promise.all([
      supabase.from('upseller_teams').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('upseller_targets_management').select('target_gross, target_cash_in, employee_id', { count: 'exact' }),
      supabase.from('upseller_performance').select('total_gross, total_cash_in, seller_id', { count: 'exact' })
    ]);

    // Get count of employees with user accounts
    const { count: upsellerCount } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('department', 'Upseller')
      .not('user_management_email', 'is', null);

    const totalTeams = teamsResult.count || 0;
    
    // Calculate totals only for employees with user accounts
    let totalTargets = 0;
    let totalAchieved = 0;
    
    if (targetsResult.data && targetsResult.data.length > 0) {
      // Get employee IDs with user accounts
      const { data: employeesWithAccounts } = await supabase
        .from('employees')
        .select('id')
        .eq('department', 'Upseller')
        .not('user_management_email', 'is', null);
      
      const employeeIds = employeesWithAccounts?.map(e => e.id) || [];
      
      totalTargets = targetsResult.data
        .filter(t => employeeIds.includes(t.employee_id))
        .reduce((sum, t) => sum + (t.target_gross || 0), 0);
    }
    
    if (performanceResult.data && performanceResult.data.length > 0) {
      // Get employee IDs with user accounts
      const { data: employeesWithAccounts } = await supabase
        .from('employees')
        .select('id')
        .eq('department', 'Upseller')
        .not('user_management_email', 'is', null);
      
      const employeeIds = employeesWithAccounts?.map(e => e.id) || [];
      
      totalAchieved = performanceResult.data
        .filter(p => employeeIds.includes(p.seller_id))
        .reduce((sum, p) => sum + (p.total_cash_in || 0), 0);
    }

    return {
      total_upsellers: upsellerCount || 0,
      total_teams: totalTeams,
      active_teams: totalTeams,
      total_target: totalTargets,
      total_achieved: totalAchieved,
      total_remaining: Math.max(0, totalTargets - totalAchieved),
      average_performance: totalTargets > 0 ? (totalAchieved / totalTargets) * 100 : 0
    };
  }

  // Utility functions
  static async getAvailableEmployees(): Promise<any[]> {
    // Only get employees who have auth users with upseller role
    const { data, error } = await supabase
      .from('employees')
      .select(`
        id, 
        full_name, 
        email, 
        department, 
        job_title
      `)
      .eq('department', 'Upseller')
      .not('user_management_email', 'is', null) // Only employees with user accounts
      .order('full_name');

    if (error) throw error;
    return data || [];
  }

  static async getTeamById(teamId: string): Promise<UpsellerTeam | null> {
    const { data, error } = await supabase
      .from('upseller_teams')
      .select(`
        *,
        team_lead:employees!upseller_teams_team_lead_id_fkey(id, full_name, email, department)
      `)
      .eq('id', teamId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}

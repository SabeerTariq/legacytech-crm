export interface UpsellerTeam {
  id: string;
  name: string;
  description?: string;
  team_lead_id?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  team_lead?: EmployeeBasic;
  member_count?: number;
}

export interface UpsellerTeamMember {
  id: string;
  team_id: string;
  employee_id: string;
  role: 'member' | 'senior' | 'junior';
  joined_at: string;
  is_active: boolean;
  employee?: EmployeeBasic;
  team?: UpsellerTeam;
}

export interface UpsellerTargetManagement {
  id: string;
  employee_id: string;
  month: string;
  target_accounts: number;
  target_gross: number;
  target_cash_in: number;
  set_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  employee?: EmployeeBasic;
  set_by_employee?: EmployeeBasic;
}

export interface EmployeeBasic {
  id: string;
  full_name: string;
  email: string;
  department: string;
  position?: string;
}

export interface TeamPerformanceSummary {
  team_id: string;
  team_name: string;
  member_count: number;
  total_target: number;
  achieved_target: number;
  remaining_target: number;
  average_performance: number;
}

export interface UpsellerPerformanceSummary {
  employee_id: string;
  employee_name: string;
  team_name: string;
  month: string;
  target_accounts: number;
  target_gross: number;
  target_cash_in: number;
  achieved_accounts: number;
  achieved_gross: number;
  achieved_cash_in: number;
  performance_percentage: number;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  team_lead_id?: string;
  member_ids: string[];
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  team_lead_id?: string;
  is_active?: boolean;
}

export interface AddTeamMemberRequest {
  team_id: string;
  employee_id: string;
  role?: 'member' | 'senior' | 'junior';
}

export interface SetTargetRequest {
  employee_id: string;
  month: string;
  target_accounts: number;
  target_gross: number;
  target_cash_in: number;
  notes?: string;
}

export interface DashboardStats {
  total_upsellers: number;
  total_teams: number;
  active_teams: number;
  total_target: number;
  total_achieved: number;
  total_remaining: number;
  average_performance: number;
  top_performing_team?: TeamPerformanceSummary;
  top_performing_upseller?: UpsellerPerformanceSummary;
}

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { supabase } from '../../integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  UserPlus, 
  Target, 
  BarChart3, 
  Trophy,
  Award,
  TrendingUp,
  DollarSign
} from 'lucide-react';

interface Team {
  id: string;
  name: string;
  description: string;
  team_lead_id: string;
  team_leader_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  employee_id: string;
  member_name: string;
  role: string;
  joined_at: string;
  is_active: boolean;
}

interface TeamPerformance {
  team_id: string;
  team_name: string;
  team_leader_name: string;
  member_count: number | string; // Can be bigint from database
  total_accounts_achieved: number;
  total_gross: number;
  total_cash_in: number;
  total_remaining: number;
  target_cash_in: number;
  performance_rank: number | string; // Can be bigint from database
  completion_rate: number | string; // Can be numeric from database
}

// Add new interface that matches the function output
interface UpsellerTeamPerformanceSummary {
  seller_id: string;
  seller_name: string;
  accounts_achieved: number;
  total_gross: number;
  total_cash_in: number;
  total_remaining: number;
  target_accounts: number;
  target_gross: number;
  target_cash_in: number;
  performance_rank: number | string; // Can be bigint from database
}

interface MemberTarget {
  id: string;
  seller_id: string;
  seller_name: string;
  month: string;
  target_cash_in: number;
  created_at: string;
  updated_at: string;
}

interface UpsellerEmployee {
  id: string;
  email: string;
  full_name: string;
  department: string;
  role: string;
  hire_date: string;
  status: string;
}

const UpsellerManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [memberTargets, setMemberTargets] = useState<MemberTarget[]>([]);
  const [employees, setEmployees] = useState<UpsellerEmployee[]>([]);
  const [currentMonth, setCurrentMonth] = useState('');
  
  // Add state for raw data
  const [rawPerformanceData, setRawPerformanceData] = useState<UpsellerTeamPerformanceSummary[]>([]);
  const [userProfilesData, setUserProfilesData] = useState<{user_id: string; email: string; display_name: string; employee_id: string}[]>([]);
  
  // Dialog states
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [selectedTarget, setSelectedTarget] = useState<MemberTarget | null>(null);

  // Form states
  const [teamForm, setTeamForm] = useState({
    name: '',
    description: '',
    team_lead_id: 'no-leader'
  });

  const [memberForm, setMemberForm] = useState({
    team_id: '',
    employee_id: '', // This will now be employee_id
    role: 'member'
  });

  const [targetForm, setTargetForm] = useState({
    seller_id: '',
    target_cash_in: 0
  });

  // Check if user has permission to access this component
  const hasPermission = useCallback(() => {
    return !!user; // User must be authenticated
  }, [user]);

  // Initialize current month
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();
    // Format as YYYY-MM (not YYYY-MM-DD)
    const monthString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;
    
    console.log('Setting currentMonth to:', monthString);
    setCurrentMonth(monthString);
  }, []);

  // Load all data
  const loadData = useCallback(async () => {
    if (!hasPermission()) {
      return;
    }
    
    // Don't load data if currentMonth is not set yet
    if (!currentMonth || currentMonth === '') {
      return;
    }

    try {
      setLoading(true);

      // Load teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('upseller_teams')
        .select(`
          *,
          team_lead:employees!upseller_teams_team_lead_id_fkey(id, full_name, email)
        `)
        .eq('is_active', true)
        .order('name');

      if (teamsError) throw teamsError;

      // Load team members
      const { data: membersData, error: membersError } = await supabase
        .from('upseller_team_members')
        .select(`
          *,
          employee:employees!upseller_team_members_employee_id_fkey(id, full_name, email)
        `)
        .eq('is_active', true)
        .order('joined_at');

      if (membersError) throw membersError;

      // Load team performance
      // Validate that currentMonth is not empty before making the call
      if (!currentMonth || currentMonth.trim() === '') {
        throw new Error('Invalid month parameter: month cannot be empty');
      }
      
      // Convert string to DATE for the function call
      // Ensure currentMonth is in YYYY-MM format before creating Date
      if (!currentMonth || currentMonth.trim() === '') {
        throw new Error('Invalid month parameter: month cannot be empty');
      }
      
      // Validate the month format (should be YYYY-MM)
      if (!/^\d{4}-\d{2}$/.test(currentMonth)) {
        throw new Error(`Invalid month format: ${currentMonth}. Expected format: YYYY-MM`);
      }
      
      const monthDate = new Date(currentMonth + '-01').toISOString().split('T')[0];
      
      const { data: performanceData, error: performanceError } = await supabase
        .rpc('get_upseller_team_performance_summary', { p_month: monthDate });

      if (performanceError) {
        throw performanceError;
      }

      // Load member targets
      // Convert currentMonth (YYYY-MM) to a date for the database query
      const targetsMonthDate = new Date(currentMonth + '-01').toISOString().split('T')[0];
      
      const { data: targetsData, error: targetsError } = await supabase
        .from('upseller_targets')
        .select('*')
        .eq('month', targetsMonthDate)
        .order('created_at');

      if (targetsError) throw targetsError;

      // Load Upseller employees with upseller role
      // Use backend API to avoid RLS recursion issues
      const response = await fetch('/api/admin/get-user-roles');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user roles from API');
      }
      
      const userData = await response.json();
      
      // Get all employees in Upseller department
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('department', 'Upseller')
        .order('full_name');

      if (employeesError) throw employeesError;

      // Get user profiles for the employees
      const { data: userProfilesData, error: userProfilesError } = await supabase
        .from('user_profiles')
        .select('user_id, email, display_name, employee_id')
        .in('employee_id', employeesData?.map(e => e.id) || []);

      if (userProfilesError) throw userProfilesError;

      // Filter employees who have upseller role using the API data
      // Since the API now returns user profiles instead of roles, we'll include all upseller employees
      const upsellerUserIds = Object.keys(userData);
      
      const upsellerEmployeeIds = userProfilesData
        ?.filter(up => upsellerUserIds.includes(up.user_id))
        ?.map(up => up.employee_id) || [];

      const filteredEmployees = employeesData?.filter(emp => 
        upsellerEmployeeIds.includes(emp.id)
      ) || [];

      // Data loaded successfully
      
      const processedTeams = teamsData?.map(t => ({
        ...t,
        team_leader_name: t.team_lead?.full_name || 'Unassigned'
      })) || [];
      
      setTeams(processedTeams);
      
      // Map team members with employee names
      const processedTeamMembers = membersData?.map(m => {
        return {
          ...m,
          member_name: m.employee?.full_name || 'Unknown Employee'
        };
      }) || [];
      
      setTeamMembers(processedTeamMembers);
      
      // Aggregate team performance from individual member performance
      // Note: The 'remaining' calculation includes:
      // 1. Upsell form remaining amounts (from upsell transactions)
      // 2. Project assignment receivables (from assigned projects)
      // This matches the calculation shown in the Upseller Dashboard
      // 
      // Target Concept: Each member has a target_cash_in field only
      // The completion rate is calculated as: (total_cash_in / target_cash_in) * 100
      // This matches the actual database schema in upseller_targets table
      const aggregatedTeamPerformance = aggregateTeamPerformance(
        performanceData || [], 
        processedTeams, 
        processedTeamMembers,
        userProfilesData || [],
        targetsData || []
      );
      
      setTeamPerformance(aggregatedTeamPerformance);
      
      // Store raw data for member performance display
      setRawPerformanceData(performanceData || []);
      setUserProfilesData(userProfilesData || []);

      // Map member targets with employee names
      setMemberTargets(targetsData?.map(t => {
        const employee = filteredEmployees.find(e => e.id === t.seller_id);
        return {
          ...t,
          seller_id: t.seller_id,
          seller_name: employee?.full_name || 'Unknown Employee'
        };
      }) || []);

      // Transform employees data to match UpsellerEmployee interface
      const transformedEmployees = filteredEmployees.map(employee => {
        // Find the corresponding user profile for email
        const userProfile = userProfilesData?.find(up => up.employee_id === employee.id);
        return {
          id: employee.id,
          email: userProfile?.email || employee.email || '',
          full_name: employee.full_name,
          department: employee.department,
          role: 'upseller', // Assuming all upseller employees have this role
          hire_date: new Date().toISOString().split('T')[0], // Default to today
          status: 'active'
        };
      })
      .sort((a, b) => a.full_name.localeCompare(b.full_name));

      setEmployees(transformedEmployees);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load Upseller data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentMonth, hasPermission, toast]);

  // Load data when currentMonth changes
  useEffect(() => {
    if (currentMonth && currentMonth !== '') {
      loadData();
    }
  }, [currentMonth]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle team creation/update
  const handleTeamSubmit = async () => {
    try {
      if (!teamForm.name) {
        toast({
          title: "Error",
          description: "Please enter a team name",
          variant: "destructive",
        });
        return;
      }

      const teamData = {
        name: teamForm.name,
        description: teamForm.description,
        team_lead_id: teamForm.team_lead_id === 'no-leader' ? null : teamForm.team_lead_id,
      };

      if (selectedTeam) {
        // Update existing team
        const { error } = await supabase
          .from('upseller_teams')
          .update(teamData)
          .eq('id', selectedTeam.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Team updated successfully",
        });
      } else {
        // Create new team
        const { error } = await supabase
          .from('upseller_teams')
          .insert(teamData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Team created successfully",
        });
      }

      setIsTeamDialogOpen(false);
      setSelectedTeam(null);
      setTeamForm({
        name: '',
        description: '',
        team_lead_id: 'no-leader'
      });
      loadData();

    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        title: "Error",
        description: "Failed to save team",
        variant: "destructive",
      });
    }
  };

  // Handle team member addition
  const handleMemberSubmit = async () => {
    try {
      if (!memberForm.team_id || !memberForm.employee_id) {
        toast({
          title: "Error",
          description: "Please select both team and member",
          variant: "destructive",
        });
        return;
      }

      // Check if member is already in this team
      const { data: existingMember, error: checkError } = await supabase
        .from('upseller_team_members')
        .select('*')
        .eq('team_id', memberForm.team_id)
        .eq('employee_id', memberForm.employee_id)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingMember) {
        toast({
          title: "Error",
          description: "This member is already part of this team",
          variant: "destructive",
        });
        return;
      }

      const memberData = {
        team_id: memberForm.team_id,
        employee_id: memberForm.employee_id,
        role: memberForm.role
      };

      const { error } = await supabase
        .from('upseller_team_members')
        .insert(memberData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member added to team successfully",
      });

      setIsMemberDialogOpen(false);
      setMemberForm({
        team_id: '',
        employee_id: '',
        role: 'member'
      });
      loadData();

    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member to team",
        variant: "destructive",
      });
    }
  };

  // Handle member target creation/update
  const handleTargetSubmit = async () => {
    try {
      if (!targetForm.seller_id || targetForm.target_cash_in <= 0) {
        toast({
          title: "Error",
          description: "Please fill in all required fields: Employee and Target Cash In",
          variant: "destructive",
        });
        return;
      }

      const targetData = {
        seller_id: targetForm.seller_id,
        month: currentMonth, // Always use current month for target
        target_cash_in: targetForm.target_cash_in // Use the single target_amount field
      };

      if (selectedTarget) {
        // Update existing target
        const { error } = await supabase
          .from('upseller_targets')
          .update(targetData)
          .eq('id', selectedTarget.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Target updated successfully",
        });
      } else {
        // Create new target
        const { error } = await supabase
          .from('upseller_targets')
          .insert(targetData);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Target created successfully",
        });
      }

      setIsTargetDialogOpen(false);
      setSelectedTarget(null);
      setTargetForm({
        seller_id: '',
        target_cash_in: 0
      });
      loadData();

    } catch (error) {
      console.error('Error saving target:', error);
      toast({
        title: "Error",
        description: "Failed to save target",
        variant: "destructive",
      });
    }
  };

  // Edit team
  const editTeam = (team: Team) => {
    setSelectedTeam(team);
    setTeamForm({
      name: team.name,
      description: team.description,
      team_lead_id: team.team_lead_id || 'no-leader'
    });
    setIsTeamDialogOpen(true);
  };

  // Delete team
  const deleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      const { error } = await supabase
        .from('upseller_teams')
        .update({ is_active: false })
        .eq('id', teamId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
      loadData();

    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive",
      });
    }
  };

  // Remove member from team
  const removeMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) return;

    try {
      const { error } = await supabase
        .from('upseller_team_members')
        .update({ is_active: false })
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed from team successfully",
      });
      loadData();

    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member from team",
        variant: "destructive",
      });
    }
  };

  // Edit target
  const editTarget = (target: MemberTarget) => {
    setSelectedTarget(target);
    setTargetForm({
      seller_id: target.seller_id,
      target_cash_in: target.target_cash_in
    });
    setIsTargetDialogOpen(true);
  };

  // Delete target
  const deleteTarget = async (targetId: string) => {
    if (!confirm('Are you sure you want to delete this target?')) return;

    try {
      const { error } = await supabase
        .from('upseller_targets')
        .delete()
        .eq('id', targetId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Target deleted successfully",
      });
      loadData();

    } catch (error) {
      console.error('Error deleting target:', error);
      toast({
        title: "Error",
        description: "Failed to delete target",
        variant: "destructive",
      });
    }
  };

  // Get team members for a specific team
  const getTeamMembers = (teamId: string) => {
    return teamMembers.filter(member => member.team_id === teamId);
  };

  // Get member targets for a team
  const getMemberTargets = (teamId: string) => {
    const teamMemberIds = teamMembers
      .filter(member => member.team_id === teamId)
      .map(member => member.employee_id);
    
    // Convert currentMonth to date format for comparison with database dates
    const filterMonthDate = new Date(currentMonth + '-01').toISOString().split('T')[0];
    
    return memberTargets.filter(target => 
      teamMemberIds.includes(target.seller_id) && target.month === filterMonthDate
    );
  };

  // Get team performance for current month
  const getTeamPerformance = (teamId: string) => {
    return teamPerformance.find(perf => perf.team_id === teamId);
  };

  // Aggregate team performance from individual member performance
  // Note: The 'remaining' calculation includes:
  // 1. Upsell form remaining amounts (from upsell transactions)
  // 2. Project assignment receivables (from assigned projects)
  // This matches the calculation shown in the Upseller Dashboard
  // 
  // Target Concept: Each member has a target_cash_in field only
  // The completion rate is calculated as: (total_cash_in / target_cash_in) * 100
  // This matches the actual database schema in upseller_targets table
  const aggregateTeamPerformance = (memberPerformance: UpsellerTeamPerformanceSummary[], teams: Team[], teamMembers: TeamMember[], userProfiles: {user_id: string; email: string; display_name: string; employee_id: string}[], memberTargets: MemberTarget[]) => {
    const teamPerformanceMap = new Map();

    // Initialize team performance for each team
    teams.forEach(team => {
      teamPerformanceMap.set(team.id, {
        team_id: team.id,
        team_name: team.name,
        team_leader_name: team.team_leader_name,
        member_count: 0,
        total_accounts_achieved: 0,
        total_gross: 0,
        total_cash_in: 0,
        total_remaining: 0,
        target_cash_in: 0,
        performance_rank: 0,
        completion_rate: 0
      });
    });

    // Aggregate member performance by team
    memberPerformance.forEach(member => {
      // Find which team this member belongs to by matching user_id with employee_id
      const userProfile = userProfiles.find(up => up.user_id === member.seller_id);
      if (userProfile) {
        const teamMember = teamMembers.find(tm => tm.employee_id === userProfile.employee_id);
        if (teamMember) {
          const teamId = teamMember.team_id;
          const teamData = teamPerformanceMap.get(teamId);
          
          if (teamData) {
            teamData.member_count += 1;
            teamData.total_accounts_achieved += member.accounts_achieved || 0;
            teamData.total_gross += (typeof member.total_gross === 'string' ? parseFloat(member.total_gross) : member.total_gross) || 0;
            teamData.total_cash_in += (typeof member.total_cash_in === 'string' ? parseFloat(member.total_cash_in) : member.total_cash_in) || 0;
            teamData.total_remaining += (typeof member.total_remaining === 'string' ? parseFloat(member.total_remaining) : member.total_remaining) || 0;
            teamData.target_cash_in += member.target_cash_in || 0; // Aggregate target_cash_in
          }
        }
      }
    });

    // Add target data to the aggregation
    memberTargets.forEach(target => {
      // Find which team this target belongs to by matching seller_id with employee_id
      const teamMember = teamMembers.find(tm => tm.employee_id === target.seller_id);
      if (teamMember) {
        const teamId = teamMember.team_id;
        const teamData = teamPerformanceMap.get(teamId);
        
        if (teamData) {
          // Add target values (these might already be included from performance data, but we ensure they're set)
          teamData.target_cash_in += target.target_cash_in; // Aggregate target_cash_in
        }
      }
    });

    // Calculate completion rates and sort by performance
    const aggregatedTeams = Array.from(teamPerformanceMap.values()).map(team => {
      const completionRate = team.target_cash_in > 0 
        ? (team.total_cash_in / team.target_cash_in) * 100 
        : 0;
      
      return {
        ...team,
        completion_rate: completionRate
      };
    });

    // Sort by completion rate and assign ranks
    aggregatedTeams.sort((a, b) => b.completion_rate - a.completion_rate);
    aggregatedTeams.forEach((team, index) => {
      team.performance_rank = index + 1;
    });

    return aggregatedTeams;
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{!user ? 'Loading user...' : 'Loading teams...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Upseller Team Management</h1>
            <p className="text-muted-foreground">Manage teams, members, and performance targets (cash in amounts)</p>
          </div>
          <Button onClick={() => setIsTeamDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Team
          </Button>
        </div>

        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="targets">Targets</TabsTrigger>
          </TabsList>

          {/* Teams Tab */}
          <TabsContent value="teams" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                             {teams.map((team) => {
                 const members = getTeamMembers(team.id);
                 const performance = getTeamPerformance(team.id);
                 const memberTargets = getMemberTargets(team.id);
                
                return (
                  <Card key={team.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => editTeam(team)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteTeam(team.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{team.description}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Team Leader */}
                      <div className="flex items-center space-x-2">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Leader:</span>
                        <span className="text-sm">{team.team_leader_name}</span>
                      </div>

                      {/* Member Count */}
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Members:</span>
                        <Badge variant="secondary">{members.length}</Badge>
                      </div>

                      {/* Performance Summary */}
                      {performance && (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <BarChart3 className="h-4 w-4 text-green-500" />
                            <span className="text-sm font-medium">Performance:</span>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Target:</span>
                              <div className="font-medium">${performance.target_cash_in.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Cash In:</span>
                              <div className="font-medium">${performance.total_cash_in.toLocaleString()}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Remaining:</span>
                              <div className="font-medium">${(performance.target_cash_in - performance.total_cash_in).toLocaleString()}</div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setMemberForm({ ...memberForm, team_id: team.id });
                            setIsMemberDialogOpen(true);
                          }}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add Member
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsTargetDialogOpen(true);
                          }}
                        >
                          <Target className="h-4 w-4 mr-1" />
                          Set Target
                        </Button>
                      </div>

                      {/* Team Members List */}
                      {members.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium">Team Members:</h4>
                          <div className="space-y-1">
                            {members.map((member) => (
                              <div key={member.id} className="flex items-center justify-between text-xs">
                                <span>{member.member_name}</span>
                                <div className="flex items-center space-x-1">
                                  <Badge variant={member.role === 'leader' ? 'default' : 'secondary'} className="text-xs">
                                    {member.role}
                                  </Badge>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => removeMember(member.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Team Performance Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teamPerformance.map((team) => {
                  const performanceRank = Number(team.performance_rank);
                  const completionRate = Number(team.completion_rate);
                  
                  // Get team members for this team
                  const teamMembers = getTeamMembers(team.team_id);
                  
                  // Get individual member performance for this team
                  const memberPerformance = teamMembers.map(member => {
                    // Find the user profile for this member
                    const userProfile = userProfilesData?.find(up => up.employee_id === member.employee_id);
                    // Find the performance data for this member
                    const memberPerf = rawPerformanceData?.find(p => p.seller_id === userProfile?.user_id);
                    // Find the target data for this member
                    const memberTarget = memberTargets?.find(t => t.seller_id === member.employee_id);
                    
                    return {
                      ...member,
                      performance: {
                        accounts_achieved: memberPerf?.accounts_achieved || 0,
                        total_gross: memberPerf?.total_gross || 0,
                        total_cash_in: memberPerf?.total_cash_in || 0,
                        total_remaining: memberPerf?.total_remaining || 0,
                        target_cash_in: memberTarget?.target_cash_in || 0
                      }
                    };
                  });

                  return (
                    <div key={team.team_id} className="mb-8">
                      {/* Team Performance Summary */}
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold">{team.team_name}</h3>
                          <Badge variant={performanceRank <= 3 ? "default" : "secondary"}>
                            Rank #{performanceRank}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">${team.target_cash_in.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Target</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">${team.total_cash_in.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Cash In</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600">${(team.target_cash_in - team.total_cash_in).toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Remaining</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{completionRate.toFixed(1)}%</div>
                            <div className="text-sm text-muted-foreground">Completion Rate</div>
                          </div>
                        </div>
                        
                        <div className="mt-3 text-sm text-muted-foreground">
                          <span className="font-medium">Team Leader:</span> {team.team_leader_name} | 
                          <span className="font-medium ml-2">Members:</span> {team.member_count}
                        </div>
                      </div>

                      {/* Individual Member Performance */}
                      <div className="ml-4">
                        <h4 className="font-medium text-md mb-3 text-gray-700">Team Members Performance</h4>
                        <div className="space-y-3">
                          {memberPerformance.map((member) => (
                            <div key={member.id} className="border rounded-lg p-3 bg-white">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{member.member_name}</div>
                                  <div className="text-sm text-muted-foreground capitalize">{member.role}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">
                                    ${member.performance.total_cash_in.toLocaleString()}/{member.performance.target_cash_in.toLocaleString()}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Cash In / Target
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Remaining: ${(member.performance.target_cash_in - member.performance.total_cash_in).toLocaleString()}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Remaining includes: Upsell form + Project receivables
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {teamPerformance.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No team performance data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Targets Tab */}
          <TabsContent value="targets" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Member Targets</h2>
              <Button onClick={() => setIsTargetDialogOpen(true)}>
                <Target className="h-4 w-4 mr-2" />
                Set Target
              </Button>
            </div>

            <div className="space-y-6">
              {teams.map((team) => {
                const members = getTeamMembers(team.id);
                const memberTargets = getMemberTargets(team.id);
                
                return (
                  <Card key={team.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{team.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">Member targets for {team.name}</p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {members.length > 0 ? (
                        <div className="space-y-4">
                          {members.map((member) => {
                            const memberTarget = memberTargets.find(target => target.seller_id === member.employee_id);
                            
                            return (
                              <div key={member.id} className="border rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                  <div>
                                    <h4 className="font-medium">{member.member_name}</h4>
                                    <p className="text-sm text-muted-foreground">{member.role}</p>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {memberTarget ? (
                                      <>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => editTarget(memberTarget)}
                                        >
                                          <Edit className="h-4 w-4 mr-1" />
                                          Edit
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => deleteTarget(memberTarget.id)}
                                        >
                                          <Trash2 className="h-4 w-4 mr-1" />
                                          Delete
                                        </Button>
                                      </>
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                          setTargetForm({ ...targetForm, seller_id: member.employee_id });
                                          setIsTargetDialogOpen(true);
                                        }}
                                      >
                                        <Target className="h-4 w-4 mr-1" />
                                        Set Target
                                      </Button>
                                    )}
                                  </div>
                                </div>
                                
                                {memberTarget ? (
                                   <div className="grid grid-cols-1 gap-4">
                                     <div className="text-center">
                                       <div className="text-lg font-bold text-green-600">${memberTarget.target_cash_in.toLocaleString()}</div>
                                       <div className="text-xs text-muted-foreground">Target Cash In</div>
                                     </div>
                                   </div>
                                 ) : (
                                  <div className="text-center py-2">
                                    <p className="text-sm text-muted-foreground">No target set for this member</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm text-muted-foreground">No members in this team</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Team Dialog */}
        <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedTeam ? 'Edit Team' : 'Create New Team'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  value={teamForm.name}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <Label htmlFor="teamDescription">Description</Label>
                <Textarea
                  id="teamDescription"
                  value={teamForm.description}
                  onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter team description"
                />
              </div>
              <div>
                <Label htmlFor="teamLeader">Team Leader</Label>
                <Select
                  value={teamForm.team_lead_id}
                  onValueChange={(value) => setTeamForm(prev => ({ ...prev, team_lead_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team leader" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-leader">No leader</SelectItem>
                    {/* Only shows employees with 'upseller' role */}
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleTeamSubmit}>
                  {selectedTeam ? 'Update Team' : 'Create Team'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Member Dialog */}
        <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Member to Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="memberTeam">Team</Label>
                <Select
                  value={memberForm.team_id}
                  onValueChange={(value) => setMemberForm(prev => ({ ...prev, team_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="memberEmployee">Employee</Label>
                <Select
                  value={memberForm.employee_id}
                  onValueChange={(value) => setMemberForm(prev => ({ ...prev, employee_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Only shows employees with 'upseller' role */}
                    {employees
                      .filter(employee => {
                        // Filter out employees who are already members of the selected team
                        const isAlreadyMemberOfThisTeam = teamMembers.some(member => 
                          member.employee_id === employee.id && member.team_id === memberForm.team_id
                        );
                        return !isAlreadyMemberOfThisTeam;
                      })
                      .map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.full_name}
                        </SelectItem>
                      ))}
                    {employees.filter(employee => {
                      const isAlreadyMemberOfThisTeam = teamMembers.some(member => 
                        member.employee_id === employee.id && member.team_id === memberForm.team_id
                      );
                      return !isAlreadyMemberOfThisTeam;
                    }).length === 0 && (
                      <SelectItem value="no-available-employees" disabled>
                        {memberForm.team_id ? 'All employees are already in this team' : 'Select a team first'}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="memberRole">Role</Label>
                <Select
                  value={memberForm.role}
                  onValueChange={(value) => setMemberForm(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="member">Member</SelectItem>
                    <SelectItem value="leader">Leader</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsMemberDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleMemberSubmit}>
                  Add Member
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Target Dialog */}
        <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {selectedTarget ? 'Edit Target' : 'Set Member Target'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="targetMember">Team Member</Label>
                <Select
                  value={targetForm.seller_id}
                  onValueChange={(value) => setTargetForm(prev => ({ ...prev, seller_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member for target" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(employee => {
                        // Only show employees who are already members of teams
                        const isTeamMember = teamMembers.some(member => 
                          member.employee_id === employee.id
                        );
                        return isTeamMember;
                      })
                      .map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.full_name}
                        </SelectItem>
                      ))}
                    {employees.filter(employee => {
                      const isTeamMember = teamMembers.some(member => 
                        member.employee_id === employee.id
                      );
                      return isTeamMember;
                    }).length === 0 && (
                      <SelectItem value="no-team-members" disabled>
                        No team members available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetCashIn">Target Cash In</Label>
                <Input
                  id="targetCashIn"
                  type="number"
                  value={targetForm.target_cash_in}
                  onChange={(e) => setTargetForm(prev => ({ ...prev, target_cash_in: parseFloat(e.target.value) || 0 }))}
                  placeholder="Enter target cash in amount"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This is the target amount that will be completed by total cash in
                </p>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsTargetDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleTargetSubmit}>
                  {selectedTarget ? 'Update Target' : 'Set Target'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
  );
};

export default UpsellerManagement;

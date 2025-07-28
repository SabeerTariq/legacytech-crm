import React, { useState, useEffect, useCallback } from 'react';
// Authentication removed - no user context needed
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
  team_leader_id: string;
  team_leader_name: string;
  department: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface TeamMember {
  id: string;
  team_id: string;
  member_id: string;
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
  target_accounts: number;
  target_gross: number;
  target_cash_in: number;
  performance_rank: number | string; // Can be bigint from database
  completion_rate: number | string; // Can be numeric from database
}

interface MemberTarget {
  id: string;
  seller_id: string;
  seller_name: string;
  month: string;
  target_accounts: number;
  target_gross: number;
  target_cash_in: number;
  created_at: string;
  updated_at: string;
}

interface FrontSalesEmployee {
  id: string;
  email: string;
  full_name: string;
  department: string;
  role: string;
  hire_date: string;
  status: string;
}

const FrontSalesManagement: React.FC = () => {
  // User context removed - no authentication needed
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformance[]>([]);
  const [memberTargets, setMemberTargets] = useState<MemberTarget[]>([]);
  const [employees, setEmployees] = useState<FrontSalesEmployee[]>([]);
  const [currentMonth, setCurrentMonth] = useState('');
  
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
    team_leader_id: ''
  });

  const [memberForm, setMemberForm] = useState({
    team_id: '',
    member_id: '', // This will now be profile_id
    role: 'member'
  });

  const [targetForm, setTargetForm] = useState({
    seller_id: '',
    month: '',
    target_accounts: 0,
    target_gross: 0,
    target_cash_in: 0
  });

  // Removed permission check - all authenticated users can access
  const hasPermission = useCallback(() => {
    return true;
  }, []);

  // Initialize current month
  useEffect(() => {
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();
    const monthStart = new Date(Date.UTC(currentYear, currentMonth, 1));
    const monthString = monthStart.toISOString().split('T')[0];
    
    console.log('Setting currentMonth to:', monthString);
    setCurrentMonth(monthString);
    
    // Update target form with current month
    setTargetForm(prev => ({
      ...prev,
      month: monthString
    }));
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
        .from('teams')
        .select('*')
        .eq('department', 'Front Sales')
        .eq('is_active', true)
        .order('name');

      if (teamsError) throw teamsError;

      // Load team members
      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('joined_at');

      if (membersError) throw membersError;

      // Load team performance
      // Validate that currentMonth is not empty before making the call
      if (!currentMonth || currentMonth.trim() === '') {
        throw new Error('Invalid month parameter: month cannot be empty');
      }
      
      const { data: performanceData, error: performanceError } = await supabase
        .rpc('get_team_performance_summary', { p_month: currentMonth });

      if (performanceError) {
        throw performanceError;
      }

      // Load member targets
      const { data: targetsData, error: targetsError } = await supabase
        .from('front_seller_targets')
        .select('*')
        .eq('month', currentMonth)
        .order('created_at');

      if (targetsError) throw targetsError;

      // Load Front Sales employees
      const { data: employeesData, error: employeesError } = await supabase
        .from('employees')
        .select('*')
        .eq('department', 'Front Sales')
        .order('full_name');

      if (employeesError) throw employeesError;

      // Data loaded successfully
      
      setTeams(teamsData?.map(t => ({
        ...t,
        team_leader_name: t.team_leader?.full_name || 'Unassigned'
      })) || []);
      
      // Map team members with employee names
      setTeamMembers(membersData?.map(m => {
        const employee = employeesData?.find(e => e.id === m.member_id);
        return {
          ...m,
          member_name: employee?.full_name || 'Unknown Employee'
        };
      }) || []);
      
      setTeamPerformance(performanceData || []);
      
      // Map member targets with employee names
      setMemberTargets(targetsData?.map(t => {
        const employee = employeesData?.find(e => e.id === t.seller_id);
        return {
          ...t,
          seller_name: employee?.full_name || 'Unknown Employee'
        };
      }) || []);
      setEmployees(employeesData || []);

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load Front Sales data",
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
        team_leader_id: teamForm.team_leader_id || null,
        department: 'Front Sales'
      };

      if (selectedTeam) {
        // Update existing team
        const { error } = await supabase
          .from('teams')
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
          .from('teams')
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
        team_leader_id: ''
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
      if (!memberForm.team_id || !memberForm.member_id) {
        toast({
          title: "Error",
          description: "Please select both team and member",
          variant: "destructive",
        });
        return;
      }

      const memberData = {
        team_id: memberForm.team_id,
        member_id: memberForm.member_id,
        role: memberForm.role
      };

      const { error } = await supabase
        .from('team_members')
        .insert(memberData);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member added to team successfully",
      });

      setIsMemberDialogOpen(false);
      setMemberForm({
        team_id: '',
        member_id: '',
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
      if (!targetForm.seller_id || !targetForm.month) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive",
        });
        return;
      }

      const targetData = {
        seller_id: targetForm.seller_id,
        month: targetForm.month,
        target_accounts: targetForm.target_accounts,
        target_gross: targetForm.target_gross,
        target_cash_in: targetForm.target_cash_in
      };

      if (selectedTarget) {
        // Update existing target
        const { error } = await supabase
          .from('front_seller_targets')
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
          .from('front_seller_targets')
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
        month: currentMonth,
        target_accounts: 0,
        target_gross: 0,
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
      team_leader_id: team.team_leader_id || ''
    });
    setIsTeamDialogOpen(true);
  };

  // Delete team
  const deleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      const { error } = await supabase
        .from('teams')
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
        .from('team_members')
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
      month: target.month,
      target_accounts: target.target_accounts,
      target_gross: target.target_gross,
      target_cash_in: target.target_cash_in
    });
    setIsTargetDialogOpen(true);
  };

  // Delete target
  const deleteTarget = async (targetId: string) => {
    if (!confirm('Are you sure you want to delete this target?')) return;

    try {
      const { error } = await supabase
        .from('front_seller_targets')
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
      .map(member => member.member_id);
    
    return memberTargets.filter(target => 
      teamMemberIds.includes(target.seller_id) && target.month === currentMonth
    );
  };

  // Get team performance for current month
  const getTeamPerformance = (teamId: string) => {
    return teamPerformance.find(perf => perf.team_id === teamId);
  };

  // Permission check removed - all authenticated users can access

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading teams...</p>
          </div>
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Front Sales Team Management</h1>
            <p className="text-muted-foreground">Manage teams, members, and performance targets</p>
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
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-muted-foreground">Accounts:</span>
                              <div className="font-medium">{performance.total_accounts_achieved}</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Gross:</span>
                              <div className="font-medium">${performance.total_gross.toLocaleString()}</div>
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
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Rank</TableHead>
                      <TableHead>Team</TableHead>
                      <TableHead>Leader</TableHead>
                      <TableHead>Members</TableHead>
                      <TableHead>Accounts</TableHead>
                      <TableHead>Gross</TableHead>
                      <TableHead>Cash In</TableHead>
                      <TableHead>Completion</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamPerformance.map((team) => {
                      const performanceRank = Number(team.performance_rank);
                      const completionRate = Number(team.completion_rate);
                      
                      return (
                        <TableRow key={team.team_id}>
                          <TableCell>
                            <Badge variant={performanceRank <= 3 ? "default" : "secondary"}>
                              #{performanceRank}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">
                            {team.team_name}
                          </TableCell>
                          <TableCell>{team.team_leader_name}</TableCell>
                                                     <TableCell>{Number(team.member_count)}</TableCell>
                          <TableCell>
                            {team.total_accounts_achieved} / {team.target_accounts}
                          </TableCell>
                          <TableCell>${team.total_gross.toLocaleString()}</TableCell>
                          <TableCell>${team.total_cash_in.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={completionRate >= 100 ? "default" : "secondary"}>
                              {completionRate.toFixed(1)}%
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {teamPerformance.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                          No performance data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
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
                            const memberTarget = memberTargets.find(target => target.seller_id === member.member_id);
                            
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
                                          setTargetForm({ ...targetForm, seller_id: member.member_id });
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
                                  <div className="grid grid-cols-3 gap-4">
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-blue-600">{memberTarget.target_accounts}</div>
                                      <div className="text-xs text-muted-foreground">Accounts</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-green-600">${memberTarget.target_gross.toLocaleString()}</div>
                                      <div className="text-xs text-muted-foreground">Gross</div>
                                    </div>
                                    <div className="text-center">
                                      <div className="text-lg font-bold text-purple-600">${memberTarget.target_cash_in.toLocaleString()}</div>
                                      <div className="text-xs text-muted-foreground">Cash In</div>
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
                  value={teamForm.team_leader_id}
                  onValueChange={(value) => setTeamForm(prev => ({ ...prev, team_leader_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team leader" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No leader</SelectItem>
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
                  value={memberForm.member_id}
                  onValueChange={(value) => setMemberForm(prev => ({ ...prev, member_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(employee => {
                        // Filter out employees who are already members of any team
                        const isAlreadyMember = teamMembers.some(member => 
                          member.member_id === employee.id
                        );
                        return !isAlreadyMember;
                      })
                      .map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.full_name}
                        </SelectItem>
                      ))}
                    {employees.filter(employee => {
                      const isAlreadyMember = teamMembers.some(member => 
                        member.member_id === employee.id
                      );
                      return !isAlreadyMember;
                    }).length === 0 && (
                      <SelectItem value="" disabled>
                        No available employees to add
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
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(employee => {
                        // Only show employees who are already members of teams
                        const isTeamMember = teamMembers.some(member => 
                          member.member_id === employee.id
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
                        member.member_id === employee.id
                      );
                      return isTeamMember;
                    }).length === 0 && (
                      <SelectItem value="" disabled>
                        No team members available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="targetMonth">Month</Label>
                <Input
                  id="targetMonth"
                  type="month"
                  value={targetForm.month.substring(0, 7)}
                  onChange={(e) => setTargetForm(prev => ({ ...prev, month: e.target.value + '-01' }))}
                />
              </div>
              <div>
                <Label htmlFor="targetAccounts">Target Accounts</Label>
                <Input
                  id="targetAccounts"
                  type="number"
                  value={targetForm.target_accounts}
                  onChange={(e) => setTargetForm(prev => ({ ...prev, target_accounts: parseInt(e.target.value) || 0 }))}
                  placeholder="Enter target accounts"
                />
              </div>
              <div>
                <Label htmlFor="targetGross">Target Gross</Label>
                <Input
                  id="targetGross"
                  type="number"
                  value={targetForm.target_gross}
                  onChange={(e) => setTargetForm(prev => ({ ...prev, target_gross: parseFloat(e.target.value) || 0 }))}
                  placeholder="Enter target gross"
                />
              </div>
              <div>
                <Label htmlFor="targetCashIn">Target Cash In</Label>
                <Input
                  id="targetCashIn"
                  type="number"
                  value={targetForm.target_cash_in}
                  onChange={(e) => setTargetForm(prev => ({ ...prev, target_cash_in: parseFloat(e.target.value) || 0 }))}
                  placeholder="Enter target cash in"
                />
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

export default FrontSalesManagement; 
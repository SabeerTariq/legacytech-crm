import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';
import { Badge } from '../../ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '../../ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../ui/select';
import { useToast } from '../../../hooks/use-toast';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Crown,
  UserPlus,
  Settings
} from 'lucide-react';
import { UpsellerManagementService } from '../../../lib/admin/upsellerManagementService';
import { 
  UpsellerTeam, 
  UpsellerTeamMember,
  CreateTeamRequest,
  UpdateTeamRequest
} from '../../../types/upsellerManagement';

interface TeamManagementProps {
  teams: UpsellerTeam[];
  onTeamsChange: (teams: UpsellerTeam[]) => void;
  onRefresh: () => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ 
  teams, 
  onTeamsChange, 
  onRefresh 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState<any[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<UpsellerTeam | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [teamMembers, setTeamMembers] = useState<UpsellerTeamMember[]>([]);

  // Form states
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [teamLeadId, setTeamLeadId] = useState('none');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);

  useEffect(() => {
    loadAvailableEmployees();
  }, []);

  const loadAvailableEmployees = async () => {
    try {
      const employees = await UpsellerManagementService.getAvailableEmployees();
      setAvailableEmployees(employees);
    } catch (error) {
      console.error('Error loading employees:', error);
    }
  };

  const loadTeamMembers = async (teamId: string) => {
    try {
      const members = await UpsellerManagementService.getTeamMembers(teamId);
      setTeamMembers(members);
    } catch (error) {
      console.error('Error loading team members:', error);
    }
  };

  const resetForm = () => {
    setTeamName('');
    setTeamDescription('');
    setTeamLeadId('none');
    setSelectedMemberIds([]);
  };

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const newTeam = await UpsellerManagementService.createTeam({
        name: teamName.trim(),
        description: teamDescription.trim(),
        team_lead_id: teamLeadId === 'none' ? undefined : teamLeadId || undefined,
        member_ids: selectedMemberIds
      }, 'current-user-id'); // TODO: Get actual user ID

      onTeamsChange([...teams, newTeam]);
      setIsCreateDialogOpen(false);
      resetForm();
      onRefresh();

      toast({
        title: "Success",
        description: "Team created successfully",
      });
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "Failed to create team",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTeam = async () => {
    if (!selectedTeam || !teamName.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const updatedTeam = await UpsellerManagementService.updateTeam(selectedTeam.id, {
        name: teamName.trim(),
        description: teamDescription.trim(),
        team_lead_id: teamLeadId === 'none' ? undefined : teamLeadId || undefined,
      });

      onTeamsChange(teams.map(team => 
        team.id === updatedTeam.id ? updatedTeam : team
      ));
      setIsEditDialogOpen(false);
      resetForm();

      toast({
        title: "Success",
        description: "Team updated successfully",
      });
    } catch (error) {
      console.error('Error updating team:', error);
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      setLoading(true);
      await UpsellerManagementService.deleteTeam(teamId);
      onTeamsChange(teams.filter(team => team.id !== teamId));
      onRefresh();

      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEditDialog = (team: UpsellerTeam) => {
    setSelectedTeam(team);
    setTeamName(team.name);
    setTeamDescription(team.description || '');
    setTeamLeadId(team.team_lead_id || 'none');
    setIsEditDialogOpen(true);
  };

  const openMembersDialog = async (team: UpsellerTeam) => {
    setSelectedTeam(team);
    await loadTeamMembers(team.id);
    setIsMembersDialogOpen(true);
  };

  const handleAddMember = async (employeeId: string) => {
    if (!selectedTeam) return;

    try {
      await UpsellerManagementService.addTeamMember({
        team_id: selectedTeam.id,
        employee_id: employeeId,
        role: 'member'
      });

      await loadTeamMembers(selectedTeam.id);
      onRefresh();

      toast({
        title: "Success",
        description: "Member added successfully",
      });
    } catch (error) {
      console.error('Error adding member:', error);
      toast({
        title: "Error",
        description: "Failed to add member",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (employeeId: string) => {
    if (!selectedTeam) return;

    try {
      await UpsellerManagementService.removeTeamMember(selectedTeam.id, employeeId);
      await loadTeamMembers(selectedTeam.id);
      onRefresh();

      toast({
        title: "Success",
        description: "Member removed successfully",
      });
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Team Management</h2>
          <p className="text-muted-foreground">
            Create and manage upseller teams
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                />
              </div>
              <div>
                <Label htmlFor="teamDescription">Description</Label>
                <Textarea
                  id="teamDescription"
                  value={teamDescription}
                  onChange={(e) => setTeamDescription(e.target.value)}
                  placeholder="Enter team description"
                />
              </div>
              <div>
                <Label htmlFor="teamLead">Team Lead</Label>
                <Select value={teamLeadId} onValueChange={setTeamLeadId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team lead" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No team lead</SelectItem>
                    {availableEmployees.map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name} - {employee.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Initial Members</Label>
                <Select onValueChange={(value) => setSelectedMemberIds([...selectedMemberIds, value])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Add team members" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableEmployees
                      .filter(emp => !selectedMemberIds.includes(emp.id))
                      .map(employee => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.full_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {selectedMemberIds.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {selectedMemberIds.map(memberId => {
                      const employee = availableEmployees.find(emp => emp.id === memberId);
                      return (
                        <Badge key={memberId} variant="secondary" className="mr-2">
                          {employee?.full_name}
                          <button
                            onClick={() => setSelectedMemberIds(selectedMemberIds.filter(id => id !== memberId))}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTeam} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Team'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <Card key={team.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{team.name}</CardTitle>
                  {team.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {team.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openMembersDialog(team)}
                  >
                    <Users className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEditDialog(team)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTeam(team.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {team.team_lead && (
                  <div className="flex items-center space-x-2">
                    <Crown className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Team Lead:</span>
                    <span className="text-sm">{team.team_lead.full_name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Members:</span>
                  <span className="text-sm">{team.member_count || 0}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Settings className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-medium">Status:</span>
                  <Badge variant={team.is_active ? "default" : "secondary"}>
                    {team.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTeamName">Team Name *</Label>
              <Input
                id="editTeamName"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
              />
            </div>
            <div>
              <Label htmlFor="editTeamDescription">Description</Label>
              <Textarea
                id="editTeamDescription"
                value={teamDescription}
                onChange={(e) => setTeamDescription(e.target.value)}
                placeholder="Enter team description"
              />
            </div>
            <div>
              <Label htmlFor="editTeamLead">Team Lead</Label>
              <Select value={teamLeadId} onValueChange={setTeamLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select team lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No team lead</SelectItem>
                  {availableEmployees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.full_name} - {employee.position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateTeam} disabled={loading}>
                {loading ? 'Updating...' : 'Update Team'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Team Members Dialog */}
      <Dialog open={isMembersDialogOpen} onOpenChange={setIsMembersDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Team Members - {selectedTeam?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Add Member */}
            <div className="flex space-x-2">
              <Select onValueChange={handleAddMember}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add team member" />
                </SelectTrigger>
                <SelectContent>
                  {availableEmployees
                    .filter(emp => !teamMembers.some(member => member.employee_id === emp.id))
                    .map(employee => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.full_name} - {employee.position}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Members List */}
            <div className="space-y-2">
              {teamMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div>
                      <div className="font-medium">{member.employee?.full_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {member.employee?.position} • {member.role}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveMember(member.employee_id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {teamMembers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No team members yet
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamManagement;

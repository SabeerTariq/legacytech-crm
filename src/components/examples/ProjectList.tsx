import React, { useState } from 'react';
import { useProjects, useCreateProject, useUpdateProject, useAssignTeam, useDeleteProject, useCustomers, useUsers } from '@/hooks/useQueries';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Trash2, Plus, Users } from 'lucide-react';
import { format } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';

interface ProjectFormData {
  name: string;
  description?: string;
  customerId: number;
  startDate: Date;
  deadline?: Date;
  status: string;
  progress: number;
  sellerId: number;
  managerId: number;
  services: string[];
}

export const ProjectList = () => {
  const { user } = useAuth();
  const { data: projectsData, isLoading, isError, error } = useProjects();
  const { data: customersData, isLoading: isLoadingCustomers } = useCustomers();
  const { data: usersData, isLoading: isLoadingUsers } = useUsers();
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const assignTeamMutation = useAssignTeam();
  const deleteProjectMutation = useDeleteProject();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignTeamDialogOpen, setIsAssignTeamDialogOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    customerId: 0,
    startDate: new Date(),
    status: 'planning',
    progress: 0,
    sellerId: user?.id || 0,
    managerId: 0,
    services: [],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: name === 'progress' ? parseInt(value, 10) : value 
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ 
      ...prev, 
      [name]: ['customerId', 'sellerId', 'managerId'].includes(name) ? parseInt(value, 10) : value 
    }));
  };

  const handleDateChange = (name: string, date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, [name]: date }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      customerId: 0,
      startDate: new Date(),
      status: 'planning',
      progress: 0,
      sellerId: user?.id || 0,
      managerId: 0,
      services: [],
    });
    setSelectedProjectId(null);
    setSelectedProject(null);
    setSelectedTeamMembers([]);
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createProjectMutation.mutateAsync({
        ...formData,
        team: [],
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleEditProject = (project: any) => {
    setSelectedProjectId(project.id);
    setSelectedProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      customerId: project.customerId,
      startDate: new Date(project.startDate),
      deadline: project.deadline ? new Date(project.deadline) : undefined,
      status: project.status,
      progress: project.progress,
      sellerId: project.sellerId,
      managerId: project.managerId,
      services: project.services || [],
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) return;

    try {
      await updateProjectMutation.mutateAsync({
        id: selectedProjectId,
        projectData: formData,
      });
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update project:', error);
    }
  };

  const handleAssignTeam = (project: any) => {
    setSelectedProjectId(project.id);
    setSelectedProject(project);
    setSelectedTeamMembers(project.team || []);
    setIsAssignTeamDialogOpen(true);
  };

  const handleTeamMemberToggle = (userId: string) => {
    setSelectedTeamMembers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const handleSaveTeam = async () => {
    if (!selectedProjectId) return;

    try {
      await assignTeamMutation.mutateAsync({
        id: selectedProjectId,
        team: selectedTeamMembers,
      });
      setIsAssignTeamDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Failed to assign team:', error);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProjectMutation.mutateAsync(id);
      } catch (error) {
        console.error('Failed to delete project:', error);
      }
    }
  };

  if (isLoading || isLoadingCustomers || isLoadingUsers) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-destructive">Error loading projects: {(error as any)?.message || 'Unknown error'}</p>
      </div>
    );
  }

  const projects = projectsData?.data?.projects || [];
  const customers = customersData?.data?.customers || [];
  const users = usersData?.data?.users || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planning':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Project</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new project.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Project Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="description" className="text-right pt-2">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="customerId" className="text-right">
                    Customer
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.customerId.toString()}
                      onValueChange={(value) => handleSelectChange('customerId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer: any) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name} ({customer.businessName})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="startDate" className="text-right">
                    Start Date
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          {formData.startDate ? format(formData.startDate, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.startDate}
                          onSelect={(date) => handleDateChange('startDate', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="deadline" className="text-right">
                    Deadline
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">
                          {formData.deadline ? format(formData.deadline, 'PPP') : 'Select date'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.deadline}
                          onSelect={(date) => handleDateChange('deadline', date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange('status', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="progress" className="text-right">
                    Progress
                  </Label>
                  <div className="col-span-3 space-y-2">
                    <Input
                      id="progress"
                      name="progress"
                      type="range"
                      min="0"
                      max="100"
                      value={formData.progress}
                      onChange={handleInputChange}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>{formData.progress}%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sellerId" className="text-right">
                    Sales Rep
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.sellerId.toString()}
                      onValueChange={(value) => handleSelectChange('sellerId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sales rep" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user: any) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="managerId" className="text-right">
                    Project Manager
                  </Label>
                  <div className="col-span-3">
                    <Select
                      value={formData.managerId.toString()}
                      onValueChange={(value) => handleSelectChange('managerId', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select project manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {users
                          .filter((user: any) => user.role === 'project_manager' || user.role === 'admin')
                          .map((user: any) => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="services" className="text-right">
                    Services
                  </Label>
                  <Input
                    id="services"
                    name="services"
                    value={formData.services.join(', ')}
                    onChange={(e) => setFormData(prev => ({ ...prev, services: e.target.value.split(',').map(s => s.trim()) }))}
                    className="col-span-3"
                    placeholder="Web Design, SEO, Marketing"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createProjectMutation.isPending}>
                  {createProjectMutation.isPending ? 'Creating...' : 'Create Project'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project Name</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Manager</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  No projects found
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project: any) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>
                    {project.customer?.name || `Customer #${project.customerId}`}
                  </TableCell>
                  <TableCell>{format(new Date(project.startDate), 'MMM d, yyyy')}</TableCell>
                  <TableCell>
                    {project.deadline ? format(new Date(project.deadline), 'MMM d, yyyy') : 'Not set'}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status.replace('-', ' ')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="w-full">
                      <Progress value={project.progress} className="h-2" />
                      <span className="text-xs text-muted-foreground">{project.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {project.manager?.name || `Manager #${project.managerId}`}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleAssignTeam(project)}
                        title="Assign Team"
                      >
                        <Users className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProject(project)}
                        title="Edit Project"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProject(project.id)}
                        title="Delete Project"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project details.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateProject}>
            {/* Same form fields as in the create dialog */}
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  Project Name
                </Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              {/* Add the rest of the fields similar to the create form */}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={updateProjectMutation.isPending}>
                {updateProjectMutation.isPending ? 'Updating...' : 'Update Project'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssignTeamDialogOpen} onOpenChange={setIsAssignTeamDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Team Members</DialogTitle>
            <DialogDescription>
              Select team members for {selectedProject?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              {users.map((user: any) => (
                <div key={user.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`user-${user.id}`}
                    checked={selectedTeamMembers.includes(user.id.toString())}
                    onCheckedChange={() => handleTeamMemberToggle(user.id.toString())}
                  />
                  <Label htmlFor={`user-${user.id}`} className="flex-1">
                    {user.name} ({user.role})
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSaveTeam} disabled={assignTeamMutation.isPending}>
              {assignTeamMutation.isPending ? 'Saving...' : 'Save Team'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

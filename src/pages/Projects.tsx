
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProjectKanban from "@/components/projects/ProjectKanban";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";
import NewProjectDialog from "@/components/projects/NewProjectDialog";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface ProjectTask {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  dueDate: string;
  assignee: {
    name: string;
    initials: string;
    avatar?: string;
  };
}

interface KanbanColumn {
  id: string;
  title: string;
  tasks: ProjectTask[];
}

interface Project {
  id: string;
  name: string;
  client: string;
  description?: string;
  dueDate: string;
  status: string;
  progress: number;
}

const Projects = () => {
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch projects from Supabase
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: "Error fetching projects",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data.map(project => ({
        id: project.id,
        name: project.name,
        client: project.client,
        description: project.description || '',
        dueDate: new Date(project.due_date).toLocaleDateString(),
        status: project.status,
        progress: project.progress || 0,
      }));
    },
    enabled: !!user,
  });

  // Selected project state
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  
  // Effect to select first project if available
  React.useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects, selectedProjectId]);

  // Fetch tasks for selected project
  const { data: kanbanColumns = [], isLoading: isLoadingTasks } = useQuery({
    queryKey: ['project-tasks', selectedProjectId],
    queryFn: async () => {
      if (!selectedProjectId) return [];
      
      const { data, error } = await supabase
        .from('project_tasks')
        .select(`
          id, 
          title, 
          description, 
          status, 
          priority, 
          due_date,
          assigned_to_id,
          profiles:assigned_to_id (full_name, avatar_url)
        `)
        .eq('project_id', selectedProjectId);
      
      if (error) {
        toast({
          title: "Error fetching project tasks",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      // Group tasks by status
      const columns: Record<string, KanbanColumn> = {
        'backlog': { id: 'backlog', title: 'Backlog', tasks: [] },
        'in-progress': { id: 'in-progress', title: 'In Progress', tasks: [] },
        'review': { id: 'review', title: 'Review', tasks: [] },
        'completed': { id: 'completed', title: 'Completed', tasks: [] },
      };
      
      data.forEach(task => {
        const statusKey = task.status.toLowerCase().replace(' ', '-');
        if (!columns[statusKey]) {
          columns[statusKey] = {
            id: statusKey,
            title: task.status,
            tasks: [],
          };
        }
        
        const profile = task.profiles || {};
        
        columns[statusKey].tasks.push({
          id: task.id,
          title: task.title,
          description: task.description || '',
          priority: task.priority as "high" | "medium" | "low",
          dueDate: task.due_date ? new Date(task.due_date).toLocaleDateString('en-US', { month: 'short', day: '2-digit' }) : '',
          assignee: {
            name: profile.full_name || 'Unassigned',
            initials: profile.full_name ? 
              profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 
              'UN',
            avatar: profile.avatar_url,
          },
        });
      });
      
      return Object.values(columns);
    },
    enabled: !!selectedProjectId && !!user,
  });

  // Add project mutation
  const addProjectMutation = useMutation({
    mutationFn: async (newProject: {
      name: string;
      client: string;
      description?: string;
      dueDate: string;
      status: string;
    }) => {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name: newProject.name,
            client: newProject.client,
            description: newProject.description,
            due_date: newProject.dueDate,
            status: newProject.status,
            progress: 0,
            user_id: user?.id,
          }
        ])
        .select();

      if (error) throw error;
      return data[0];
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      toast({
        title: "Project created",
        description: "Your project has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle task movement
  const handleTaskMove = async (result: any) => {
    console.log("Task moved:", result);
    
    if (!result.destination || !selectedProjectId) return;
    
    const sourceColId = result.source.droppableId;
    const destColId = result.destination.droppableId;
    const taskId = result.draggableId;
    
    if (sourceColId === destColId) return;
    
    try {
      const { error } = await supabase
        .from('project_tasks')
        .update({ status: destColId })
        .eq('id', taskId);
        
      if (error) throw error;
      
      // Refetch tasks after update
      queryClient.invalidateQueries({ queryKey: ['project-tasks', selectedProjectId] });
      
      toast({
        title: "Task updated",
        description: `Task moved to ${destColId}`,
      });
    } catch (error: any) {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const handleProjectCreated = (project: any) => {
    addProjectMutation.mutate(project);
  };
  
  const activeProjects = projects.filter(p => p.status !== 'completed');
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Projects</h1>
          <Button onClick={() => setNewProjectDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {isLoadingProjects ? (
          <div className="flex justify-center items-center h-64">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="mb-4">
              <TabsTrigger value="active">Active Projects ({activeProjects.length})</TabsTrigger>
              <TabsTrigger value="completed">Completed ({completedProjects.length})</TabsTrigger>
              <TabsTrigger value="all">All Projects ({projects.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="space-y-6">
              {activeProjects.length > 0 ? (
                activeProjects.map(project => (
                  <Card key={project.id}>
                    <CardHeader>
                      <CardTitle>Project: {project.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {isLoadingTasks ? (
                        <div className="flex justify-center items-center h-64">
                          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                        </div>
                      ) : (
                        <ProjectKanban
                          initialColumns={kanbanColumns}
                          onTaskMove={handleTaskMove}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] border-2 border-dashed rounded-md">
                  <p className="text-muted-foreground mb-4">No active projects yet</p>
                  <Button onClick={() => setNewProjectDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Your First Project
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="completed">
              {completedProjects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {completedProjects.map(project => (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p><strong>Client:</strong> {project.client}</p>
                        <p><strong>Completed:</strong> {project.dueDate}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] border-2 border-dashed rounded-md">
                  <p className="text-muted-foreground">No completed projects yet</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="all">
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map(project => (
                    <Card key={project.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{project.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p><strong>Client:</strong> {project.client}</p>
                        <p><strong>Status:</strong> {project.status}</p>
                        <p><strong>Due:</strong> {project.dueDate}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-[200px] border-2 border-dashed rounded-md">
                  <p className="text-muted-foreground">No projects yet</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      <NewProjectDialog 
        open={newProjectDialogOpen} 
        onOpenChange={setNewProjectDialogOpen} 
        onProjectCreated={handleProjectCreated}
      />
    </MainLayout>
  );
};

export default Projects;

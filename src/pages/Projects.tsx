
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProjectKanban from "@/components/projects/ProjectKanban";
import NewProjectDialog from "@/components/projects/NewProjectDialog";
import { toast } from "sonner";

const Projects: React.FC = () => {
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);

  const { 
    data: projects, 
    isLoading: isProjectsLoading, 
    error: projectsError,
    refetch
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      try {
        // Simplified query to avoid issues with relationships
        const { data, error } = await supabase
          .from('projects')
          .select('*');
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error("Error fetching projects:", error);
        throw error;
      }
    }
  });

  const handleProjectCreated = async (projectData: any) => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: projectData.name,
          client: projectData.client,
          description: projectData.description || null,
          due_date: projectData.dueDate,
          status: projectData.status,
          user_id: (await supabase.auth.getUser()).data.user?.id
        }])
        .select();
      
      if (error) throw error;
      
      toast.success("Project created successfully!");
      refetch();
    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    }
  };

  if (isProjectsLoading) {
    return (
      <MainLayout>
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
          <span className="loading loading-dots loading-lg"></span>
        </div>
      </MainLayout>
    );
  }

  if (projectsError) {
    return (
      <MainLayout>
        <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
          <p className="text-red-500">Error: {(projectsError as Error).message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">LogicWorks CRM Projects</h1>
          <Button onClick={() => setIsNewProjectDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>

        {projects && projects.length > 0 ? (
          <ProjectKanban projects={projects} />
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-center p-6">
            <h3 className="text-xl font-medium text-gray-600 mb-2">No projects yet</h3>
            <p className="text-gray-500 mb-6 max-w-md">Create your first project to start tracking tasks and progress.</p>
            <Button onClick={() => setIsNewProjectDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Your First Project
            </Button>
          </div>
        )}
        
        <NewProjectDialog 
          open={isNewProjectDialogOpen}
          onOpenChange={setIsNewProjectDialogOpen}
          onProjectCreated={handleProjectCreated}
        />
      </div>
    </MainLayout>
  );
};

export default Projects;

import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProjectKanban from "@/components/projects/ProjectKanban";
import NewProjectDialog from "@/components/projects/NewProjectDialog";

const Projects: React.FC = () => {
  const [isNewProjectDialogOpen, setIsNewProjectDialogOpen] = useState(false);

  const { 
    data: projects, 
    isLoading: isProjectsLoading, 
    error: projectsError 
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_tasks (
            *,
            profiles (full_name, avatar_url)
          )
        `);
      
      if (error) throw error;
      return data;
    }
  });

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
          <p className="text-red-500">Error: {projectsError.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Projects</h1>
          <Button onClick={() => setIsNewProjectDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>

        {projects && (
          <ProjectKanban projects={projects} />
        )}
        
        <NewProjectDialog 
          open={isNewProjectDialogOpen}
          onOpenChange={setIsNewProjectDialogOpen}
        />
      </div>
    </MainLayout>
  );
};

export default Projects;

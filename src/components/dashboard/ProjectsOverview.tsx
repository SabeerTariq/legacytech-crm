
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Project {
  id: string;
  name: string;
  client: string;
  progress: number;
  status: "new" | "in-progress" | "review" | "approved" | "completed" | "on-hold";
  dueDate: string;
}

interface ProjectsOverviewProps {
  projects: Project[];
  className?: string;
}

const ProjectsOverview: React.FC<ProjectsOverviewProps> = ({ projects, className }) => {
  const getStatusLabel = (status: Project["status"]) => {
    switch (status) {
      case "new":
        return "New";
      case "in-progress":
        return "In Progress";
      case "review":
        return "Review";
      case "approved":
        return "Approved";
      case "completed":
        return "Completed";
      case "on-hold":
        return "On Hold";
      default:
        return status;
    }
  };

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>Current Projects</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-0">
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex flex-col p-4 border-b last:border-0"
            >
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="font-medium">{project.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {project.client}
                  </div>
                </div>
                <Badge
                  className="capitalize"
                  style={{
                    backgroundColor: `hsl(var(--status-${project.status}))`,
                    color: "white",
                  }}
                >
                  {getStatusLabel(project.status)}
                </Badge>
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span>Progress</span>
                  <span>{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-1.5" />
                <div className="text-xs text-muted-foreground">
                  Due {project.dueDate}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectsOverview;

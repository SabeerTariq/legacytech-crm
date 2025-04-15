
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProjectKanban from "@/components/projects/ProjectKanban";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PlusCircle } from "lucide-react";

const Projects = () => {
  // Mock data for kanban board
  const kanbanColumns = [
    {
      id: "backlog",
      title: "Backlog",
      tasks: [
        {
          id: "task-1",
          title: "Website Wireframes",
          description: "Create initial wireframes for homepage and product pages",
          priority: "medium" as const,
          dueDate: "Jun 20",
          assignee: {
            name: "Alex Johnson",
            initials: "AJ",
          },
        },
        {
          id: "task-2",
          title: "Content Strategy",
          description: "Develop content strategy for blog and social media",
          priority: "low" as const,
          dueDate: "Jun 25",
          assignee: {
            name: "Sarah Wilson",
            initials: "SW",
          },
        },
      ],
    },
    {
      id: "in-progress",
      title: "In Progress",
      tasks: [
        {
          id: "task-3",
          title: "Logo Design",
          description: "Create logo variations based on client feedback",
          priority: "high" as const,
          dueDate: "Jun 18",
          assignee: {
            name: "Maria Garcia",
            initials: "MG",
          },
        },
        {
          id: "task-4",
          title: "SEO Audit",
          description: "Identify SEO improvement opportunities",
          priority: "medium" as const,
          dueDate: "Jun 22",
          assignee: {
            name: "James Smith",
            initials: "JS",
          },
        },
        {
          id: "task-5",
          title: "Mobile Responsive Design",
          description: "Ensure design works well on all devices",
          priority: "high" as const,
          dueDate: "Jun 19",
          assignee: {
            name: "David Lee",
            initials: "DL",
          },
        },
      ],
    },
    {
      id: "review",
      title: "Review",
      tasks: [
        {
          id: "task-6",
          title: "Homepage Mockup",
          description: "Review final homepage design mockup",
          priority: "medium" as const,
          dueDate: "Jun 15",
          assignee: {
            name: "Alex Johnson",
            initials: "AJ",
          },
        },
      ],
    },
    {
      id: "completed",
      title: "Completed",
      tasks: [
        {
          id: "task-7",
          title: "Client Meeting Notes",
          description: "Document requirements from initial client meeting",
          priority: "low" as const,
          dueDate: "Jun 10",
          assignee: {
            name: "Maria Garcia",
            initials: "MG",
          },
        },
        {
          id: "task-8",
          title: "Project Timeline",
          description: "Create project timeline with milestones",
          priority: "medium" as const,
          dueDate: "Jun 12",
          assignee: {
            name: "James Smith",
            initials: "JS",
          },
        },
      ],
    },
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Projects</h1>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="mb-4">
            <TabsTrigger value="active">Active Projects</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="all">All Projects</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project: Agency Website Redesign</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectKanban
                  initialColumns={kanbanColumns}
                  onTaskMove={(result) => console.log("Task moved:", result)}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="completed">
            <div className="flex items-center justify-center h-[200px] border-2 border-dashed rounded-md">
              <p className="text-muted-foreground">Completed projects will appear here</p>
            </div>
          </TabsContent>
          
          <TabsContent value="all">
            <div className="flex items-center justify-center h-[200px] border-2 border-dashed rounded-md">
              <p className="text-muted-foreground">All projects will appear here</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Projects;

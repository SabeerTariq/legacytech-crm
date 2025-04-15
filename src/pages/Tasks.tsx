
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProjectKanban from "@/components/projects/ProjectKanban";
import { KanbanColumn, KanbanTask } from "@/components/projects/ProjectKanban";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarIcon, Filter, PlusCircle } from "lucide-react";

const Tasks = () => {
  // Mock data for tasks by department
  const departmentColumns: Record<string, KanbanColumn[]> = {
    design: [
      {
        id: "todo",
        title: "To Do",
        tasks: [
          {
            id: "design-1",
            title: "Homepage Mockup",
            description: "Create mockup for client homepage",
            priority: "high" as const,
            dueDate: "Jun 18",
            assignee: {
              name: "Sarah Wilson",
              initials: "SW",
            },
          },
          {
            id: "design-2",
            title: "Logo Variations",
            description: "Create 3 variations of the logo",
            priority: "medium" as const,
            dueDate: "Jun 20",
            assignee: {
              name: "Maria Garcia",
              initials: "MG",
            },
          },
        ],
      },
      {
        id: "in-progress",
        title: "In Progress",
        tasks: [
          {
            id: "design-3",
            title: "Product Page Design",
            description: "Design the product showcase page",
            priority: "medium" as const,
            dueDate: "Jun 19",
            assignee: {
              name: "Sarah Wilson",
              initials: "SW",
            },
          },
        ],
      },
      {
        id: "completed",
        title: "Completed",
        tasks: [
          {
            id: "design-4",
            title: "Color Palette",
            description: "Finalize color scheme for the brand",
            priority: "low" as const,
            dueDate: "Jun 15",
            assignee: {
              name: "Maria Garcia",
              initials: "MG",
            },
          },
        ],
      },
    ],
    development: [
      {
        id: "todo",
        title: "To Do",
        tasks: [
          {
            id: "dev-1",
            title: "Setup API Integration",
            description: "Connect frontend with the API endpoints",
            priority: "high" as const,
            dueDate: "Jun 22",
            assignee: {
              name: "James Smith",
              initials: "JS",
            },
          },
        ],
      },
      {
        id: "in-progress",
        title: "In Progress",
        tasks: [
          {
            id: "dev-2",
            title: "Homepage Implementation",
            description: "Convert design to code for homepage",
            priority: "high" as const,
            dueDate: "Jun 20",
            assignee: {
              name: "David Lee",
              initials: "DL",
            },
          },
          {
            id: "dev-3",
            title: "User Authentication",
            description: "Implement login/signup functionality",
            priority: "medium" as const,
            dueDate: "Jun 21",
            assignee: {
              name: "James Smith",
              initials: "JS",
            },
          },
        ],
      },
      {
        id: "completed",
        title: "Completed",
        tasks: [
          {
            id: "dev-4",
            title: "Project Setup",
            description: "Setup development environment",
            priority: "low" as const,
            dueDate: "Jun 16",
            assignee: {
              name: "David Lee",
              initials: "DL",
            },
          },
        ],
      },
    ],
    marketing: [
      {
        id: "todo",
        title: "To Do",
        tasks: [
          {
            id: "mkt-1",
            title: "Social Media Campaign",
            description: "Plan social media strategy for launch",
            priority: "medium" as const,
            dueDate: "Jun 25",
            assignee: {
              name: "Alex Johnson",
              initials: "AJ",
            },
          },
        ],
      },
      {
        id: "in-progress",
        title: "In Progress",
        tasks: [
          {
            id: "mkt-2",
            title: "SEO Optimization",
            description: "Improve website SEO ranking",
            priority: "high" as const,
            dueDate: "Jun 23",
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
        tasks: [],
      },
    ],
    content: [
      {
        id: "todo",
        title: "To Do",
        tasks: [
          {
            id: "cnt-1",
            title: "Product Descriptions",
            description: "Write copy for product pages",
            priority: "medium" as const,
            dueDate: "Jun 24",
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
            id: "cnt-2",
            title: "Blog Article",
            description: "Write article about industry trends",
            priority: "low" as const,
            dueDate: "Jun 26",
            assignee: {
              name: "Maria Garcia",
              initials: "MG",
            },
          },
        ],
      },
      {
        id: "completed",
        title: "Completed",
        tasks: [
          {
            id: "cnt-3",
            title: "Homepage Copy",
            description: "Write main content for homepage",
            priority: "high" as const,
            dueDate: "Jun 17",
            assignee: {
              name: "Sarah Wilson",
              initials: "SW",
            },
          },
        ],
      },
    ],
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Tasks</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Calendar
            </Button>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Tasks</TabsTrigger>
            <TabsTrigger value="design">Design</TabsTrigger>
            <TabsTrigger value="development">Development</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Department Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectKanban
                  initialColumns={[
                    {
                      id: "todo",
                      title: "To Do",
                      tasks: [
                        ...departmentColumns.design[0].tasks,
                        ...departmentColumns.development[0].tasks,
                        ...departmentColumns.marketing[0].tasks,
                        ...departmentColumns.content[0].tasks,
                      ],
                    },
                    {
                      id: "in-progress",
                      title: "In Progress",
                      tasks: [
                        ...departmentColumns.design[1].tasks,
                        ...departmentColumns.development[1].tasks,
                        ...departmentColumns.marketing[1].tasks,
                        ...departmentColumns.content[1].tasks,
                      ],
                    },
                    {
                      id: "completed",
                      title: "Completed",
                      tasks: [
                        ...departmentColumns.design[2].tasks,
                        ...departmentColumns.development[2].tasks,
                        ...departmentColumns.marketing[2].tasks,
                        ...departmentColumns.content[2].tasks,
                      ],
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="design">
            <Card>
              <CardHeader>
                <CardTitle>Design Department Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectKanban initialColumns={departmentColumns.design} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="development">
            <Card>
              <CardHeader>
                <CardTitle>Development Department Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectKanban initialColumns={departmentColumns.development} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="marketing">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Department Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectKanban initialColumns={departmentColumns.marketing} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Department Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectKanban initialColumns={departmentColumns.content} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default Tasks;

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProjectKanban from "@/components/projects/ProjectKanban";
import { KanbanColumn, KanbanTask } from "@/components/projects/ProjectKanban";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarIcon, Filter, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import NewTaskDialog from "@/components/tasks/NewTaskDialog";
import { supabase } from "@/integrations/supabase/client";

const Tasks = () => {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  
  // Mock data for tasks by department
  const [departmentColumns, setDepartmentColumns] = useState<Record<string, KanbanColumn[]>>({
    design: [
      { id: "todo", title: "To Do", tasks: [] },
      { id: "in-progress", title: "In Progress", tasks: [] },
      { id: "done", title: "Done", tasks: [] },
    ],
    development: [
      { id: "todo", title: "To Do", tasks: [] },
      { id: "in-progress", title: "In Progress", tasks: [] },
      { id: "done", title: "Done", tasks: [] },
    ],
    marketing: [
      { id: "todo", title: "To Do", tasks: [] },
      { id: "in-progress", title: "In Progress", tasks: [] },
      { id: "done", title: "Done", tasks: [] },
    ],
    content: [
      { id: "todo", title: "To Do", tasks: [] },
      { id: "in-progress", title: "In Progress", tasks: [] },
      { id: "done", title: "Done", tasks: [] },
    ],
  });

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, name')
          .order('name');

        if (error) {
          console.error('Error fetching projects:', error);
          toast.error('Failed to load projects');
          return;
        }

        setProjects(data || []);
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast.error('Failed to load projects');
      }
    };

    fetchProjects();
  }, []);

  const handleTaskCreated = (taskData: any) => {
    // Create a new task with unique ID
    const newTask: KanbanTask = {
      id: `${taskData.department}-${Date.now()}`,
      title: taskData.title,
      description: taskData.description,
      priority: taskData.priority,
      dueDate: taskData.dueDate,
      department: taskData.department,
      project_id: taskData.projectId,
      status: 'todo',
      assignee: {
        name: "You",
        initials: "YO",
      },
    };

    // Add the new task to the todo column of the appropriate department
    const updatedDepartmentColumns = { ...departmentColumns };
    updatedDepartmentColumns[taskData.department][0].tasks = [
      newTask,
      ...updatedDepartmentColumns[taskData.department][0].tasks,
    ];

    setDepartmentColumns(updatedDepartmentColumns);
    toast.success("Task created successfully!");
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
            <Button onClick={() => setIsNewTaskDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
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
                        ...departmentColumns.development?.[0]?.tasks || [],
                        ...departmentColumns.marketing?.[0]?.tasks || [],
                        ...departmentColumns.content?.[0]?.tasks || [],
                      ],
                    },
                    {
                      id: "in-progress",
                      title: "In Progress",
                      tasks: [
                        ...departmentColumns.design[1].tasks,
                        ...departmentColumns.development?.[1]?.tasks || [],
                        ...departmentColumns.marketing?.[1]?.tasks || [],
                        ...departmentColumns.content?.[1]?.tasks || [],
                      ],
                    },
                    {
                      id: "completed",
                      title: "Completed",
                      tasks: [
                        ...departmentColumns.design[2].tasks,
                        ...departmentColumns.development?.[2]?.tasks || [],
                        ...departmentColumns.marketing?.[2]?.tasks || [],
                        ...departmentColumns.content?.[2]?.tasks || [],
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
                <ProjectKanban initialColumns={departmentColumns.development || []} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="marketing">
            <Card>
              <CardHeader>
                <CardTitle>Marketing Department Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectKanban initialColumns={departmentColumns.marketing || []} />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Content Department Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <ProjectKanban initialColumns={departmentColumns.content || []} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <NewTaskDialog
        open={isNewTaskDialogOpen}
        onOpenChange={setIsNewTaskDialogOpen}
        onTaskCreated={handleTaskCreated}
        departments={["design", "development", "marketing", "content"]}
        projects={projects}
      />
    </MainLayout>
  );
};

export default Tasks;

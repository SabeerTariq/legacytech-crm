
import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProjectKanban from "@/components/projects/ProjectKanban";
import { KanbanColumn } from "@/components/projects/ProjectKanban";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CalendarIcon, Filter, PlusCircle } from "lucide-react";
import { toast } from "sonner";
import NewTaskDialog from "@/components/tasks/NewTaskDialog";
import { useTasks } from "@/hooks/useTasks";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";

const Tasks = () => {
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([]);
  const { tasks: allTasks, isLoading } = useTasks();
  
  // Initialize department columns
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

  // Update columns when tasks change
  useEffect(() => {
    if (allTasks?.length) {
      // Group tasks by department
      const tasksByDepartment: Record<string, Task[]> = {};
      
      allTasks.forEach(task => {
        const department = task.department?.toLowerCase() || 'general';
        if (!tasksByDepartment[department]) {
          tasksByDepartment[department] = [];
        }
        tasksByDepartment[department].push(task);
      });
      
      // Update department columns
      const updatedColumns = { ...departmentColumns };
      
      Object.keys(updatedColumns).forEach(dept => {
        const deptTasks = tasksByDepartment[dept] || [];
        
        // Reset all columns
        updatedColumns[dept].forEach(column => {
          column.tasks = [];
        });
        
        // Populate columns based on task status
        deptTasks.forEach(task => {
          const kanbanTask = {
            id: task.id,
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            dueDate: task.due_date,
            department: task.department,
            project_id: task.project_id,
            status: task.status,
            assignee: task.assigned_to_id ? {
              name: "Assigned",
              initials: "AS",
            } : undefined,
          };
          
          const statusColumnMap: Record<string, string> = {
            'todo': 'todo',
            'in-progress': 'in-progress',
            'completed': 'done'
          };
          
          const columnId = statusColumnMap[task.status] || 'todo';
          const column = updatedColumns[dept].find(c => c.id === columnId);
          
          if (column) {
            column.tasks.push(kanbanTask);
          }
        });
      });
      
      setDepartmentColumns(updatedColumns);
    }
  }, [allTasks]);

  const handleTaskCreated = (taskData: any) => {
    toast.success("Task created successfully!");
    // Tasks will be refreshed automatically through React Query
  };

  // Display loading state while tasks are loading
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-3xl font-bold">Tasks</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading tasks...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

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

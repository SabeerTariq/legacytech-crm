import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { KanbanColumn } from "@/components/projects/ProjectKanban";
import { toast } from "sonner";
import NewTaskDialog from "@/components/tasks/NewTaskDialog";
import { useTasks } from "@/hooks/useTasks";
import { supabase } from "@/integrations/supabase/client";
import TasksLoading from "@/components/tasks/TasksLoading";
import TasksHeader from "@/components/tasks/TasksHeader";
import TasksTabs from "@/components/tasks/TasksTabs";
import { Task } from "@/types/task"; // Add this import

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

  // Track combined columns for "All Tasks" tab
  const [allTaskColumns, setAllTaskColumns] = useState<KanbanColumn[]>([
    { id: "todo", title: "To Do", tasks: [] },
    { id: "in-progress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ]);

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
      console.log("Tasks loaded:", allTasks.length);
      
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
      
      // Create status buckets for all tasks view
      const allTodoTasks: any[] = [];
      const allInProgressTasks: any[] = [];
      const allDoneTasks: any[] = [];
      
      // First, process all tasks for the "All Tasks" view
      allTasks.forEach(task => {
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
          'completed': 'done',
          'done': 'done'
        };
        
        const columnId = statusColumnMap[task.status?.toLowerCase()] || 'todo';
        
        if (columnId === 'todo') {
          allTodoTasks.push(kanbanTask);
        } else if (columnId === 'in-progress') {
          allInProgressTasks.push(kanbanTask);
        } else if (columnId === 'done') {
          allDoneTasks.push(kanbanTask);
        }
      });
      
      // Then process tasks for individual departments
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
            'completed': 'done',
            'done': 'done'
          };
          
          const columnId = statusColumnMap[task.status?.toLowerCase()] || 'todo';
          const column = updatedColumns[dept].find(c => c.id === columnId);
          
          if (column) {
            column.tasks.push(kanbanTask);
          }
        });
      });
      
      setDepartmentColumns(updatedColumns);
      
      // Update all tasks columns
      setAllTaskColumns([
        { id: "todo", title: "To Do", tasks: allTodoTasks },
        { id: "in-progress", title: "In Progress", tasks: allInProgressTasks },
        { id: "done", title: "Done", tasks: allDoneTasks },
      ]);
      
      console.log("All tasks processed:", allTodoTasks.length + allInProgressTasks.length + allDoneTasks.length);
    }
  }, [allTasks]);

  const handleTaskCreated = (taskData: any) => {
    toast.success("Task created successfully!");
    // Tasks will be refreshed automatically through React Query
  };

  if (isLoading) {
    return (
      <MainLayout>
        <TasksLoading />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <TasksHeader onNewTask={() => setIsNewTaskDialogOpen(true)} />
        <TasksTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          allTaskColumns={allTaskColumns}
          departmentColumns={departmentColumns}
        />
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

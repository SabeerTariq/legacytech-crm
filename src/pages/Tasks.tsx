
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
import { Task } from "@/types/task"; // Import Task type

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

  // Process tasks immediately when they're available or loading state changes
  useEffect(() => {
    // Only process tasks when they're available (not loading and exist)
    if (allTasks) {
      console.log("Processing tasks:", allTasks.length);
      
      // Create status buckets for all tasks view
      const allTodoTasks: any[] = [];
      const allInProgressTasks: any[] = [];
      const allDoneTasks: any[] = [];
      
      // Group tasks by department
      const tasksByDepartment: Record<string, Task[]> = {};
      
      // Process all tasks
      allTasks.forEach(task => {
        // Group by department for department-specific views
        const department = task.department?.toLowerCase() || 'general';
        if (!tasksByDepartment[department]) {
          tasksByDepartment[department] = [];
        }
        tasksByDepartment[department].push(task);
        
        // Create kanban task object
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
        
        // Determine which column the task belongs to for all tasks view
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
      
      // Update all tasks columns immediately
      setAllTaskColumns([
        { id: "todo", title: "To Do", tasks: allTodoTasks },
        { id: "in-progress", title: "In Progress", tasks: allInProgressTasks },
        { id: "done", title: "Done", tasks: allDoneTasks },
      ]);
      
      // Process tasks for individual departments
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
      console.log("All tasks processed:", allTodoTasks.length + allInProgressTasks.length + allDoneTasks.length);
    }
  }, [allTasks]); // Only depend on allTasks changes

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

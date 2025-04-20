import React, { useState, useEffect } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { MoreHorizontal, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TaskAssignmentDialog from "@/components/tasks/TaskAssignmentDialog";
import { useTasks } from "@/hooks/useTasks";
import { toast } from "sonner";

export interface KanbanTask {
  id: string;
  title: string;
  description?: string;
  department: string;
  priority: "low" | "medium" | "high";
  dueDate?: string;
  project_id: string;
  status: string;
  assignee?: {
    name: string;
    avatar?: string;
    initials: string;
  };
}

export interface KanbanColumn {
  id: string;
  title: string;
  tasks: KanbanTask[];
}

interface ProjectKanbanProps {
  initialColumns?: KanbanColumn[];
  projects?: any[]; // Projects from Supabase
  onTaskMove?: (result: any) => void;
}

const ProjectKanban: React.FC<ProjectKanbanProps> = ({ initialColumns = [], projects = [], onTaskMove }) => {
  const [columns, setColumns] = useState<KanbanColumn[]>(initialColumns);
  const [selectedTask, setSelectedTask] = useState<KanbanTask | null>(null);
  const [isAssignmentDialogOpen, setIsAssignmentDialogOpen] = useState(false);
  const { assignTask } = useTasks();

  // Update the task conversion to include department
  useEffect(() => {
    if (projects && projects.length > 0 && initialColumns.length === 0) {
      const todoTasks: KanbanTask[] = [];
      const inProgressTasks: KanbanTask[] = [];
      const completedTasks: KanbanTask[] = [];
      
      projects.forEach(project => {
        const task: KanbanTask = {
          id: project.id,
          title: project.name,
          description: project.description || `Client: ${project.client}`,
          department: project.department || "general",
          priority: project.status === "completed" ? "low" : project.status === "approved" ? "medium" : "high",
          dueDate: project.due_date ? new Date(project.due_date).toLocaleDateString() : undefined,
          project_id: project.id,
          status: project.status || "todo"
        };
        
        if (["completed", "approved"].includes(project.status)) {
          completedTasks.push(task);
        } else if (["in-progress", "review"].includes(project.status)) {
          inProgressTasks.push(task);
        } else {
          todoTasks.push(task);
        }
      });
      
      const derivedColumns: KanbanColumn[] = [
        { id: "todo", title: "To Do", tasks: todoTasks },
        { id: "in-progress", title: "In Progress", tasks: inProgressTasks },
        { id: "completed", title: "Completed", tasks: completedTasks }
      ];
      
      setColumns(derivedColumns);
    }
  }, [projects, initialColumns]);

  const priorityColors = {
    low: "bg-blue-500",
    medium: "bg-amber-500",
    high: "bg-red-500",
  };

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // Dropped outside a droppable area
    if (!destination) return;

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Find the task that was dragged
    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destinationColumn = columns.find(col => col.id === destination.droppableId);

    if (!sourceColumn || !destinationColumn) return;

    // Task moved within the same column
    if (source.droppableId === destination.droppableId) {
      const newTasks = Array.from(sourceColumn.tasks);
      const [removed] = newTasks.splice(source.index, 1);
      newTasks.splice(destination.index, 0, removed);

      const newColumns = columns.map(col => 
        col.id === sourceColumn.id ? { ...col, tasks: newTasks } : col
      );

      setColumns(newColumns);
    } 
    // Task moved to a different column
    else {
      const sourceTasks = Array.from(sourceColumn.tasks);
      const [removed] = sourceTasks.splice(source.index, 1);
      const destinationTasks = Array.from(destinationColumn.tasks);
      destinationTasks.splice(destination.index, 0, removed);

      const newColumns = columns.map(col => {
        if (col.id === source.droppableId) {
          return { ...col, tasks: sourceTasks };
        }
        if (col.id === destination.droppableId) {
          return { ...col, tasks: destinationTasks };
        }
        return col;
      });

      setColumns(newColumns);
    }

    if (onTaskMove) {
      onTaskMove(result);
    }
  };

  const handleAssignTask = (task: KanbanTask) => {
    setSelectedTask(task);
    setIsAssignmentDialogOpen(true);
  };

  const handleEditTask = (task: KanbanTask) => {
    // TODO: Implement edit task functionality
    toast.info("Edit task functionality coming soon");
  };

  const handleTaskAssignment = async (employeeId: string) => {
    if (!selectedTask) return;

    try {
      await assignTask.mutateAsync({
        taskId: selectedTask.id,
        employeeId,
      });
      toast.success("Task assigned successfully");
      setIsAssignmentDialogOpen(false);
    } catch (error) {
      toast.error("Failed to assign task");
      console.error(error);
    }
  };

  return (
    <>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {columns.map((column) => (
            <div key={column.id} className="kanban-column min-w-[300px] w-1/3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-sm">{column.title} ({column.tasks.length})</h3>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="min-h-[200px] bg-gray-50 p-2 rounded-md h-[calc(100vh-15rem)] overflow-auto"
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="task-card mb-2 p-3"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium text-sm">{task.title}</h4>
                              <div className="flex items-center gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleAssignTask(task)}
                                  className="h-6 px-2 text-xs"
                                >
                                  Assign
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <MoreHorizontal className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="w-36">
                                    <DropdownMenuItem onClick={() => handleEditTask(task)}>Edit</DropdownMenuItem>
                                    <DropdownMenuItem className="text-red-500">Delete</DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            {task.description && (
                              <p className="text-xs text-muted-foreground mb-2">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {task.assignee && (
                                  <Avatar className="h-5 w-5">
                                    <AvatarImage src={task.assignee.avatar} />
                                    <AvatarFallback className="text-[10px]">
                                      {task.assignee.initials}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                {task.dueDate && (
                                  <span className="text-xs text-muted-foreground">
                                    {task.dueDate}
                                  </span>
                                )}
                              </div>
                              <Badge 
                                className={`${priorityColors[task.priority]} text-white text-xs px-1.5 py-0.5`}
                              >
                                {task.priority}
                              </Badge>
                            </div>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {selectedTask && (
        <TaskAssignmentDialog
          open={isAssignmentDialogOpen}
          onOpenChange={setIsAssignmentDialogOpen}
          task={{
            id: selectedTask.id,
            title: selectedTask.title,
            department: selectedTask.department,
            project_id: selectedTask.project_id
          }}
        />
      )}
    </>
  );
};

export default ProjectKanban;

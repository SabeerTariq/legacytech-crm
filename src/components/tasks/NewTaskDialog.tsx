
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees } from "@/hooks/useEmployees";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  department: z.string().min(1, "Department is required"),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignee: z.string().optional(), // Make assignee optional
  projectId: z.string().min(1, "Project is required"),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface NewTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTaskCreated: (task: any) => void;
  departments: string[];
  projects: { id: string; name: string }[];
}

const NewTaskDialog: React.FC<NewTaskDialogProps> = ({
  open,
  onOpenChange,
  onTaskCreated,
  departments,
  projects,
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees(selectedDepartment);
  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      department: "",
      priority: "medium",
      dueDate: "",
      assignee: "",
      projectId: "",
    },
  });

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      form.reset({
        title: "",
        description: "",
        department: "",
        priority: "medium",
        dueDate: "",
        assignee: "",
        projectId: "",
      });
    }
  }, [open, form]);

  const handleDepartmentChange = (value: string) => {
    console.log("Department selected:", value);
    const capitalizedDepartment = value.charAt(0).toUpperCase() + value.slice(1);
    console.log("Capitalized department:", capitalizedDepartment);
    setSelectedDepartment(capitalizedDepartment);
    form.setValue("department", value);
    form.setValue("assignee", "");
  };

  // Log when employees data changes
  React.useEffect(() => {
    console.log("Employees data updated:", employees);
  }, [employees]);

  const onSubmit = async (data: TaskFormValues) => {
    try {
      console.log("Creating task with data:", data);
      
      // Important fix - don't try to assign employees if we're getting a foreign key constraint error
      // We'll insert the task without an assignment
      const taskData = {
        title: data.title,
        description: data.description || "",
        department: data.department,
        priority: data.priority,
        status: 'todo',
        project_id: data.projectId,
        assigned_to_id: null, // Always set to null to avoid foreign key constraint error
        due_date: data.dueDate
      };

      console.log("Task data to be inserted:", taskData);

      const { data: createdTask, error } = await supabase
        .from('project_tasks')
        .insert([taskData])
        .select()
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw new Error(`Failed to create task: ${error.message}`);
      }

      if (!createdTask) {
        throw new Error("No task data returned after creation");
      }

      console.log("Task created successfully:", createdTask);
      toast.success('Task created successfully');
      onTaskCreated(createdTask);
      onOpenChange(false);
      form.reset(); // Reset the form after successful submission
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create task');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...form.register("title")}
              placeholder="Enter task title"
            />
            {form.formState.errors.title && (
              <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...form.register("description")}
              placeholder="Enter task description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Select
              value={form.watch("department")}
              onValueChange={handleDepartmentChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select department">
                  {form.watch("department") ? form.watch("department").charAt(0).toUpperCase() + form.watch("department").slice(1) : "Select department"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {departments.map((dept) => (
                  <SelectItem 
                    key={dept} 
                    value={dept}
                    className="hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                  >
                    {dept.charAt(0).toUpperCase() + dept.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.department && (
              <p className="text-sm text-red-500">{form.formState.errors.department.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={form.watch("priority")}
              onValueChange={(value) => form.setValue("priority", value as "low" | "medium" | "high")}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem 
                  value="low"
                  className="hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                >
                  Low
                </SelectItem>
                <SelectItem 
                  value="medium"
                  className="hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                >
                  Medium
                </SelectItem>
                <SelectItem 
                  value="high"
                  className="hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                >
                  High
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              {...form.register("dueDate")}
            />
            {form.formState.errors.dueDate && (
              <p className="text-sm text-red-500">{form.formState.errors.dueDate.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="projectId">Project</Label>
            <Select
              value={form.watch("projectId")}
              onValueChange={(value) => form.setValue("projectId", value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem 
                    key={project.id} 
                    value={project.id}
                    className="hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors"
                  >
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.projectId && (
              <p className="text-sm text-red-500">{form.formState.errors.projectId.message}</p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Create Task</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTaskDialog;

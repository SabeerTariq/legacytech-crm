import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees } from "@/hooks/useEmployees";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface TaskAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: {
    id: string;
    title: string;
    department: string;
    project_id: string;
  };
}

const TaskAssignmentDialog: React.FC<TaskAssignmentDialogProps> = ({
  open,
  onOpenChange,
  task,
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: employees = [], isLoading } = useEmployees(task.department);

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    setIsSubmitting(true);

    try {
      // First, check if the task exists
      const { data: taskData, error: taskCheckError } = await supabase
        .from("project_tasks")
        .select("*")
        .eq("id", task.id)
        .single();

      if (taskCheckError) {
        console.error("Task check error:", taskCheckError);
        throw new Error("Task not found. Please try again.");
      }

      // Update task assignment
      const { error: taskError } = await supabase
        .from("project_tasks")
        .update({ 
          assigned_to_id: selectedEmployee,
          status: "in-progress"
        })
        .eq("id", task.id);

      if (taskError) {
        console.error("Task update error:", taskError);
        throw new Error("Failed to update task assignment");
      }

      // Update employee's total tasks assigned
      const employee = employees.find(emp => emp.id === selectedEmployee);
      if (employee) {
        const performance = employee.performance || {};
        const { error: employeeError } = await supabase
          .from("employees")
          .update({
            performance: {
              ...performance,
              total_tasks_assigned: (performance.total_tasks_assigned || 0) + 1
            }
          })
          .eq("id", selectedEmployee);

        if (employeeError) {
          console.error("Employee update error:", employeeError);
          throw new Error("Failed to update employee performance");
        }
      }

      toast.success("Task assigned successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Assignment error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to assign task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign Task</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Task</Label>
            <p className="text-sm font-medium">{task.title}</p>
          </div>
          <div className="space-y-2">
            <Label>Department</Label>
            <p className="text-sm font-medium capitalize">{task.department}</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="employee">Assign to</Label>
            <Select 
              value={selectedEmployee} 
              onValueChange={setSelectedEmployee}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={isLoading ? "Loading employees..." : "Select employee"} />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting || !selectedEmployee}
          >
            {isSubmitting ? "Assigning..." : "Assign Task"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskAssignmentDialog; 
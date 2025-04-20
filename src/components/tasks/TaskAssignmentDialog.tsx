import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEmployees } from "@/hooks/useEmployees";
import { toast } from "sonner";
import { useTasks } from "@/hooks/useTasks";

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
  const { assignTask } = useTasks();

  const handleSubmit = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the assignTask mutation from the useTasks hook
      await assignTask.mutateAsync({ 
        taskId: task.id,
        employeeId: selectedEmployee
      });

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

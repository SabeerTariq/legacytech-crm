import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task, TaskAssignment } from "@/types/task";

export const useTasks = (department?: string) => {
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", department],
    queryFn: async () => {
      let query = supabase.from("project_tasks").select("*");
      
      if (department) {
        query = query.eq("department", department);
      }

      const { data, error } = await query;
      
      if (error) throw error;
      return data as Task[];
    },
  });

  const assignTask = useMutation({
    mutationFn: async ({ taskId, employeeId }: { taskId: string; employeeId: string }) => {
      const { error: taskError } = await supabase
        .from("project_tasks")
        .update({ assignee_id: employeeId })
        .eq("id", taskId);

      if (taskError) throw taskError;

      const { error: assignmentError } = await supabase
        .from("task_assignments")
        .insert({
          task_id: taskId,
          employee_id: employeeId,
          assigned_at: new Date().toISOString(),
          completed_on_time: false,
        });

      if (assignmentError) throw assignmentError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: Task["status"] }) => {
      const { error } = await supabase
        .from("project_tasks")
        .update({ status })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const addStrike = useMutation({
    mutationFn: async ({ taskId, employeeId }: { taskId: string; employeeId: string }) => {
      // Update task assignment to mark as completed late
      const { error: assignmentError } = await supabase
        .from("task_assignments")
        .update({ completed_on_time: false })
        .eq("task_id", taskId)
        .eq("employee_id", employeeId);

      if (assignmentError) throw assignmentError;

      // Get current employee performance
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("performance")
        .eq("id", employeeId)
        .single();

      if (employeeError) throw employeeError;

      // Update employee performance with strike and late completion
      const performance = employee.performance as any;
      const { error: updateError } = await supabase
        .from("employees")
        .update({
          performance: {
            ...performance,
            strikes: (performance.strikes || 0) + 1,
            tasks_completed_late: (performance.tasks_completed_late || 0) + 1
          }
        })
        .eq("id", employeeId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  return {
    tasks,
    isLoading,
    assignTask,
    updateTaskStatus,
    addStrike,
  };
}; 

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Task } from "@/types/task";

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
      // Update task with the employee ID
      const { error: taskError } = await supabase
        .from("project_tasks")
        .update({ assigned_to_id: employeeId })
        .eq("id", taskId);

      if (taskError) throw taskError;

      // Store assignment data in employee performance metrics instead of separate table
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("performance")
        .eq("id", employeeId)
        .single();

      if (employeeError) throw employeeError;

      // Update employee performance metrics
      const performance = employee?.performance || {};
      const { error: updateError } = await supabase
        .from("employees")
        .update({
          performance: {
            ...performance,
            total_tasks_assigned: (performance.total_tasks_assigned || 0) + 1
          }
        })
        .eq("id", employeeId);

      if (updateError) throw updateError;
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
      // Get current employee performance
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("performance")
        .eq("id", employeeId)
        .single();

      if (employeeError) throw employeeError;

      // Update employee performance with strike and late completion directly
      const performance = employee?.performance || {};
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

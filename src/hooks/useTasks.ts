
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
      console.log("Assigning task", taskId, "to employee", employeeId);
      
      // Check if the employee exists in the users table first to avoid foreign key errors
      const { data: employeeData, error: employeeCheckError } = await supabase
        .from("employees")
        .select("id")
        .eq("id", employeeId)
        .single();
        
      if (employeeCheckError || !employeeData) {
        console.error("Employee not found:", employeeCheckError);
        throw new Error("Employee not found. Cannot assign task.");
      }
      
      // Update task with the employee ID
      const { error: taskError } = await supabase
        .from("project_tasks")
        .update({ 
          assigned_to_id: employeeId,
          status: "in-progress" 
        })
        .eq("id", taskId);

      if (taskError) {
        console.error("Task assignment error:", taskError);
        throw taskError;
      }

      // Store assignment data in employee performance metrics
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("performance")
        .eq("id", employeeId)
        .single();

      if (employeeError) {
        console.error("Employee fetch error:", employeeError);
        throw employeeError;
      }

      // Safely handle performance data
      const performanceData = employee?.performance || {};
      
      // Type safety for performance data
      const totalTasksAssigned = typeof performanceData === 'object' ? 
        ((performanceData as any).total_tasks_assigned || 0) : 0;
      
      const { error: updateError } = await supabase
        .from("employees")
        .update({
          performance: {
            ...performanceData as object,
            total_tasks_assigned: totalTasksAssigned + 1
          }
        })
        .eq("id", employeeId);

      if (updateError) {
        console.error("Employee update error:", updateError);
        throw updateError;
      }
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

      // Safely handle performance data
      const performanceData = employee?.performance || {};
      
      // Type safety for performance data
      const strikes = typeof performanceData === 'object' ? 
        ((performanceData as any).strikes || 0) : 0;
        
      const lateCompletions = typeof performanceData === 'object' ? 
        ((performanceData as any).tasks_completed_late || 0) : 0;
      
      const { error: updateError } = await supabase
        .from("employees")
        .update({
          performance: {
            ...performanceData as object,
            strikes: strikes + 1,
            tasks_completed_late: lateCompletions + 1
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

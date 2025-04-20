
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
      
      if (error) {
        console.error("Error fetching tasks:", error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} tasks${department ? ` for department ${department}` : ''}`);
      return data as Task[];
    },
  });

  const assignTask = useMutation({
    mutationFn: async ({ taskId, employeeId }: { taskId: string; employeeId: string }) => {
      console.log("Assigning task", taskId, "to employee", employeeId);
      
      // First validate the employee exists
      const { data: employeeData, error: employeeCheckError } = await supabase
        .from("employees")
        .select("id, name")
        .eq("id", employeeId)
        .single();
        
      if (employeeCheckError || !employeeData) {
        console.error("Employee validation error:", employeeCheckError);
        throw new Error("Employee not found or not accessible. Cannot assign task.");
      }
      
      console.log("Employee verified:", employeeData.name);
      
      // Now update the task with the employee ID
      const { data: updatedTask, error: taskError } = await supabase
        .from("project_tasks")
        .update({ 
          assigned_to_id: employeeId,
          status: "in-progress" 
        })
        .eq("id", taskId)
        .select()
        .single();

      if (taskError) {
        console.error("Task assignment error:", taskError);
        throw new Error(`Failed to assign task: ${taskError.message}`);
      }

      console.log("Task assigned successfully:", updatedTask);

      // Store assignment data in employee performance metrics
      const { data: employee, error: employeeError } = await supabase
        .from("employees")
        .select("performance")
        .eq("id", employeeId)
        .single();

      if (employeeError) {
        console.error("Employee fetch error:", employeeError);
        // Don't throw here - we've already assigned the task successfully
        // Just log the error and continue
      } else {
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
          // Don't throw here either - the task assignment was successful
        }
      }
      
      return updatedTask;
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

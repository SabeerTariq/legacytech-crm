
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmployeePerformance } from "@/types/employee";

interface PerformanceHistory {
  id: string;
  month: string;
  performance: EmployeePerformance;
}

export const useEmployeeHistory = (employeeId: string) => {
  return useQuery({
    queryKey: ["employee-history", employeeId],
    queryFn: async (): Promise<PerformanceHistory[]> => {
      const { data, error } = await supabase
        .from("employee_performance_history")
        .select("*")
        .eq("employee_id", employeeId)
        .order("month", { ascending: false });

      if (error) {
        throw error;
      }

      return data.map(record => ({
        id: record.id,
        month: record.month,
        performance: {
          salesTarget: Number(record.performance.sales_target ?? 0),
          salesAchieved: Number(record.performance.sales_achieved ?? 0),
          projectsCompleted: Number(record.performance.projects_completed ?? 0),
          tasksCompleted: Number(record.performance.tasks_completed ?? 0),
          customerSatisfaction: Number(record.performance.customer_satisfaction ?? 0),
          avgTaskCompletionTime: Number(record.performance.avg_task_completion_time ?? 0)
        }
      }));
    }
  });
};


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmployeePerformance, ProductionPerformance, SalesPerformance } from "@/types/employee";

interface PerformanceHistory {
  id: string;
  month: string;
  performance: EmployeePerformance;
}

const isProductionDepartment = (department: string) => {
  return ['Design', 'Development', 'Marketing', 'Content'].includes(department);
};

const parsePerformance = (performance: any, department: string): EmployeePerformance => {
  if (isProductionDepartment(department)) {
    return {
      total_tasks_assigned: Number(performance.total_tasks_assigned ?? 0),
      tasks_completed_ontime: Number(performance.tasks_completed_ontime ?? 0),
      tasks_completed_late: Number(performance.tasks_completed_late ?? 0),
      strikes: Number(performance.strikes ?? 0),
      avg_completion_time: Number(performance.avg_completion_time ?? 0),
    } as ProductionPerformance;
  }

  return {
    salesTarget: Number(performance.sales_target ?? 0),
    salesAchieved: Number(performance.sales_achieved ?? 0),
    projectsCompleted: Number(performance.projects_completed ?? 0),
    tasksCompleted: Number(performance.tasks_completed ?? 0),
    customerSatisfaction: Number(performance.customer_satisfaction ?? 0),
    avgTaskCompletionTime: Number(performance.avg_task_completion_time ?? 0),
  } as SalesPerformance;
};

export const useEmployeeHistory = (employeeId: string, department: string) => {
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
        performance: parsePerformance(record.performance, department)
      }));
    }
  });
};

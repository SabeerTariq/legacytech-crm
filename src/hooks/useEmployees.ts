
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmployeeProfile } from "@/types/employee";

export const useEmployees = (department: string) => {
  return useQuery({
    queryKey: ["employees", department],
    queryFn: async (): Promise<EmployeeProfile[]> => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("department", department);

      if (error) {
        throw error;
      }

      return data.map(employee => {
        const performance = employee.performance as Record<string, number>;
        return {
          ...employee,
          joinDate: employee.join_date,
          performance: {
            salesTarget: Number(performance.sales_target ?? 0),
            salesAchieved: Number(performance.sales_achieved ?? 0),
            projectsCompleted: Number(performance.projects_completed ?? 0),
            tasksCompleted: Number(performance.tasks_completed ?? 0),
            customerSatisfaction: Number(performance.customer_satisfaction ?? 0),
            avgTaskCompletionTime: Number(performance.avg_task_completion_time ?? 0)
          }
        };
      });
    }
  });
};

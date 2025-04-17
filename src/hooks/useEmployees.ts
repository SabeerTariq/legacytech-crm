
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
        const performance = employee.performance || {};
        
        return {
          ...employee,
          joinDate: employee.join_date,
          performance: {
            salesTarget: Number(performance.salesTarget ?? 0),
            salesAchieved: Number(performance.salesAchieved ?? 0),
            projectsCompleted: Number(performance.projectsCompleted ?? 0),
            tasksCompleted: Number(performance.tasksCompleted ?? 0),
            customerSatisfaction: Number(performance.customerSatisfaction ?? 0),
            avgTaskCompletionTime: Number(performance.avgTaskCompletionTime ?? 0)
          }
        };
      });
    }
  });
};


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

      return data.map(employee => ({
        ...employee,
        joinDate: employee.join_date,
        performance: {
          salesTarget: employee.performance.salesTarget || 0,
          salesAchieved: employee.performance.salesAchieved || 0,
          projectsCompleted: employee.performance.projectsCompleted || 0,
          tasksCompleted: employee.performance.tasksCompleted || 0,
          customerSatisfaction: employee.performance.customerSatisfaction || 0,
          avgTaskCompletionTime: employee.performance.avgTaskCompletionTime || 0
        }
      }));
    }
  });
};

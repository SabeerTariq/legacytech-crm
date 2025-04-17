
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
        // Ensure performance is treated as an object
        const performance = typeof employee.performance === 'object' && employee.performance !== null 
          ? employee.performance 
          : {};
        
        // Determine which type of performance data we're working with
        const isProductionDept = ['Design', 'Development', 'Marketing', 'Content'].includes(employee.department);
        
        if (isProductionDept) {
          return {
            ...employee,
            joinDate: employee.join_date,
            performance: {
              total_tasks_assigned: Number(performance?.total_tasks_assigned || 0),
              tasks_completed_ontime: Number(performance?.tasks_completed_ontime || 0),
              tasks_completed_late: Number(performance?.tasks_completed_late || 0),
              strikes: Number(performance?.strikes || 0),
              avg_completion_time: Number(performance?.avg_completion_time || 0)
            }
          };
        } else {
          return {
            ...employee,
            joinDate: employee.join_date,
            performance: {
              salesTarget: Number(performance?.salesTarget || 0),
              salesAchieved: Number(performance?.salesAchieved || 0),
              projectsCompleted: Number(performance?.projectsCompleted || 0),
              tasksCompleted: Number(performance?.tasksCompleted || 0),
              customerSatisfaction: Number(performance?.customerSatisfaction || 0),
              avgTaskCompletionTime: Number(performance?.avgTaskCompletionTime || 0)
            }
          };
        }
      });
    }
  });
};

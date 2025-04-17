
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

      console.log("Employees data:", data);

      return data.map(employee => {
        // Safely handle the performance object
        const performance = typeof employee.performance === 'object' && employee.performance 
          ? employee.performance 
          : {};
        
        // Ensure performance is treated as a record with string keys
        const performanceRecord = performance as Record<string, any>;
        
        // Determine which type of performance data we're working with
        const isProductionDept = ['Design', 'Development', 'Marketing', 'Content'].includes(employee.department);
        
        if (isProductionDept) {
          return {
            ...employee,
            joinDate: employee.join_date,
            performance: {
              total_tasks_assigned: Number(performanceRecord?.total_tasks_assigned || 0),
              tasks_completed_ontime: Number(performanceRecord?.tasks_completed_ontime || 0),
              tasks_completed_late: Number(performanceRecord?.tasks_completed_late || 0),
              strikes: Number(performanceRecord?.strikes || 0),
              avg_completion_time: Number(performanceRecord?.avg_completion_time || 0)
            }
          };
        } else {
          return {
            ...employee,
            joinDate: employee.join_date,
            performance: {
              salesTarget: Number(performanceRecord?.salesTarget || 0),
              salesAchieved: Number(performanceRecord?.salesAchieved || 0),
              projectsCompleted: Number(performanceRecord?.projectsCompleted || 0),
              tasksCompleted: Number(performanceRecord?.tasksCompleted || 0),
              customerSatisfaction: Number(performanceRecord?.customerSatisfaction || 0),
              avgTaskCompletionTime: Number(performanceRecord?.avgTaskCompletionTime || 0)
            }
          };
        }
      });
    }
  });
};

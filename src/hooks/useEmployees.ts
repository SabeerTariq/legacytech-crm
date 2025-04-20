
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmployeePerformance, SalesPerformance } from "@/types/employee";

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  join_date: string;
  joinDate: string; // Add this to match EmployeeProfile
  performance?: Partial<SalesPerformance> & Partial<Record<string, number | string>>; // Allow for both interfaces
}

export const useEmployees = (department?: string) => {
  return useQuery({
    queryKey: ["employees", department],
    queryFn: async () => {
      console.log("Fetching employees for department:", department);
      
      let query = supabase
        .from("employees")
        .select("*");

      if (department) {
        console.log("Filtering by department:", department);
        query = query.eq("department", department);
      }

      const { data, error } = await query;
      
      if (error) {
        console.error("Error fetching employees:", error);
        throw error;
      }
      
      console.log("Fetched employees:", data);

      // Transform the data to match the Employee interface
      const transformedData = data.map((emp: any) => ({
        ...emp,
        joinDate: emp.join_date, // Ensure joinDate is present
        performance: {
          // SalesPerformance fields
          salesTarget: emp.performance?.salesTarget || 0,
          salesAchieved: emp.performance?.salesAchieved || 0,
          projectsCompleted: emp.performance?.projectsCompleted || 0,
          tasksCompleted: emp.performance?.tasksCompleted || 0,
          customerSatisfaction: emp.performance?.customerSatisfaction || 0,
          avgTaskCompletionTime: emp.performance?.avgTaskCompletionTime || 0,
          
          // TaskPerformance fields (if needed)
          total_tasks_assigned: emp.performance?.total_tasks_assigned || 0,
          tasks_completed_ontime: emp.performance?.tasks_completed_ontime || 0,
          tasks_completed_late: emp.performance?.tasks_completed_late || 0,
          strikes: emp.performance?.strikes || 0
        }
      }));
      
      return transformedData as Employee[];
    },
  });
};


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmployeePerformance } from "@/types/employee";

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  join_date: string;
  performance?: {
    sales_target?: number;
    sales_achieved?: number;
    projects_completed?: number;
    tasks_completed?: number;
    customer_satisfaction?: number;
    avg_task_completion_time?: number;
    total_tasks_assigned?: number;
    tasks_completed_ontime?: number;
    tasks_completed_late?: number;
    strikes?: number;
    // Also include camelCase variants for frontend consistency
    salesTarget?: number;
    salesAchieved?: number;
    projectsCompleted?: number;
    tasksCompleted?: number;
    customerSatisfaction?: number;
    avgTaskCompletionTime?: number;
  };
  // Make joinDate required to match EmployeeProfile interface
  joinDate: string;
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

      // Transform the data to match the Employee interface and add joinDate
      const transformedData = data.map((emp: any) => ({
        ...emp,
        joinDate: emp.join_date // Add joinDate field to match EmployeeProfile interface
      }));
      
      return transformedData as Employee[];
    },
  });
};

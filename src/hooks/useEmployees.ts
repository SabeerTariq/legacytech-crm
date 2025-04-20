
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmployeePerformance, SalesPerformance, ProductionPerformance } from "@/types/employee";

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  join_date: string;
  joinDate: string; // Add this to match EmployeeProfile
  performance?: EmployeePerformance; // Use the union type directly
}

// Helper to determine department type
const isProductionDepartment = (department: string): boolean => {
  return ['Design', 'Development', 'Marketing', 'Content'].includes(department);
};

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
      const transformedData = data.map((emp: any) => {
        const isProduction = isProductionDepartment(emp.department);
        
        // Create a properly typed performance object based on department type
        let performance: EmployeePerformance;
        
        if (isProduction) {
          // For production departments (Design, Development, Marketing, Content)
          performance = {
            total_tasks_assigned: Number(emp.performance?.total_tasks_assigned ?? 0),
            tasks_completed_ontime: Number(emp.performance?.tasks_completed_ontime ?? 0),
            tasks_completed_late: Number(emp.performance?.tasks_completed_late ?? 0),
            strikes: Number(emp.performance?.strikes ?? 0),
            avg_completion_time: Number(emp.performance?.avg_completion_time ?? 0)
          } as ProductionPerformance;
        } else {
          // For business departments (Business Development, Project Management)
          performance = {
            salesTarget: Number(emp.performance?.salesTarget ?? 0),
            salesAchieved: Number(emp.performance?.salesAchieved ?? 0),
            projectsCompleted: Number(emp.performance?.projectsCompleted ?? 0),
            tasksCompleted: Number(emp.performance?.tasksCompleted ?? 0),
            customerSatisfaction: Number(emp.performance?.customerSatisfaction ?? 0),
            avgTaskCompletionTime: Number(emp.performance?.avgTaskCompletionTime ?? 0)
          } as SalesPerformance;
        }
        
        return {
          ...emp,
          joinDate: emp.join_date, // Ensure joinDate is present
          performance: performance
        };
      });
      
      return transformedData as Employee[];
    },
  });
};

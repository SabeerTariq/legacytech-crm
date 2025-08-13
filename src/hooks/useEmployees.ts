
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EmployeePerformance, SalesPerformance, ProductionPerformance } from "@/types/employee";

export interface Employee {
  id: string;
  full_name: string;
  email: string;
  personal_email?: string;
  department: string;
  job_title: string;
  date_of_joining: string;
  performance?: EmployeePerformance;
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
        .select(`
          *,
          employee_dependents:employee_dependents(*),
          employee_emergency_contacts:employee_emergency_contacts(*)
        `);

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
        return {
          ...emp,
          full_name: emp.full_name || '',
          job_title: emp.job_title || emp.role || "",
          dependents: emp.employee_dependents || [],
          contacts: emp.employee_emergency_contacts || [],
        };
      });
      return transformedData;
    },
  });
};

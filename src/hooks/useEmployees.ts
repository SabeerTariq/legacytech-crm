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
  performance?: EmployeePerformance;
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
      return data as unknown as Employee[];
    },
  });
};

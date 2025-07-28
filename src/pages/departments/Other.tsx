import React from "react";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeProfile, SalesPerformance } from "@/types/employee";

const Other = () => {
  const { data: employees = [], isLoading } = useEmployees("Other");

  // Transform employee data to match EmployeeProfile
  const transformedEmployees: EmployeeProfile[] = employees.map(employee => {
    return {
      ...employee,
      full_name: employee.full_name,
      performance: employee.performance as SalesPerformance
    };
  });

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">Other Department</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <DepartmentEmployees 
            departmentName="Other" 
            employees={transformedEmployees} 
          />
        )}
      </div>
  );
};

export default Other; 
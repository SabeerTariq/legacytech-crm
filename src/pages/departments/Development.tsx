
import React from "react";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeProfile, ProductionPerformance } from "@/types/employee";

const Development = () => {
  const { data: employees = [], isLoading } = useEmployees("Development");

  // Transform employee data to match EmployeeProfile
  const transformedEmployees: EmployeeProfile[] = employees.map(employee => {
    return {
      ...employee,
      full_name: employee.full_name,
      performance: employee.performance as ProductionPerformance
    };
  });

  return (
    <div className="space-y-6">
        <h1 className="text-3xl font-bold">Development Department</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <DepartmentEmployees 
            departmentName="Development" 
            employees={transformedEmployees} 
          />
        )}
      </div>
  );
};

export default Development;

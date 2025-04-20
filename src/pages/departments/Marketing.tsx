
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeProfile, ProductionPerformance } from "@/types/employee";

const Marketing = () => {
  const { data: employees = [], isLoading } = useEmployees("Marketing");

  // Transform employee data to match EmployeeProfile
  const transformedEmployees: EmployeeProfile[] = employees.map(employee => {
    return {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      department: employee.department,
      email: employee.email,
      joinDate: employee.join_date,
      performance: employee.performance as ProductionPerformance
    };
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Marketing Department</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <DepartmentEmployees 
            departmentName="Marketing" 
            employees={transformedEmployees} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Marketing;

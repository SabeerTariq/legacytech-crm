import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeProfile, SalesPerformance } from "@/types/employee";

const ProjectManagement = () => {
  const { data: employees = [], isLoading } = useEmployees("Project Management");

  const transformedEmployees: EmployeeProfile[] = employees.map(employee => ({
    id: employee.id,
    name: employee.name,
    role: employee.role,
    department: employee.department,
    email: employee.email,
    joinDate: employee.join_date,
    performance: employee.performance || {
      salesTarget: 0,
      salesAchieved: 0,
      projectsCompleted: 0,
      tasksCompleted: 0,
      customerSatisfaction: 0,
      avgTaskCompletionTime: 0
    } as SalesPerformance
  }));

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Project Management Department</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <DepartmentEmployees 
            departmentName="Project Management" 
            employees={transformedEmployees} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectManagement;

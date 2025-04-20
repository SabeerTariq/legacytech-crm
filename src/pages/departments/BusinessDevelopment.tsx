
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeProfile, SalesPerformance } from "@/types/employee";

const BusinessDevelopment = () => {
  const { data: employees = [], isLoading } = useEmployees("Business Development");

  const transformedEmployees: EmployeeProfile[] = employees.map(employee => {
    // Ensure performance data has the correct structure
    const performanceData = employee.performance || {};
    
    const defaultPerformance: SalesPerformance = {
      salesTarget: 0,
      salesAchieved: 0,
      projectsCompleted: 0,
      tasksCompleted: 0,
      customerSatisfaction: 0,
      avgTaskCompletionTime: 0
    };
    
    // Convert database field names to frontend field names if needed
    const performance: SalesPerformance = {
      salesTarget: performanceData.salesTarget || performanceData.sales_target || defaultPerformance.salesTarget,
      salesAchieved: performanceData.salesAchieved || performanceData.sales_achieved || defaultPerformance.salesAchieved,
      projectsCompleted: performanceData.projectsCompleted || performanceData.projects_completed || defaultPerformance.projectsCompleted,
      tasksCompleted: performanceData.tasksCompleted || performanceData.tasks_completed || defaultPerformance.tasksCompleted,
      customerSatisfaction: performanceData.customerSatisfaction || performanceData.customer_satisfaction || defaultPerformance.customerSatisfaction,
      avgTaskCompletionTime: performanceData.avgTaskCompletionTime || performanceData.avg_task_completion_time || defaultPerformance.avgTaskCompletionTime
    };

    return {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      department: employee.department,
      email: employee.email,
      joinDate: employee.join_date,
      performance: performance
    };
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Business Development Department</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <DepartmentEmployees 
            departmentName="Business Development" 
            employees={transformedEmployees} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default BusinessDevelopment;

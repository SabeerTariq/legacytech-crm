
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { EmployeeProfile } from "@/types/employee";

const designEmployees: EmployeeProfile[] = [
  {
    id: "1",
    name: "Sarah Wilson",
    role: "Senior UI Designer",
    department: "Design",
    email: "sarah.w@company.com",
    joinDate: "2023-01-15",
    performance: {
      salesTarget: 50000,
      salesAchieved: 45000,
      projectsCompleted: 24,
      tasksCompleted: 156,
      avgTaskCompletionTime: 2.5,
      customerSatisfaction: 4.8
    }
  },
  {
    id: "2",
    name: "Michael Chen",
    role: "UX Designer",
    department: "Design",
    email: "michael.c@company.com",
    joinDate: "2023-03-20",
    performance: {
      salesTarget: 40000,
      salesAchieved: 38000,
      projectsCompleted: 18,
      tasksCompleted: 134,
      avgTaskCompletionTime: 2.8,
      customerSatisfaction: 4.6
    }
  }
];

const Design = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Design Department</h1>
        <DepartmentEmployees 
          departmentName="Design" 
          employees={designEmployees} 
        />
      </div>
    </MainLayout>
  );
};

export default Design;

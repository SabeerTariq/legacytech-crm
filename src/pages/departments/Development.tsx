
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { EmployeeProfile } from "@/types/employee";

const developmentEmployees: EmployeeProfile[] = [
  {
    id: "3",
    name: "David Lee",
    role: "Senior Developer",
    department: "Development",
    email: "david.l@company.com",
    joinDate: "2022-11-10",
    performance: {
      salesTarget: 60000,
      salesAchieved: 58000,
      projectsCompleted: 31,
      tasksCompleted: 189,
      avgTaskCompletionTime: 2.2,
      customerSatisfaction: 4.9
    }
  },
  {
    id: "4",
    name: "Emily Johnson",
    role: "Full Stack Developer",
    department: "Development",
    email: "emily.j@company.com",
    joinDate: "2023-02-15",
    performance: {
      salesTarget: 45000,
      salesAchieved: 42000,
      projectsCompleted: 22,
      tasksCompleted: 145,
      avgTaskCompletionTime: 2.6,
      customerSatisfaction: 4.7
    }
  }
];

const Development = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Development Department</h1>
        <DepartmentEmployees 
          departmentName="Development" 
          employees={developmentEmployees} 
        />
      </div>
    </MainLayout>
  );
};

export default Development;

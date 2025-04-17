
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { EmployeeProfile } from "@/types/employee";

const contentEmployees: EmployeeProfile[] = [
  {
    id: "7",
    name: "Emma Brown",
    role: "Content Manager",
    department: "Content",
    email: "emma.b@company.com",
    joinDate: "2023-02-20",
    performance: {
      salesTarget: 55000,
      salesAchieved: 57000,
      projectsCompleted: 25,
      tasksCompleted: 158,
      avgTaskCompletionTime: 2.4,
      customerSatisfaction: 4.8
    }
  },
  {
    id: "8",
    name: "Ryan Martinez",
    role: "Content Writer",
    department: "Content",
    email: "ryan.m@company.com",
    joinDate: "2023-05-10",
    performance: {
      salesTarget: 40000,
      salesAchieved: 42000,
      projectsCompleted: 20,
      tasksCompleted: 130,
      avgTaskCompletionTime: 2.2,
      customerSatisfaction: 4.6
    }
  }
];

const Content = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Content Department</h1>
        <DepartmentEmployees 
          departmentName="Content" 
          employees={contentEmployees} 
        />
      </div>
    </MainLayout>
  );
};

export default Content;

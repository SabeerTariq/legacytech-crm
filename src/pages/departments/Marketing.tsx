
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { EmployeeProfile } from "@/types/employee";

const marketingEmployees: EmployeeProfile[] = [
  {
    id: "5",
    name: "Alex Johnson",
    role: "Marketing Director",
    department: "Marketing",
    email: "alex.j@company.com",
    joinDate: "2023-01-05",
    performance: {
      salesTarget: 75000,
      salesAchieved: 82000,
      projectsCompleted: 28,
      tasksCompleted: 165,
      avgTaskCompletionTime: 2.3,
      customerSatisfaction: 4.9
    }
  },
  {
    id: "6",
    name: "Jessica Williams",
    role: "Social Media Manager",
    department: "Marketing",
    email: "jessica.w@company.com",
    joinDate: "2023-04-15",
    performance: {
      salesTarget: 45000,
      salesAchieved: 48000,
      projectsCompleted: 22,
      tasksCompleted: 142,
      avgTaskCompletionTime: 2.1,
      customerSatisfaction: 4.7
    }
  }
];

const Marketing = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Marketing Department</h1>
        <DepartmentEmployees 
          departmentName="Marketing" 
          employees={marketingEmployees} 
        />
      </div>
    </MainLayout>
  );
};

export default Marketing;

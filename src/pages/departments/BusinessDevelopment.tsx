
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { EmployeeProfile } from "@/types/employee";

const businessDevEmployees: EmployeeProfile[] = [
  {
    id: "9",
    name: "Thomas Anderson",
    role: "Business Development Manager",
    department: "Business Development",
    email: "thomas.a@company.com",
    joinDate: "2022-12-01",
    performance: {
      salesTarget: 100000,
      salesAchieved: 115000,
      projectsCompleted: 35,
      tasksCompleted: 210,
      avgTaskCompletionTime: 2.0,
      customerSatisfaction: 4.9
    }
  },
  {
    id: "10",
    name: "Sophia Garcia",
    role: "Business Development Representative",
    department: "Business Development",
    email: "sophia.g@company.com",
    joinDate: "2023-03-15",
    performance: {
      salesTarget: 80000,
      salesAchieved: 85000,
      projectsCompleted: 28,
      tasksCompleted: 175,
      avgTaskCompletionTime: 2.3,
      customerSatisfaction: 4.7
    }
  }
];

const BusinessDevelopment = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Business Development Department</h1>
        <DepartmentEmployees 
          departmentName="Business Development" 
          employees={businessDevEmployees} 
        />
      </div>
    </MainLayout>
  );
};

export default BusinessDevelopment;

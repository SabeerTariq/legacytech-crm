
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { EmployeeProfile } from "@/types/employee";

const projectManagementEmployees: EmployeeProfile[] = [
  {
    id: "11",
    name: "Daniel Kim",
    role: "Senior Project Manager",
    department: "Project Management",
    email: "daniel.k@company.com",
    joinDate: "2022-10-15",
    performance: {
      salesTarget: 90000,
      salesAchieved: 95000,
      projectsCompleted: 42,
      tasksCompleted: 245,
      avgTaskCompletionTime: 1.8,
      customerSatisfaction: 4.9
    }
  },
  {
    id: "12",
    name: "Rachel Taylor",
    role: "Project Coordinator",
    department: "Project Management",
    email: "rachel.t@company.com",
    joinDate: "2023-01-20",
    performance: {
      salesTarget: 60000,
      salesAchieved: 63000,
      projectsCompleted: 32,
      tasksCompleted: 188,
      avgTaskCompletionTime: 2.1,
      customerSatisfaction: 4.8
    }
  }
];

const ProjectManagement = () => {
  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Project Management Department</h1>
        <DepartmentEmployees 
          departmentName="Project Management" 
          employees={projectManagementEmployees} 
        />
      </div>
    </MainLayout>
  );
};

export default ProjectManagement;

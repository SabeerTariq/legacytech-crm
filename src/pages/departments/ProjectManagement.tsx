
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { useEmployees } from "@/hooks/useEmployees";

const ProjectManagement = () => {
  const { data: employees, isLoading } = useEmployees("Project Management");

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Project Management Department</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <DepartmentEmployees 
            departmentName="Project Management" 
            employees={employees || []} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default ProjectManagement;

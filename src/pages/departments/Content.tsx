
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeProfile } from "@/types/employee";

const Content = () => {
  const { data: employees, isLoading } = useEmployees("Content");

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Content Department</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <DepartmentEmployees 
            departmentName="Content" 
            employees={employees as EmployeeProfile[]} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Content;

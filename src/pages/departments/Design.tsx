
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { useEmployees } from "@/hooks/useEmployees";

const Design = () => {
  const { data: employees, isLoading } = useEmployees("Design");

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Design Department</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <DepartmentEmployees 
            departmentName="Design" 
            employees={employees || []} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Design;

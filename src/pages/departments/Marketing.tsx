
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { useEmployees } from "@/hooks/useEmployees";

const Marketing = () => {
  const { data: employees, isLoading } = useEmployees("Marketing");

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Marketing Department</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <DepartmentEmployees 
            departmentName="Marketing" 
            employees={employees || []} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default Marketing;

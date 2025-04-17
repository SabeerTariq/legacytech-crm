
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import DepartmentEmployees from "@/components/employees/DepartmentEmployees";
import { useEmployees } from "@/hooks/useEmployees";

const BusinessDevelopment = () => {
  const { data: employees, isLoading } = useEmployees("Business Development");

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Business Development Department</h1>
        {isLoading ? (
          <div>Loading...</div>
        ) : (
          <DepartmentEmployees 
            departmentName="Business Development" 
            employees={employees || []} 
          />
        )}
      </div>
    </MainLayout>
  );
};

export default BusinessDevelopment;

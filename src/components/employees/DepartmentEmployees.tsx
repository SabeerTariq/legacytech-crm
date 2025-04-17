
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmployeeCard from "./EmployeeCard";
import { EmployeeProfile } from "@/types/employee";

interface DepartmentEmployeesProps {
  departmentName: string;
  employees: EmployeeProfile[];
}

const DepartmentEmployees = ({ departmentName, employees }: DepartmentEmployeesProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{departmentName} Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <EmployeeCard key={employee.id} employee={employee} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DepartmentEmployees;

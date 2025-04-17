
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmployeeCard from "./EmployeeCard";
import { EmployeeProfile } from "@/types/employee";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { EmployeeDialog } from "./EmployeeDialog";
import { useQueryClient } from "@tanstack/react-query";

interface DepartmentEmployeesProps {
  departmentName: string;
  employees: EmployeeProfile[];
}

const DepartmentEmployees = ({ departmentName, employees }: DepartmentEmployeesProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | undefined>();
  const queryClient = useQueryClient();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["employees"] });
  };

  const openAddDialog = () => {
    setSelectedEmployee(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (employee: EmployeeProfile) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{departmentName} Team</CardTitle>
          <Button onClick={openAddDialog} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {employees.map((employee) => (
              <EmployeeCard 
                key={employee.id} 
                employee={employee} 
                onEdit={() => openEditDialog(employee)}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={departmentName}
        employee={selectedEmployee}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default DepartmentEmployees;

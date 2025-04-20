
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEmployees } from "@/hooks/useEmployees";
import { EmployeeProfile, ProductionPerformance, SalesPerformance } from "@/types/employee";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import EmployeeCard from "@/components/employees/EmployeeCard";
import { EmployeeDialog } from "@/components/employees/EmployeeDialog";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import DepartmentStats from "./DepartmentStats";

interface TeamStats {
  totalEmployees: number;
  averageTaskCompletionRate: number;
  totalTasksAssigned: number;
  tasksCompletedOnTime: number;
}

interface DepartmentCardProps {
  department: string;
}

const DepartmentCard = ({ department }: DepartmentCardProps) => {
  const { toast } = useToast();
  const { data: employees = [], isLoading, error } = useEmployees(department);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeProfile | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  if (error) {
    console.error("Error in DepartmentCard:", error);
    toast({
      title: "Error",
      description: "Failed to load team data",
      variant: "destructive",
    });
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{department} Team</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-destructive">Failed to load team data</div>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{department} Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Determine if this is a production department
  const isProductionDepartment = ['Design', 'Development', 'Marketing', 'Content'].includes(department);
  
  const stats = employees.reduce((acc, employee) => {
    const performance = employee.performance;
    
    if (isProductionDepartment && performance) {
      const prodPerformance = performance as ProductionPerformance;
      const total = Number(prodPerformance.total_tasks_assigned || 0);
      const completed = Number(prodPerformance.tasks_completed_ontime || 0);
      const completionRate = total > 0 ? (completed / total * 100) : 0;
      
      return {
        totalEmployees: acc.totalEmployees + 1,
        averageTaskCompletionRate: acc.averageTaskCompletionRate + completionRate,
        totalTasksAssigned: acc.totalTasksAssigned + Number(prodPerformance.total_tasks_assigned || 0),
        tasksCompletedOnTime: acc.tasksCompletedOnTime + Number(prodPerformance.tasks_completed_ontime || 0),
      };
    } else {
      // For non-production departments, we still count employees but don't accumulate task metrics
      return {
        ...acc,
        totalEmployees: acc.totalEmployees + 1,
      };
    }
  }, {
    totalEmployees: 0,
    averageTaskCompletionRate: 0,
    totalTasksAssigned: 0,
    tasksCompletedOnTime: 0,
  });

  stats.averageTaskCompletionRate = stats.totalEmployees > 0 
    ? stats.averageTaskCompletionRate / stats.totalEmployees 
    : 0;

  const handleEdit = (employee: EmployeeProfile) => {
    setSelectedEmployee(employee);
    setDialogOpen(true);
  };

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["employees"] });
    setDialogOpen(false);
  };

  // Transform employee data to match EmployeeProfile for proper typing
  const transformedEmployees: EmployeeProfile[] = employees.map(employee => {
    return {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      department: employee.department,
      email: employee.email,
      avatar: employee.avatar,
      joinDate: employee.joinDate || employee.join_date,
      performance: employee.performance || (
        isProductionDepartment ? 
          { total_tasks_assigned: 0, tasks_completed_ontime: 0, tasks_completed_late: 0, strikes: 0, avg_completion_time: 0 } as ProductionPerformance :
          { salesTarget: 0, salesAchieved: 0, projectsCompleted: 0, tasksCompleted: 0, avgTaskCompletionTime: 0, customerSatisfaction: 0 } as SalesPerformance
      )
    };
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{department} Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <DepartmentStats stats={stats} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {transformedEmployees.map((employee) => (
          <EmployeeCard 
            key={employee.id} 
            employee={employee} 
            onEdit={() => handleEdit(employee)} 
          />
        ))}
      </div>

      <EmployeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={department}
        employee={selectedEmployee}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default DepartmentCard;

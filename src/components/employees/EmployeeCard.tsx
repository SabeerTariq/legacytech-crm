import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { BarChart, Mail, Target, MoreVertical, Edit2, Trash2 } from "lucide-react";
import { EmployeeProfile, SalesPerformance, ProductionPerformance } from "@/types/employee";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import EmployeeHistory from "./EmployeeHistory";

interface EmployeeCardProps {
  employee: EmployeeProfile;
  onEdit: () => void;
}

const EmployeeCard = ({ employee, onEdit }: EmployeeCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initials = employee.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const isProductionDepartment = ['Design', 'Development', 'Marketing', 'Content'].includes(employee.department);

  const getPerformanceColor = (value: number) => {
    return value >= 70 ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700";
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from("employees")
        .delete()
        .eq("id", employee.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });

      queryClient.invalidateQueries({ queryKey: ["employees"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={employee.avatar} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <CardTitle>{employee.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{employee.role}</p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4" />
              {employee.email}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <EmployeeHistory 
            employeeId={employee.id} 
            name={employee.name} 
            department={employee.department}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isProductionDepartment ? (
          <ProductionPerformanceView performance={employee.performance as ProductionPerformance} />
        ) : (
          <SalesPerformanceView performance={employee.performance as SalesPerformance} />
        )}
      </CardContent>
    </Card>
  );
};

const ProductionPerformanceView = ({ performance }: { performance: ProductionPerformance }) => {
  const completionRate = (performance.tasks_completed_ontime / performance.total_tasks_assigned) * 100;
  
  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Tasks Assigned</span>
          <p className="text-2xl font-bold">{performance.total_tasks_assigned}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Completed On Time</span>
          <p className="text-2xl font-bold">{performance.tasks_completed_ontime}</p>
        </div>
      </div>
      <div className={cn(
        "space-y-2 rounded-lg p-3",
        completionRate >= 80 ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700"
      )}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Task Completion Rate</span>
          <Badge variant={completionRate >= 80 ? "default" : "destructive"}>
            {completionRate.toFixed(1)}%
          </Badge>
        </div>
        {performance.strikes > 0 && (
          <div className="mt-2 text-red-500 font-medium">
            ⚠️ Strikes: {performance.strikes}
          </div>
        )}
      </div>
    </>
  );
};

const SalesPerformanceView = ({ performance }: { performance: SalesPerformance }) => {
  const progressValue = (performance.salesAchieved / performance.salesTarget) * 100;

  const getPerformanceColor = (value: number) => {
    return value >= 70 ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700";
  };

  return (
    <>
      <div className={cn("space-y-2 rounded-lg p-3", getPerformanceColor(progressValue))}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="text-sm font-medium">Sales Target</span>
          </div>
          <span className="text-sm font-medium">${performance.salesTarget.toLocaleString()}</span>
        </div>
        <Progress
          value={progressValue}
          className="h-2"
        />
        <div className="flex justify-between text-xs">
          <span>Progress: ${performance.salesAchieved.toLocaleString()}</span>
          <Badge variant={progressValue >= 70 ? "default" : "destructive"}>
            {progressValue.toFixed(1)}%
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Projects</span>
          </div>
          <p className="text-2xl font-bold">{performance.projectsCompleted}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm">Tasks Completed</span>
          <p className="text-2xl font-bold">{performance.tasksCompleted}</p>
        </div>
      </div>
    </>
  );
};

export default EmployeeCard;

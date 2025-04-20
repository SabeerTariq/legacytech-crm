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

const ProductionPerformanceView = ({ performance }: { performance: ProductionPerformance }) => {
  const completionRate = performance.total_tasks_assigned > 0
    ? (performance.tasks_completed_ontime / performance.total_tasks_assigned) * 100
    : 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="text-sm">Task Completion Rate</span>
          </div>
          <Badge variant={completionRate >= 70 ? "default" : "destructive"}>
            {completionRate.toFixed(1)}%
          </Badge>
        </div>
        <Progress value={completionRate} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Total Tasks</span>
          </div>
          <p className="text-2xl font-bold">{performance.total_tasks_assigned}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm">Completed On Time</span>
          <p className="text-2xl font-bold">{performance.tasks_completed_ontime}</p>
        </div>
      </div>
    </div>
  );
};

const SalesPerformanceView = ({ performance }: { performance: SalesPerformance }) => {
  const achievementRate = performance.salesTarget > 0
    ? (performance.salesAchieved / performance.salesTarget) * 100
    : 0;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="text-sm">Sales Achievement</span>
          </div>
          <Badge variant={achievementRate >= 70 ? "default" : "destructive"}>
            {achievementRate.toFixed(1)}%
          </Badge>
        </div>
        <Progress value={achievementRate} className="h-2" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">Sales Target</span>
          </div>
          <p className="text-2xl font-bold">${performance.salesTarget.toLocaleString()}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm">Sales Achieved</span>
          <p className="text-2xl font-bold">${performance.salesAchieved.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

const EmployeeCard = ({ employee, onEdit }: EmployeeCardProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const initials = employee.name.split(' ').map(n => n[0]).join('').toUpperCase();
  const isProductionDepartment = ['Design', 'Development', 'Marketing', 'Content'].includes(employee.department);

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
      <CardHeader className="flex flex-row items-start justify-between gap-4 p-4">
        <div className="flex flex-col w-full">
          <CardTitle className="text-base sm:text-lg truncate">{employee.name}</CardTitle>
          <p className="text-sm text-muted-foreground truncate">{employee.role}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground truncate">
            <Mail className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">{employee.email}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <EmployeeHistory 
            employeeId={employee.id} 
            name={employee.name} 
            department={employee.department}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
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

export default EmployeeCard;

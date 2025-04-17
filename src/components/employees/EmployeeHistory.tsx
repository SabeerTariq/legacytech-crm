import React from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { History } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useEmployeeHistory } from "@/hooks/useEmployeeHistory";
import { Badge } from "@/components/ui/badge";
import { ProductionPerformance, SalesPerformance } from '@/types/employee';
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

interface EmployeeHistoryProps {
  employeeId: string;
  name: string;
  department: string;
}

const ProductionMetrics = ({ performance }: { performance: ProductionPerformance }) => {
  const completionRate = (performance.tasks_completed_ontime / performance.total_tasks_assigned) * 100;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Total Tasks</span>
          <p className="text-2xl font-bold">{performance.total_tasks_assigned}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Completed On Time</span>
          <p className="text-2xl font-bold">{performance.tasks_completed_ontime}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Completed Late</span>
          <p className="text-2xl font-bold">{performance.tasks_completed_late}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Strikes</span>
          <p className="text-2xl font-bold text-red-500">{performance.strikes}</p>
        </div>
      </div>
      <div className="rounded-lg bg-gray-100 p-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Task Completion Rate</span>
          <Badge variant={completionRate >= 80 ? "default" : "destructive"}>
            {completionRate.toFixed(1)}%
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Average completion time: {performance.avg_completion_time} days
        </p>
      </div>
    </div>
  );
};

const SalesMetrics = ({ performance }: { performance: SalesPerformance }) => {
  const progressValue = (performance.salesAchieved / performance.salesTarget) * 100;
  
  const getPerformanceColor = (value: number) => {
    return value >= 70 ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700";
  };

  return (
    <div className="space-y-6">
      <div className={cn("space-y-2 rounded-lg p-3 mb-4", getPerformanceColor(progressValue))}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Sales Progress</span>
          <span className="text-sm font-medium">
            ${performance.salesAchieved.toLocaleString()} / ${performance.salesTarget.toLocaleString()}
          </span>
        </div>
        <Progress value={progressValue} className="h-2" />
        <div className="flex justify-between text-xs">
          <span>Target: ${performance.salesTarget.toLocaleString()}</span>
          <Badge variant={progressValue >= 70 ? "default" : "destructive"}>
            {progressValue.toFixed(1)}%
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Projects Completed</span>
          <p className="text-2xl font-bold">{performance.projectsCompleted}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Tasks Completed</span>
          <p className="text-2xl font-bold">{performance.tasksCompleted}</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
          <p className="text-2xl font-bold">{performance.customerSatisfaction}%</p>
        </div>
        <div className="space-y-1">
          <span className="text-sm text-muted-foreground">Avg Task Time (days)</span>
          <p className="text-2xl font-bold">{performance.avgTaskCompletionTime}</p>
        </div>
      </div>
    </div>
  );
};

const EmployeeHistory = ({ employeeId, name, department }: EmployeeHistoryProps) => {
  const { data: history = [], isLoading } = useEmployeeHistory(employeeId, department);
  const isProductionDepartment = ['Design', 'Development', 'Marketing', 'Content'].includes(department);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <History className="h-4 w-4 mr-2" />
          View History
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Performance History - {name}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div>Loading history...</div>
        ) : (
          <div className="space-y-6">
            {history.map((record) => (
              <Card key={record.id} className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                  {format(new Date(record.month), 'MMMM yyyy')}
                </h3>
                {isProductionDepartment ? (
                  <ProductionMetrics performance={record.performance as ProductionPerformance} />
                ) : (
                  <SalesMetrics performance={record.performance as SalesPerformance} />
                )}
              </Card>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeHistory;

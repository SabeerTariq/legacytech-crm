
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
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { useEmployeeHistory } from "@/hooks/useEmployeeHistory";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface EmployeeHistoryProps {
  employeeId: string;
  name: string;
}

const EmployeeHistory = ({ employeeId, name }: EmployeeHistoryProps) => {
  const { data: history = [], isLoading } = useEmployeeHistory(employeeId);

  const getPerformanceColor = (value: number) => {
    return value >= 70 ? "bg-green-500/10 text-green-700" : "bg-red-500/10 text-red-700";
  };

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
            {history.map((record) => {
              const progressValue = (record.performance.salesAchieved / record.performance.salesTarget) * 100;
              
              return (
                <Card key={record.id} className="p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    {format(new Date(record.month), 'MMMM yyyy')}
                  </h3>
                  
                  <div className={cn("space-y-2 rounded-lg p-3 mb-4", getPerformanceColor(progressValue))}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Sales Progress</span>
                      <span className="text-sm font-medium">
                        ${record.performance.salesAchieved.toLocaleString()} / ${record.performance.salesTarget.toLocaleString()}
                      </span>
                    </div>
                    <Progress value={progressValue} className="h-2" />
                    <div className="flex justify-between text-xs">
                      <span>Target: ${record.performance.salesTarget.toLocaleString()}</span>
                      <Badge variant={progressValue >= 70 ? "default" : "destructive"}>
                        {progressValue.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Projects Completed</span>
                      <p className="text-2xl font-bold">{record.performance.projectsCompleted}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Tasks Completed</span>
                      <p className="text-2xl font-bold">{record.performance.tasksCompleted}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Customer Satisfaction</span>
                      <p className="text-2xl font-bold">{record.performance.customerSatisfaction}%</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Avg Task Time (days)</span>
                      <p className="text-2xl font-bold">{record.performance.avgTaskCompletionTime}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default EmployeeHistory;

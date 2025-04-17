
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { BarChart, Mail, Target } from "lucide-react";
import { EmployeeProfile } from "@/types/employee";

const EmployeeCard = ({ employee }: { employee: EmployeeProfile }) => {
  const progressValue = (employee.performance.salesAchieved / employee.performance.salesTarget) * 100;
  const initials = employee.name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center gap-4">
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
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Sales Target</span>
            </div>
            <span className="text-sm font-medium">${employee.performance.salesTarget.toLocaleString()}</span>
          </div>
          <Progress value={progressValue} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress: ${employee.performance.salesAchieved.toLocaleString()}</span>
            <span>{progressValue.toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BarChart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Projects</span>
            </div>
            <p className="text-2xl font-bold">{employee.performance.projectsCompleted}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm">Tasks Completed</span>
            <p className="text-2xl font-bold">{employee.performance.tasksCompleted}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmployeeCard;

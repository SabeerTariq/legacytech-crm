
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, BarChart } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import EmployeeCard from "@/components/employees/EmployeeCard";
import { cn } from "@/lib/utils";
import { EmployeeProfile, ProductionPerformance } from "@/types/employee";

interface TeamStats {
  totalEmployees: number;
  averageTaskCompletionRate: number;
  totalTasksAssigned: number;
  tasksCompletedOnTime: number;
}

const TeamPerformanceCard = ({ department }: { department: string }) => {
  const { data: employees = [] } = useEmployees(department);

  const stats: TeamStats = employees.reduce((acc, employee) => {
    const performance = employee.performance as ProductionPerformance;
    
    // Check if total_tasks_assigned is 0, if so, default completion rate to 0
    const completionRate = performance.total_tasks_assigned > 0 
      ? (performance.tasks_completed_ontime / performance.total_tasks_assigned * 100)
      : 0;
    
    return {
      totalEmployees: acc.totalEmployees + 1,
      averageTaskCompletionRate: acc.averageTaskCompletionRate + completionRate,
      totalTasksAssigned: acc.totalTasksAssigned + (performance.total_tasks_assigned || 0),
      tasksCompletedOnTime: acc.tasksCompletedOnTime + (performance.tasks_completed_ontime || 0),
    };
  }, {
    totalEmployees: 0,
    averageTaskCompletionRate: 0,
    totalTasksAssigned: 0,
    tasksCompletedOnTime: 0,
  });

  // Add a safe check to avoid division by zero
  const avgCompletionRate = stats.totalEmployees > 0 
    ? stats.averageTaskCompletionRate / stats.totalEmployees 
    : 0;

  // Ensure we're working with a valid number
  const safeAvgCompletionRate = isNaN(avgCompletionRate) ? 0 : avgCompletionRate;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{department} Team</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Team Size</span>
            </div>
            <span className="text-2xl font-bold">{stats.totalEmployees}</span>
          </div>

          <div className={cn(
            "space-y-2 rounded-lg p-3",
            safeAvgCompletionRate >= 70 ? "bg-green-500/10" : "bg-red-500/10"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="text-sm">Task Completion Rate</span>
              </div>
            </div>
            <Progress 
              value={safeAvgCompletionRate} 
              className={cn(
                safeAvgCompletionRate >= 70 ? "text-green-500" : "text-red-500"
              )}
            />
            <div className="flex justify-between text-xs">
              <span>Team Average</span>
              <Badge variant={safeAvgCompletionRate >= 70 ? "default" : "destructive"}>
                {safeAvgCompletionRate.toFixed(1)}%
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total Tasks</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalTasksAssigned}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm">Tasks Completed On Time</span>
              <p className="text-2xl font-bold">{stats.tasksCompletedOnTime}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((employee) => (
          <EmployeeCard 
            key={employee.id} 
            employee={employee} 
            onEdit={() => {}} 
          />
        ))}
      </div>
    </div>
  );
};

const TeamPerformance = () => {
  return (
    <div className="grid gap-6">
      <TeamPerformanceCard department="Design" />
      <TeamPerformanceCard department="Development" />
      <TeamPerformanceCard department="Marketing" />
      <TeamPerformanceCard department="Content" />
    </div>
  );
};

export default TeamPerformance;

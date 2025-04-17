
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, BarChart } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import EmployeeCard from "@/components/employees/EmployeeCard";
import { cn } from "@/lib/utils";

interface TeamStats {
  totalEmployees: number;
  averageSalesProgress: number;
  totalProjectsCompleted: number;
  totalTasksCompleted: number;
}

const TeamPerformanceCard = ({ department }: { department: string }) => {
  const { data: employees = [] } = useEmployees(department);

  const stats: TeamStats = employees.reduce((acc, employee) => {
    const salesProgress = (employee.performance.salesAchieved / employee.performance.salesTarget) * 100;
    return {
      totalEmployees: acc.totalEmployees + 1,
      averageSalesProgress: acc.averageSalesProgress + salesProgress,
      totalProjectsCompleted: acc.totalProjectsCompleted + employee.performance.projectsCompleted,
      totalTasksCompleted: acc.totalTasksCompleted + employee.performance.tasksCompleted,
    };
  }, {
    totalEmployees: 0,
    averageSalesProgress: 0,
    totalProjectsCompleted: 0,
    totalTasksCompleted: 0,
  });

  const avgSalesProgress = stats.totalEmployees > 0 
    ? stats.averageSalesProgress / stats.totalEmployees 
    : 0;

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
            avgSalesProgress >= 70 ? "bg-green-500/10" : "bg-red-500/10"
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="text-sm">Average Sales Progress</span>
              </div>
            </div>
            <Progress 
              value={avgSalesProgress} 
              className={cn(
                "h-2",
                avgSalesProgress >= 70 ? "bg-green-500" : "bg-red-500"
              )}
            />
            <div className="flex justify-between text-xs">
              <span>Team Average</span>
              <Badge variant={avgSalesProgress >= 70 ? "default" : "destructive"}>
                {avgSalesProgress.toFixed(1)}%
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Projects</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalProjectsCompleted}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm">Tasks</span>
              <p className="text-2xl font-bold">{stats.totalTasksCompleted}</p>
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
      <TeamPerformanceCard department="Business Development" />
      <TeamPerformanceCard department="Project Management" />
    </div>
  );
};

export default TeamPerformance;

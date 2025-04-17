
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Target, BarChart } from "lucide-react";
import { useEmployees } from "@/hooks/useEmployees";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import EmployeeCard from "@/components/employees/EmployeeCard";
import { cn } from "@/lib/utils";

interface TeamStats {
  totalEmployees: number;
  averageTaskCompletion: number;
  totalSales: number;
  projectsCompleted: number;
}

const TeamPerformanceCard = ({ department }: { department: string }) => {
  const { data: employees = [] } = useEmployees(department);

  const stats: TeamStats = employees.reduce((acc, employee) => {
    const performance = employee.performance;
    
    return {
      totalEmployees: acc.totalEmployees + 1,
      averageTaskCompletion: acc.averageTaskCompletion + (performance.tasksCompleted || 0),
      totalSales: acc.totalSales + (performance.salesAchieved || 0),
      projectsCompleted: acc.projectsCompleted + (performance.projectsCompleted || 0),
    };
  }, {
    totalEmployees: 0,
    averageTaskCompletion: 0,
    totalSales: 0,
    projectsCompleted: 0,
  });

  const avgTaskCompletion = stats.totalEmployees > 0 
    ? (stats.averageTaskCompletion / stats.totalEmployees) 
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{department}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Team Size</span>
            </div>
            <span className="text-2xl font-bold">{stats.totalEmployees}</span>
          </div>

          <div className="space-y-2 rounded-lg p-3 bg-green-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                <span className="text-sm">Task Completion</span>
              </div>
            </div>
            <Progress value={avgTaskCompletion} />
            <div className="flex justify-between text-xs">
              <span>Average Tasks Completed</span>
              <Badge variant="default">
                {avgTaskCompletion.toFixed(1)}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <BarChart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total Sales</span>
              </div>
              <p className="text-2xl font-bold">${stats.totalSales.toLocaleString()}</p>
            </div>
            <div className="space-y-1">
              <span className="text-sm">Projects Completed</span>
              <p className="text-2xl font-bold">{stats.projectsCompleted}</p>
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

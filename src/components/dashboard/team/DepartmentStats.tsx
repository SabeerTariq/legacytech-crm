
import { Users, Target, BarChart } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface TeamStats {
  totalEmployees: number;
  averageTaskCompletionRate: number;
  totalTasksAssigned: number;
  tasksCompletedOnTime: number;
}

interface DepartmentStatsProps {
  stats: TeamStats;
}

const DepartmentStats = ({ stats }: DepartmentStatsProps) => {
  const safeAvgCompletionRate = isNaN(stats.averageTaskCompletionRate) ? 0 : stats.averageTaskCompletionRate;

  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default DepartmentStats;

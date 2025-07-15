import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  CheckCircle, 
  Target, 
  Users, 
  BarChart3,
  Calendar,
  Award,
  AlertCircle,
  Plus,
  RefreshCw,
  Info,
  Clock,
  AlertTriangle,
  Zap,
  Palette,
  Code,
  Megaphone,
  PenTool,
  Globe
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface Task {
  id: string;
  title: string;
  status: string;
  assigned_to_id: string;
  created_at: string;
  due_date: string;
  priority: string;
  project: {
    id: string;
    name: string;
  } | null;
}

interface EmployeePerformance {
  id: string;
  name: string;
  email: string;
  department: string;
  performance: {
    total_tasks_assigned: number;
    tasks_completed_ontime: number;
    tasks_completed_late: number;
    strikes: number;
    avg_completion_time: number;
  };
}

interface TeamPerformanceData {
  totalTasks: number;
  completedTasks: number;
  onTimeCompletion: number;
  lateCompletions: number;
  averageCompletionTime: number;
  topPerformers: Array<{
    name: string;
    tasks: number;
    completed: number;
    onTime: number;
    completionRate: number;
    avgTime: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    tasks: number;
    completed: number;
  }>;
  taskStatusBreakdown: {
    completed: number;
    inProgress: number;
    pending: number;
    overdue: number;
  };
}

// Mock task data for demonstration
const mockTasks: Task[] = [
  {
    id: "1",
    title: "Website Homepage Design",
    status: "completed",
    assigned_to_id: "design-1",
    created_at: "2024-01-15T10:00:00Z",
    due_date: "2024-01-20T17:00:00Z",
    priority: "high",
    project: { id: "1", name: "E-commerce Website" }
  },
  {
    id: "2",
    title: "Frontend Development - React Components",
    status: "completed",
    assigned_to_id: "dev-1",
    created_at: "2024-01-16T09:00:00Z",
    due_date: "2024-01-25T17:00:00Z",
    priority: "high",
    project: { id: "1", name: "E-commerce Website" }
  },
  {
    id: "3",
    title: "Social Media Campaign Design",
    status: "in-progress",
    assigned_to_id: "marketing-1",
    created_at: "2024-01-17T11:00:00Z",
    due_date: "2024-01-30T17:00:00Z",
    priority: "medium",
    project: { id: "2", name: "Marketing Campaign" }
  },
  {
    id: "4",
    title: "Blog Content Writing",
    status: "completed",
    assigned_to_id: "content-1",
    created_at: "2024-01-18T14:00:00Z",
    due_date: "2024-01-22T17:00:00Z",
    priority: "medium",
    project: { id: "3", name: "Content Marketing" }
  },
  {
    id: "5",
    title: "Logo Design",
    status: "completed",
    assigned_to_id: "outsourced-1",
    created_at: "2024-01-19T08:00:00Z",
    due_date: "2024-01-26T17:00:00Z",
    priority: "high",
    project: { id: "4", name: "Brand Identity" }
  },
  {
    id: "6",
    title: "Backend API Development",
    status: "completed",
    assigned_to_id: "dev-2",
    created_at: "2024-01-20T10:00:00Z",
    due_date: "2024-01-28T17:00:00Z",
    priority: "high",
    project: { id: "1", name: "E-commerce Website" }
  },
  {
    id: "7",
    title: "Email Newsletter Design",
    status: "pending",
    assigned_to_id: "design-2",
    created_at: "2024-01-21T13:00:00Z",
    due_date: "2024-02-05T17:00:00Z",
    priority: "low",
    project: { id: "2", name: "Marketing Campaign" }
  },
  {
    id: "8",
    title: "SEO Content Optimization",
    status: "completed",
    assigned_to_id: "content-2",
    created_at: "2024-01-22T15:00:00Z",
    due_date: "2024-01-29T17:00:00Z",
    priority: "medium",
    project: { id: "3", name: "Content Marketing" }
  }
];

// Mock employee data for demonstration
const mockEmployees: EmployeePerformance[] = [
  {
    id: "design-1",
    name: "Alex Johnson",
    email: "alex@company.com",
    department: "Design",
    performance: {
      total_tasks_assigned: 15,
      tasks_completed_ontime: 12,
      tasks_completed_late: 2,
      strikes: 1,
      avg_completion_time: 3.2
    }
  },
  {
    id: "design-2",
    name: "Sarah Chen",
    email: "sarah@company.com",
    department: "Design",
    performance: {
      total_tasks_assigned: 12,
      tasks_completed_ontime: 10,
      tasks_completed_late: 1,
      strikes: 0,
      avg_completion_time: 2.8
    }
  },
  {
    id: "dev-1",
    name: "Mike Rodriguez",
    email: "mike@company.com",
    department: "Development",
    performance: {
      total_tasks_assigned: 20,
      tasks_completed_ontime: 18,
      tasks_completed_late: 1,
      strikes: 0,
      avg_completion_time: 4.1
    }
  },
  {
    id: "dev-2",
    name: "Emily Davis",
    email: "emily@company.com",
    department: "Development",
    performance: {
      total_tasks_assigned: 18,
      tasks_completed_ontime: 16,
      tasks_completed_late: 2,
      strikes: 1,
      avg_completion_time: 3.9
    }
  },
  {
    id: "marketing-1",
    name: "David Kim",
    email: "david@company.com",
    department: "Marketing",
    performance: {
      total_tasks_assigned: 14,
      tasks_completed_ontime: 11,
      tasks_completed_late: 2,
      strikes: 1,
      avg_completion_time: 2.5
    }
  },
  {
    id: "content-1",
    name: "Lisa Wang",
    email: "lisa@company.com",
    department: "Content",
    performance: {
      total_tasks_assigned: 16,
      tasks_completed_ontime: 14,
      tasks_completed_late: 1,
      strikes: 0,
      avg_completion_time: 2.2
    }
  },
  {
    id: "content-2",
    name: "Tom Wilson",
    email: "tom@company.com",
    department: "Content",
    performance: {
      total_tasks_assigned: 13,
      tasks_completed_ontime: 12,
      tasks_completed_late: 0,
      strikes: 0,
      avg_completion_time: 2.0
    }
  },
  {
    id: "outsourced-1",
    name: "Freelance Designer",
    email: "freelance@external.com",
    department: "Outsourced",
    performance: {
      total_tasks_assigned: 8,
      tasks_completed_ontime: 7,
      tasks_completed_late: 1,
      strikes: 0,
      avg_completion_time: 4.5
    }
  }
];

const ProductionTeamPerformance: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [useMockData, setUseMockData] = React.useState(true);
  const [selectedDepartment, setSelectedDepartment] = React.useState("all");

  // Fetch tasks data
  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['production-tasks'],
    queryFn: async () => {
      if (useMockData) {
        return mockTasks;
      }

      const { data, error } = await supabase
        .from('project_tasks')
        .select(`
          *,
          project:projects(name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast({
          title: "Error fetching tasks",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as Task[];
    },
    enabled: !!user,
  });

  // Fetch employees data
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['production-employees'],
    queryFn: async () => {
      if (useMockData) {
        return mockEmployees;
      }

      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .in('department', ['Design', 'Development', 'Marketing', 'Content']);
      
      if (error) {
        toast({
          title: "Error fetching employees",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      // Transform the data to match EmployeePerformance interface
      return (data || []).map((emp: any) => ({
        id: emp.id,
        name: emp.name,
        email: emp.email,
        department: emp.department,
        performance: {
          total_tasks_assigned: Number(emp.performance?.total_tasks_assigned || 0),
          tasks_completed_ontime: Number(emp.performance?.tasks_completed_ontime || 0),
          tasks_completed_late: Number(emp.performance?.tasks_completed_late || 0),
          strikes: Number(emp.performance?.strikes || 0),
          avg_completion_time: Number(emp.performance?.avg_completion_time || 0),
        }
      })) as EmployeePerformance[];
    },
    enabled: !!user,
  });

  // Mutation to generate sample tasks
  const generateSampleTasks = useMutation({
    mutationFn: async () => {
      const sampleTasks = [
        {
          title: "Sample Design Task",
          description: "Create a new design mockup",
          status: "in-progress",
          priority: "medium",
          due_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          project_id: "1",
          assigned_to_id: employees[0]?.id,
          created_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          user_id: user?.id
        },
        {
          title: "Sample Development Task",
          description: "Implement new feature",
          status: "pending",
          priority: "high",
          due_date: format(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
          project_id: "1",
          assigned_to_id: employees[2]?.id,
          created_at: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          user_id: user?.id
        }
      ];

      const { error } = await supabase
        .from('project_tasks')
        .insert(sampleTasks);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sample tasks created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['production-tasks'] });
      setUseMockData(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create sample tasks. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Filter employees by department
  const filteredEmployees = React.useMemo(() => {
    if (selectedDepartment === "all") return employees;
    return employees.filter(emp => emp.department === selectedDepartment);
  }, [employees, selectedDepartment]);

  // Calculate team performance metrics
  const teamPerformance = React.useMemo((): TeamPerformanceData => {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    const onTimeCompletion = filteredEmployees.reduce((sum, emp) => sum + emp.performance.tasks_completed_ontime, 0);
    const lateCompletions = filteredEmployees.reduce((sum, emp) => sum + emp.performance.tasks_completed_late, 0);
    const averageCompletionTime = filteredEmployees.length > 0 
      ? filteredEmployees.reduce((sum, emp) => sum + emp.performance.avg_completion_time, 0) / filteredEmployees.length 
      : 0;

    // Calculate individual performance
    const individualPerformance = filteredEmployees.map(emp => {
      const employeeTasks = tasks.filter(task => task.assigned_to_id === emp.id);
      const completed = employeeTasks.filter(task => task.status === 'completed').length;
      const completionRate = employeeTasks.length > 0 ? (completed / employeeTasks.length) * 100 : 0;

      return {
        name: emp.name,
        tasks: employeeTasks.length,
        completed: completed,
        onTime: emp.performance.tasks_completed_ontime,
        completionRate: completionRate,
        avgTime: emp.performance.avg_completion_time
      };
    });

    // Sort by completion rate to get top performers
    const topPerformers = individualPerformance
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 3);

    // Calculate monthly trend for last 6 months
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTasks = tasks.filter(task => {
        const taskDate = new Date(task.created_at);
        return taskDate >= monthStart && taskDate <= monthEnd;
      });

      const monthCompleted = monthTasks.filter(task => task.status === 'completed').length;

      return {
        month: format(date, 'MMM yyyy'),
        tasks: monthTasks.length,
        completed: monthCompleted
      };
    }).reverse();

    // Task status breakdown
    const taskStatusBreakdown = {
      completed: tasks.filter(task => task.status === 'completed').length,
      inProgress: tasks.filter(task => task.status === 'in-progress').length,
      pending: tasks.filter(task => task.status === 'pending').length,
      overdue: tasks.filter(task => {
        const dueDate = new Date(task.due_date);
        return dueDate < new Date() && task.status !== 'completed';
      }).length
    };

    return {
      totalTasks,
      completedTasks,
      onTimeCompletion,
      lateCompletions,
      averageCompletionTime,
      topPerformers,
      monthlyTrend,
      taskStatusBreakdown
    };
  }, [tasks, filteredEmployees]);

  const completionRate = teamPerformance.totalTasks > 0 
    ? (teamPerformance.completedTasks / teamPerformance.totalTasks) * 100 
    : 0;

  const onTimeRate = (teamPerformance.onTimeCompletion + teamPerformance.lateCompletions) > 0
    ? (teamPerformance.onTimeCompletion / (teamPerformance.onTimeCompletion + teamPerformance.lateCompletions)) * 100
    : 0;

  const handleToggleData = () => {
    setUseMockData(!useMockData);
    queryClient.invalidateQueries({ queryKey: ['production-tasks', 'production-employees'] });
  };

  const getDepartmentIcon = (department: string) => {
    switch (department) {
      case 'Design': return <Palette className="h-4 w-4" />;
      case 'Development': return <Code className="h-4 w-4" />;
      case 'Marketing': return <Megaphone className="h-4 w-4" />;
      case 'Content': return <PenTool className="h-4 w-4" />;
      case 'Outsourced': return <Globe className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const departments = [
    { value: "all", label: "All Teams", icon: <Users className="h-4 w-4" /> },
    { value: "Design", label: "Design", icon: <Palette className="h-4 w-4" /> },
    { value: "Development", label: "Development", icon: <Code className="h-4 w-4" /> },
    { value: "Marketing", label: "Marketing", icon: <Megaphone className="h-4 w-4" /> },
    { value: "Content", label: "Content", icon: <PenTool className="h-4 w-4" /> },
    { value: "Outsourced", label: "Outsourced", icon: <Globe className="h-4 w-4" /> }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Production Teams Performance
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleData}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {useMockData ? "Switch to Real Data" : "Use Mock Data"}
            </Button>
            {!useMockData && (
              <Button
                size="sm"
                onClick={() => generateSampleTasks.mutate()}
                disabled={generateSampleTasks.isPending}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {generateSampleTasks.isPending ? "Creating..." : "Add Sample Tasks"}
              </Button>
            )}
          </div>
        </div>
        {useMockData && (
          <p className="text-sm text-muted-foreground">
            Currently showing mock data for demonstration. Switch to real data to see actual performance.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Department Filter */}
        <Tabs value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <TabsList className="grid w-full grid-cols-6">
            {departments.map((dept) => (
              <TabsTrigger key={dept.value} value={dept.value} className="flex items-center gap-2">
                {dept.icon}
                <span className="hidden sm:inline">{dept.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Overall Team Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Tasks</span>
            </div>
            <p className="text-2xl font-bold">{teamPerformance.totalTasks}</p>
            <p className="text-xs text-muted-foreground">
              {teamPerformance.completedTasks} completed
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Completion Rate</span>
            </div>
            <p className="text-2xl font-bold">{completionRate.toFixed(1)}%</p>
            <Progress value={completionRate} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">On-Time Rate</span>
            </div>
            <p className="text-2xl font-bold">{onTimeRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              {teamPerformance.lateCompletions} late
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Avg Completion</span>
            </div>
            <p className="text-2xl font-bold">{teamPerformance.averageCompletionTime.toFixed(1)}d</p>
            <p className="text-xs text-muted-foreground">
              Days per task
            </p>
          </div>
        </div>

        {/* Task Status Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Task Status Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{teamPerformance.taskStatusBreakdown.completed}</p>
              <p className="text-sm text-green-700">Completed</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{teamPerformance.taskStatusBreakdown.inProgress}</p>
              <p className="text-sm text-blue-700">In Progress</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-600">{teamPerformance.taskStatusBreakdown.pending}</p>
              <p className="text-sm text-gray-700">Pending</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{teamPerformance.taskStatusBreakdown.overdue}</p>
              <p className="text-sm text-red-700">Overdue</p>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Performers
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {teamPerformance.topPerformers.map((performer, index) => (
              <Card key={performer.name} className="relative">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {performer.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium">{performer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        #{index + 1} Performer
                      </p>
                    </div>
                    <Badge variant={performer.completionRate >= 80 ? "default" : "secondary"}>
                      {performer.completionRate.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Tasks:</span>
                      <span className="font-medium">{performer.tasks}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Completed:</span>
                      <span className="font-medium">{performer.completed}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>On Time:</span>
                      <span className="font-medium">{performer.onTime}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Avg Time:</span>
                      <span className="font-medium">{performer.avgTime.toFixed(1)}d</span>
                    </div>
                    <Progress value={performer.completionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Monthly Task Trend
          </h3>
          <div className="space-y-3">
            {teamPerformance.monthlyTrend.map((month) => (
              <div key={month.month} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium">{month.month}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{month.completed}/{month.tasks} completed</span>
                    <span className="text-muted-foreground">
                      {month.tasks > 0 ? ((month.completed / month.tasks) * 100).toFixed(1) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={month.tasks > 0 ? (month.completed / month.tasks) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Alerts */}
        {completionRate < 70 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Performance Alert
              </p>
              <p className="text-xs text-yellow-700">
                Team completion rate is at {completionRate.toFixed(1)}%. 
                Consider reviewing task assignments and deadlines.
              </p>
            </div>
          </div>
        )}

        {/* Data Source Info */}
        {useMockData && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <Info className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Demo Mode Active
              </p>
              <p className="text-xs text-blue-700">
                Showing sample data with 8 mock tasks and 8 employees across all production teams. 
                Create real tasks or switch to mock data to see the functionality.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductionTeamPerformance; 
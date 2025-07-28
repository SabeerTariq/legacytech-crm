import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  DollarSign, 
  Target, 
  Users, 
  BarChart3,
  Calendar,
  Award,
  AlertCircle,
  Plus,
  RefreshCw,
  Info,
  CheckCircle,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
// Authentication removed - no user context needed
import { useToast } from "@/hooks/use-toast";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface SalesDisposition {
  id: string;
  project_manager: string;
  gross_value: number;
  cash_in: number;
  sale_date: string;
  sale_type: string;
  company: string;
  created_at: string;
  assigned_to: string;
}

interface EmployeePerformance {
  id: string;
  name: string;
  email: string;
  performance: {
    salesTarget: number;
    salesAchieved: number;
    projectsCompleted: number;
    tasksCompleted: number;
    customerSatisfaction: number;
    avgTaskCompletionTime: number;
  };
}

interface TeamPerformanceData {
  totalProjectsManaged: number;
  totalTarget: number;
  completionRate: number;
  averageProjectValue: number;
  topPerformers: Array<{
    name: string;
    projects: number;
    target: number;
    achievement: number;
    customerSatisfaction: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    projects: number;
    target: number;
  }>;
  projectStatusBreakdown: {
    completed: number;
    inProgress: number;
    delayed: number;
    onHold: number;
  };
}

// Mock sales dispositions for Project Management demonstration
const mockProjectManagementData: SalesDisposition[] = [
  {
    id: "1",
    project_manager: "Mike Davis",
    gross_value: 15000,
    cash_in: 12000,
    sale_date: "2024-01-15",
    sale_type: "FRONT",
    company: "American Digital Agency",
    created_at: "2024-01-15T10:00:00Z",
    assigned_to: "John Smith"
  },
  {
    id: "2",
    project_manager: "Emily Wilson",
    gross_value: 25000,
    cash_in: 20000,
    sale_date: "2024-01-20",
    sale_type: "UPSELL",
    company: "American Digital Agency",
    created_at: "2024-01-20T14:30:00Z",
    assigned_to: "Sarah Johnson"
  },
  {
    id: "3",
    project_manager: "Mike Davis",
    gross_value: 18000,
    cash_in: 15000,
    sale_date: "2024-01-25",
    sale_type: "FRONT",
    company: "American Digital Agency",
    created_at: "2024-01-25T09:15:00Z",
    assigned_to: "Mike Davis"
  },
  {
    id: "4",
    project_manager: "Emily Wilson",
    gross_value: 22000,
    cash_in: 18000,
    sale_date: "2024-01-28",
    sale_type: "RENEWAL",
    company: "American Digital Agency",
    created_at: "2024-01-28T16:45:00Z",
    assigned_to: "John Smith"
  },
  {
    id: "5",
    project_manager: "Mike Davis",
    gross_value: 30000,
    cash_in: 25000,
    sale_date: "2024-01-30",
    sale_type: "FRONT",
    company: "American Digital Agency",
    created_at: "2024-01-30T11:20:00Z",
    assigned_to: "Emily Wilson"
  },
  {
    id: "6",
    project_manager: "Emily Wilson",
    gross_value: 12000,
    cash_in: 10000,
    sale_date: "2024-02-05",
    sale_type: "UPSELL",
    company: "American Digital Agency",
    created_at: "2024-02-05T13:10:00Z",
    assigned_to: "Sarah Johnson"
  },
  {
    id: "7",
    project_manager: "Mike Davis",
    gross_value: 28000,
    cash_in: 22000,
    sale_date: "2024-02-10",
    sale_type: "FRONT",
    company: "American Digital Agency",
    created_at: "2024-02-10T15:30:00Z",
    assigned_to: "Mike Davis"
  },
  {
    id: "8",
    project_manager: "Emily Wilson",
    gross_value: 19000,
    cash_in: 16000,
    sale_date: "2024-02-15",
    sale_type: "RENEWAL",
    company: "American Digital Agency",
    created_at: "2024-02-15T10:45:00Z",
    assigned_to: "John Smith"
  }
];

const ProjectManagementPerformance: React.FC = () => {
  // User context removed - no authentication needed
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [useMockData, setUseMockData] = React.useState(true);

  // Fetch sales disposition data for the current month
  const { data: salesData = [], isLoading: salesLoading } = useQuery({
    queryKey: ['project-management-sales'],
    queryFn: async () => {
      if (useMockData) {
        // Return mock data for demonstration
        return mockProjectManagementData;
      }

      const currentDate = new Date();
      const startDate = format(startOfMonth(currentDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(currentDate), 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('sales_dispositions')
        .select('*')
        .gte('sale_date', startDate)
        .lte('sale_date', endDate)
        .eq('company', 'American Digital Agency');
      
      if (error) {
        toast({
          title: "Error fetching sales data",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data as SalesDisposition[];
    },
  });

  // Fetch Project Management employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['project-management-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('department', 'Project Management');
      
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
        performance: {
          salesTarget: Number(emp.performance?.salesTarget || emp.performance?.sales_target || 0),
          salesAchieved: Number(emp.performance?.salesAchieved || emp.performance?.sales_achieved || 0),
          projectsCompleted: Number(emp.performance?.projectsCompleted || emp.performance?.projects_completed || 0),
          tasksCompleted: Number(emp.performance?.tasksCompleted || emp.performance?.tasks_completed || 0),
          customerSatisfaction: Number(emp.performance?.customerSatisfaction || emp.performance?.customer_satisfaction || 0),
          avgTaskCompletionTime: Number(emp.performance?.avgTaskCompletionTime || emp.performance?.avg_task_completion_time || 0),
        }
      })) as EmployeePerformance[];
    },
  });

  // Mutation to generate sample sales dispositions for Project Management
  const generateSampleDispositions = useMutation({
    mutationFn: async () => {
      const sampleDispositions = [
        {
          sale_date: format(new Date(), 'yyyy-MM-dd'),
          customer_name: "Project Management Customer 1",
          phone_number: "555-0201",
          email: "pmcustomer1@example.com",
          service_sold: "Project Management Services",
          services_included: ["Planning", "Coordination", "Delivery"],
          turnaround_time: "8-12 weeks",
          service_tenure: "12",
          payment_mode: "WIRE" as const,
          company: "American Digital Agency" as const,
          sales_source: "BARK" as const,
          lead_source: "PAID_MARKETING" as const,
          sale_type: "FRONT" as const,
          gross_value: 20000,
          cash_in: 16000,
          remaining: 4000,
          seller: "John Smith",
          account_manager: "Sarah Johnson",
          project_manager: "Mike Davis",
          assigned_to: "Mike Davis",
          assigned_by: "Manager",
          user_id: 'admin'
        },
        {
          sale_date: format(new Date(), 'yyyy-MM-dd'),
          customer_name: "Project Management Customer 2",
          phone_number: "555-0202",
          email: "pmcustomer2@example.com",
          service_sold: "Agile Project Management",
          services_included: ["Sprint Planning", "Scrum Master", "Reporting"],
          turnaround_time: "6-8 weeks",
          service_tenure: "6",
          payment_mode: "PayPal OSCS" as const,
          company: "American Digital Agency" as const,
          sales_source: "FACEBOOK" as const,
          lead_source: "ORGANIC" as const,
          sale_type: "UPSELL" as const,
          gross_value: 30000,
          cash_in: 25000,
          remaining: 5000,
          seller: "Sarah Johnson",
          account_manager: "Sarah Johnson",
          project_manager: "Emily Wilson",
          assigned_to: "Emily Wilson",
          assigned_by: "Manager",
          user_id: 'admin'
        }
      ];

      const { error } = await supabase
        .from('sales_dispositions')
        .insert(sampleDispositions);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Sample project management dispositions created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['project-management-sales'] });
      setUseMockData(false); // Switch to real data
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create sample dispositions. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Calculate team performance metrics
  const teamPerformance = React.useMemo((): TeamPerformanceData => {
    const totalProjectsManaged = salesData.length;
    const totalTarget = employees.reduce((sum, emp) => sum + (emp.performance?.salesTarget || 0), 0);
    const completionRate = totalProjectsManaged > 0 ? (salesData.filter(sale => sale.cash_in > 0).length / totalProjectsManaged) * 100 : 0;
    const averageProjectValue = totalProjectsManaged > 0 ? salesData.reduce((sum, sale) => sum + sale.cash_in, 0) / totalProjectsManaged : 0;

    // Calculate individual performance
    const individualPerformance = employees.map(emp => {
      const employeeProjects = salesData.filter(sale => 
        sale.project_manager.toLowerCase().includes(emp.name.toLowerCase())
      );
      
      const projectsCount = employeeProjects.length;
      const target = emp.performance?.salesTarget || 0;
      const achievement = target > 0 ? (projectsCount / (target / 10000)) * 100 : 0; // Assuming target is in dollars, convert to project count
      const customerSatisfaction = emp.performance?.customerSatisfaction || 85; // Default satisfaction score

      return {
        name: emp.name,
        projects: projectsCount,
        target: Math.round(target / 10000), // Convert dollar target to project count
        achievement: achievement,
        customerSatisfaction: customerSatisfaction
      };
    });

    // Sort by achievement rate to get top performers
    const topPerformers = individualPerformance
      .sort((a, b) => b.achievement - a.achievement)
      .slice(0, 3);

    // Calculate monthly trend for last 6 months
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthProjects = salesData.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate >= monthStart && saleDate <= monthEnd;
      }).length;

      const monthTarget = employees.reduce((sum, emp) => sum + (emp.performance?.salesTarget || 0), 0) / 120000; // Monthly target in projects

      return {
        month: format(date, 'MMM yyyy'),
        projects: monthProjects,
        target: Math.round(monthTarget)
      };
    }).reverse();

    // Project status breakdown (mock data for demonstration)
    const projectStatusBreakdown = {
      completed: Math.round(totalProjectsManaged * 0.6),
      inProgress: Math.round(totalProjectsManaged * 0.25),
      delayed: Math.round(totalProjectsManaged * 0.1),
      onHold: Math.round(totalProjectsManaged * 0.05)
    };

    return {
      totalProjectsManaged,
      totalTarget,
      completionRate,
      averageProjectValue,
      topPerformers,
      monthlyTrend,
      projectStatusBreakdown
    };
  }, [salesData, employees]);

  const overallAchievement = teamPerformance.totalTarget > 0 
    ? (teamPerformance.totalProjectsManaged / teamPerformance.totalTarget) * 100 
    : 0;

  const handleToggleData = () => {
    setUseMockData(!useMockData);
    queryClient.invalidateQueries({ queryKey: ['project-management-sales'] });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Project Management Team Performance
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
                onClick={() => generateSampleDispositions.mutate()}
                disabled={generateSampleDispositions.isPending}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {generateSampleDispositions.isPending ? "Creating..." : "Add Sample Data"}
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
        {/* Overall Team Performance */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Projects Managed</span>
            </div>
            <p className="text-2xl font-bold">{teamPerformance.totalProjectsManaged}</p>
            <p className="text-xs text-muted-foreground">
              Target: {Math.round(teamPerformance.totalTarget)} projects
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Achievement Rate</span>
            </div>
            <p className="text-2xl font-bold">{overallAchievement.toFixed(1)}%</p>
            <Progress value={overallAchievement} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">Completion Rate</span>
            </div>
            <p className="text-2xl font-bold">{teamPerformance.completionRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              {teamPerformance.totalProjectsManaged} total projects
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Avg Project Value</span>
            </div>
            <p className="text-2xl font-bold">${teamPerformance.averageProjectValue.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              Per project
            </p>
          </div>
        </div>

        {/* Project Status Breakdown */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Project Status Overview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{teamPerformance.projectStatusBreakdown.completed}</p>
              <p className="text-sm text-green-700">Completed</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{teamPerformance.projectStatusBreakdown.inProgress}</p>
              <p className="text-sm text-blue-700">In Progress</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-yellow-600">{teamPerformance.projectStatusBreakdown.delayed}</p>
              <p className="text-sm text-yellow-700">Delayed</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-600">{teamPerformance.projectStatusBreakdown.onHold}</p>
              <p className="text-sm text-gray-700">On Hold</p>
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Award className="h-5 w-5" />
            Top Project Managers
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
                        #{index + 1} Project Manager
                      </p>
                    </div>
                    <Badge variant={performer.achievement >= 100 ? "default" : "secondary"}>
                      {performer.achievement.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Projects:</span>
                      <span className="font-medium">{performer.projects}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Target:</span>
                      <span className="font-medium">{performer.target}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Satisfaction:</span>
                      <span className="font-medium">{performer.customerSatisfaction}%</span>
                    </div>
                    <Progress value={performer.achievement} className="h-2" />
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
            Monthly Project Trend
          </h3>
          <div className="space-y-3">
            {teamPerformance.monthlyTrend.map((month) => (
              <div key={month.month} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium">{month.month}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>{month.projects} projects</span>
                    <span className="text-muted-foreground">
                      Target: {month.target} projects
                    </span>
                  </div>
                  <Progress 
                    value={month.target > 0 ? (month.projects / month.target) * 100 : 0} 
                    className="h-2" 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Alerts */}
        {overallAchievement < 80 && (
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Performance Alert
              </p>
              <p className="text-xs text-yellow-700">
                Team is currently at {overallAchievement.toFixed(1)}% of target. 
                Consider additional support or training.
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
                Showing sample data with 8 mock project management dispositions. 
                Create real dispositions or switch to mock data to see the functionality.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectManagementPerformance; 
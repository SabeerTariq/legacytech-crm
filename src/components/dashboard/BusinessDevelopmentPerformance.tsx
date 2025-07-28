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
  Info
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
// Authentication removed - no user context needed
import { useToast } from "@/hooks/use-toast";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface SalesDisposition {
  id: string;
  seller: string;
  gross_value: number;
  cash_in: number;
  sale_date: string;
  sale_type: string;
  company: string;
  created_at: string;
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
  totalSales: number;
  totalTarget: number;
  conversionRate: number;
  averageDealSize: number;
  topPerformers: Array<{
    name: string;
    sales: number;
    target: number;
    achievement: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    sales: number;
    target: number;
  }>;
}

// Mock sales dispositions for demonstration
const mockSalesDispositions: SalesDisposition[] = [
  {
    id: "1",
    seller: "John Smith",
    gross_value: 15000,
    cash_in: 12000,
    sale_date: "2024-01-15",
    sale_type: "FRONT",
    company: "American Digital Agency",
    created_at: "2024-01-15T10:00:00Z"
  },
  {
    id: "2",
    seller: "Sarah Johnson",
    gross_value: 25000,
    cash_in: 20000,
    sale_date: "2024-01-20",
    sale_type: "UPSELL",
    company: "American Digital Agency",
    created_at: "2024-01-20T14:30:00Z"
  },
  {
    id: "3",
    seller: "Mike Davis",
    gross_value: 18000,
    cash_in: 15000,
    sale_date: "2024-01-25",
    sale_type: "FRONT",
    company: "American Digital Agency",
    created_at: "2024-01-25T09:15:00Z"
  },
  {
    id: "4",
    seller: "John Smith",
    gross_value: 22000,
    cash_in: 18000,
    sale_date: "2024-01-28",
    sale_type: "RENEWAL",
    company: "American Digital Agency",
    created_at: "2024-01-28T16:45:00Z"
  },
  {
    id: "5",
    seller: "Emily Wilson",
    gross_value: 30000,
    cash_in: 25000,
    sale_date: "2024-01-30",
    sale_type: "FRONT",
    company: "American Digital Agency",
    created_at: "2024-01-30T11:20:00Z"
  },
  {
    id: "6",
    seller: "Sarah Johnson",
    gross_value: 12000,
    cash_in: 10000,
    sale_date: "2024-02-05",
    sale_type: "UPSELL",
    company: "American Digital Agency",
    created_at: "2024-02-05T13:10:00Z"
  },
  {
    id: "7",
    seller: "Mike Davis",
    gross_value: 28000,
    cash_in: 22000,
    sale_date: "2024-02-10",
    sale_type: "FRONT",
    company: "American Digital Agency",
    created_at: "2024-02-10T15:30:00Z"
  },
  {
    id: "8",
    seller: "John Smith",
    gross_value: 19000,
    cash_in: 16000,
    sale_date: "2024-02-15",
    sale_type: "RENEWAL",
    company: "American Digital Agency",
    created_at: "2024-02-15T10:45:00Z"
  }
];

const BusinessDevelopmentPerformance: React.FC = () => {
  // User context removed - no authentication needed
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [useMockData, setUseMockData] = React.useState(true);

  // Fetch sales disposition data for the current month
  const { data: salesData = [], isLoading: salesLoading } = useQuery({
    queryKey: ['business-dev-sales'],
    queryFn: async () => {
      if (useMockData) {
        // Return mock data for demonstration
        return mockSalesDispositions;
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

  // Fetch Business Development employees
  const { data: employees = [], isLoading: employeesLoading } = useQuery({
    queryKey: ['business-dev-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('department', 'Business Development');
      
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

  // Mutation to generate sample sales dispositions
  const generateSampleDispositions = useMutation({
    mutationFn: async () => {
      const sampleDispositions = [
        {
          sale_date: format(new Date(), 'yyyy-MM-dd'),
          customer_name: "Sample Customer 1",
          phone_number: "555-0101",
          email: "customer1@example.com",
          service_sold: "Website Development",
          services_included: ["Design", "Development", "SEO"],
          turnaround_time: "4-6 weeks",
          service_tenure: "12",
          payment_mode: "WIRE" as const,
          company: "American Digital Agency" as const,
          sales_source: "BARK" as const,
          lead_source: "PAID_MARKETING" as const,
          sale_type: "FRONT" as const,
          gross_value: 15000,
          cash_in: 12000,
          remaining: 3000,
          seller: "John Smith",
          account_manager: "Sarah Johnson",
          project_manager: "Mike Davis",
          assigned_to: "John Smith",
          assigned_by: "Manager",
          user_id: 'admin'
        },
        {
          sale_date: format(new Date(), 'yyyy-MM-dd'),
          customer_name: "Sample Customer 2",
          phone_number: "555-0102",
          email: "customer2@example.com",
          service_sold: "Digital Marketing Package",
          services_included: ["PPC", "Social Media", "Content"],
          turnaround_time: "2-3 weeks",
          service_tenure: "6",
          payment_mode: "PayPal OSCS" as const,
          company: "American Digital Agency" as const,
          sales_source: "FACEBOOK" as const,
          lead_source: "ORGANIC" as const,
          sale_type: "UPSELL" as const,
          gross_value: 25000,
          cash_in: 20000,
          remaining: 5000,
          seller: "Sarah Johnson",
          account_manager: "Sarah Johnson",
          project_manager: "Emily Wilson",
          assigned_to: "Sarah Johnson",
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
        description: "Sample sales dispositions created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ['business-dev-sales'] });
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
    const totalSales = salesData.reduce((sum, sale) => sum + sale.cash_in, 0);
    const totalTarget = employees.reduce((sum, emp) => sum + (emp.performance?.salesTarget || 0), 0);
    const conversionRate = salesData.length > 0 ? (salesData.filter(sale => sale.gross_value > 0).length / salesData.length) * 100 : 0;
    const averageDealSize = salesData.length > 0 ? totalSales / salesData.length : 0;

    // Calculate individual performance
    const individualPerformance = employees.map(emp => {
      const employeeSales = salesData
        .filter(sale => sale.seller.toLowerCase().includes(emp.name.toLowerCase()))
        .reduce((sum, sale) => sum + sale.cash_in, 0);
      
      const target = emp.performance?.salesTarget || 0;
      const achievement = target > 0 ? (employeeSales / target) * 100 : 0;

      return {
        name: emp.name,
        sales: employeeSales,
        target: target,
        achievement: achievement
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
      
      const monthSales = salesData.filter(sale => {
        const saleDate = new Date(sale.sale_date);
        return saleDate >= monthStart && saleDate <= monthEnd;
      }).reduce((sum, sale) => sum + sale.cash_in, 0);

      const monthTarget = employees.reduce((sum, emp) => sum + (emp.performance?.salesTarget || 0), 0) / 12; // Monthly target

      return {
        month: format(date, 'MMM yyyy'),
        sales: monthSales,
        target: monthTarget
      };
    }).reverse();

    return {
      totalSales,
      totalTarget,
      conversionRate,
      averageDealSize,
      topPerformers,
      monthlyTrend
    };
  }, [salesData, employees]);

  const overallAchievement = teamPerformance.totalTarget > 0 
    ? (teamPerformance.totalSales / teamPerformance.totalTarget) * 100 
    : 0;

  const handleToggleData = () => {
    setUseMockData(!useMockData);
    queryClient.invalidateQueries({ queryKey: ['business-dev-sales'] });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Business Development Team Performance
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
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Total Sales</span>
            </div>
            <p className="text-2xl font-bold">${teamPerformance.totalSales.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              Target: ${teamPerformance.totalTarget.toLocaleString()}
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
              <span className="text-sm font-medium">Conversion Rate</span>
            </div>
            <p className="text-2xl font-bold">{teamPerformance.conversionRate.toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">
              {salesData.length} total deals
            </p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium">Avg Deal Size</span>
            </div>
            <p className="text-2xl font-bold">${teamPerformance.averageDealSize.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
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
                    <Badge variant={performer.achievement >= 100 ? "default" : "secondary"}>
                      {performer.achievement.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Sales:</span>
                      <span className="font-medium">${performer.sales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Target:</span>
                      <span className="font-medium">${performer.target.toLocaleString()}</span>
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
            Monthly Performance Trend
          </h3>
          <div className="space-y-3">
            {teamPerformance.monthlyTrend.map((month) => (
              <div key={month.month} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium">{month.month}</div>
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span>${month.sales.toLocaleString()}</span>
                    <span className="text-muted-foreground">
                      Target: ${month.target.toLocaleString()}
                    </span>
                  </div>
                  <Progress 
                    value={month.target > 0 ? (month.sales / month.target) * 100 : 0} 
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
                Showing sample data with 8 mock sales dispositions. 
                Create real dispositions or switch to mock data to see the functionality.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BusinessDevelopmentPerformance; 
import React, { useState } from "react";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import BusinessDevelopmentPerformance from "@/components/dashboard/BusinessDevelopmentPerformance";
import ProjectManagementPerformance from "@/components/dashboard/ProjectManagementPerformance";
import ProductionTeamPerformance from "@/components/dashboard/ProductionTeamPerformance";
import { AreaChart, BarChart, Calendar, DollarSign, Users, Zap, Mail, MessageSquare, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
// Authentication removed - no user context needed
import { useToast } from "@/hooks/use-toast";
import TeamPerformance from "@/components/dashboard/team/TeamPerformance";
import BusinessOverview from "@/components/dashboard/BusinessOverview";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { useNavigate } from "react-router-dom";


interface Task {
  id: string;
  title: string;
  status: string;
  created_at: string;
  assigned_to_id: string | null;
  project: {
    id: string;
    name: string;
  } | null;
}

interface Employee {
  id: string;
  full_name: string;
}

interface Activity {
  id: string;
  user: {
    name: string;
    initials: string;
  };
  action: string;
  target: string;
  time: string;
}

const Dashboard = () => {
  // User context removed - no authentication needed
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState<number>(0);

  // Handle initial month from URL
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const monthParam = params.get('month');
    if (monthParam) {
      const monthValue = parseInt(monthParam, 10);
      if (!isNaN(monthValue) && monthValue >= 0 && monthValue < 12) {
        setSelectedMonth(monthValue);
      }
    }
  }, []);

  // Generate month options for the last 12 months
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: i,
      label: format(date, 'MMMM yyyy')
    };
  });

  // Fetch leads data for all months
  const { data: leads = [] } = useQuery({
    queryKey: ['dashboard-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('id, status, price, date, created_at')
        .or(`status.eq.won,status.eq.new,status.eq.contacted,status.eq.lost`);
      
      if (error) {
        toast({
          title: "Error fetching leads",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    },
  });

  // Fetch employees for task assignment
  const { data: employees = [] } = useQuery({
    queryKey: ['dashboard-employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, full_name')
        .order('full_name');
      
      if (error) {
        toast({
          title: "Error fetching employees",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data || [];
    },
  });

  // Fetch recent tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['dashboard-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('project_tasks')
        .select(`
          id,
          title,
          status,
          created_at,
          assigned_to_id,
          project:projects(name)
        `)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) {
        toast({
          title: "Error fetching tasks",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return (tasks as unknown as Task[]).map(task => {
        const employee = employees.find(emp => emp.id === task.assigned_to_id);
        return {
          id: task.id,
          user: {
            name: employee?.full_name || 'Unassigned',
            initials: employee?.full_name?.split(' ').map(n => n[0]).join('') || 'UA',
          },
          action: `task ${task.status}`,
          target: `${task.project?.name || 'Project'}: ${task.title}`,
          time: new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ago',
        };
      });
    },
  });

  // Calculate dashboard metrics for the selected month
  const currentDate = new Date();
  const targetDate = subMonths(currentDate, selectedMonth);
  const startDate = startOfMonth(targetDate);
  const endDate = endOfMonth(targetDate);
  const lastMonthDate = subMonths(targetDate, 1);
  const lastMonthStart = startOfMonth(lastMonthDate);
  const lastMonthEnd = endOfMonth(lastMonthDate);

  // Calculate leads for current month
  const monthLeads = React.useMemo(() => {
    return leads.filter(lead => {
      const leadDate = new Date(lead.date || lead.created_at);
      const leadMonth = leadDate.getMonth();
      const leadYear = leadDate.getFullYear();
      const targetMonth = targetDate.getMonth();
      const targetYear = targetDate.getFullYear();
      return leadMonth === targetMonth && leadYear === targetYear;
    });
  }, [leads, targetDate]);

  const activeLeads = monthLeads.filter(lead => lead.status === 'won').length;
  console.log('Dashboard - Active Leads Calculation:', {
    totalMonthLeads: monthLeads.length,
    wonLeads: activeLeads,
    month: targetDate.toLocaleString('default', { month: 'long' }),
    year: targetDate.getFullYear(),
    leadStatuses: monthLeads.map(lead => lead.status)
  });

  // Calculate leads for last month
  const lastMonthLeads = React.useMemo(() => {
    return leads.filter(lead => {
      const leadDate = new Date(lead.date || lead.created_at);
      const leadMonth = leadDate.getMonth();
      const leadYear = leadDate.getFullYear();
      const lastMonth = lastMonthDate.getMonth();
      const lastYear = lastMonthDate.getFullYear();
      return leadMonth === lastMonth && leadYear === lastYear;
    });
  }, [leads, lastMonthDate]);

  const lastMonthActiveLeads = lastMonthLeads.filter(lead => lead.status === 'won').length;
  
      // Calculate total revenue from won leads for the selected month
    const wonLeads = monthLeads.filter(lead =>
      lead.status === 'won'
    );
    const lastMonthWonLeads = lastMonthLeads.filter(lead =>
      lead.status === 'won'
    );

      const totalRevenue = wonLeads.reduce((sum, lead) => sum + (Number(lead.price) || 0), 0);
    const lastMonthRevenue = lastMonthWonLeads.reduce((sum, lead) => sum + (Number(lead.price) || 0), 0);
  
  // Calculate win rate for the selected month
  const winRate = monthLeads.length > 0 
    ? ((wonLeads.length / monthLeads.length) * 100).toFixed(1)
    : "0.0";

  const lastMonthWinRate = lastMonthLeads.length > 0 
    ? ((lastMonthWonLeads.length / lastMonthLeads.length) * 100).toFixed(1)
    : "0.0";

  const calculatePercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100);
  };

  const handleMonthChange = (value: string) => {
    const monthIndex = parseInt(value, 10);
    setSelectedMonth(monthIndex);
    
    // Update URL with new month
    const params = new URLSearchParams(window.location.search);
    params.set('month', monthIndex.toString());
    navigate(`?${params.toString()}`, { replace: true });
  };

  const activities = tasks as unknown as Activity[];

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back! Here's what's happening with your business.
            </p>
          </div>
          <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>



        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Leads"
            value={monthLeads.length.toString()}
            icon={<Users className="h-4 w-4" />}
            description={`${calculatePercentageChange(monthLeads.length, lastMonthLeads.length)}% from last month`}
            trend={{
              value: calculatePercentageChange(monthLeads.length, lastMonthLeads.length),
              positive: monthLeads.length >= lastMonthLeads.length
            }}
          />
          <StatCard
            title="Active Leads"
            value={activeLeads.toString()}
            icon={<TrendingUp className="h-4 w-4" />}
            description={`${calculatePercentageChange(activeLeads, lastMonthActiveLeads)}% from last month`}
            trend={{
              value: calculatePercentageChange(activeLeads, lastMonthActiveLeads),
              positive: activeLeads >= lastMonthActiveLeads
            }}
          />
          <StatCard
                          title="Win Rate"
            value={`${winRate}%`}
            icon={<BarChart className="h-4 w-4" />}
            description={`${calculatePercentageChange(parseFloat(winRate), parseFloat(lastMonthWinRate))}% from last month`}
            trend={{
              value: calculatePercentageChange(parseFloat(winRate), parseFloat(lastMonthWinRate)),
              positive: parseFloat(winRate) >= parseFloat(lastMonthWinRate)
            }}
          />
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            icon={<DollarSign className="h-4 w-4" />}
            description={`${calculatePercentageChange(totalRevenue, lastMonthRevenue)}% from last month`}
            trend={{
              value: calculatePercentageChange(totalRevenue, lastMonthRevenue),
              positive: totalRevenue >= lastMonthRevenue
            }}
          />
        </div>

        {/* Performance Components */}
        <div className="grid gap-6 md:grid-cols-2">
          <RecentActivity activities={activities} />
        </div>

        {/* Team Performance */}
        <TeamPerformance />

        {/* Business Overview */}
        <BusinessOverview selectedMonth={selectedMonth} />

        {/* Department Performance */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <BusinessDevelopmentPerformance />
          <ProjectManagementPerformance />
          <ProductionTeamPerformance />
        </div>
      </div>
  );
};

export default Dashboard;

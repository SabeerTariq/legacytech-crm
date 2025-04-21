import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ProjectsOverview from "@/components/dashboard/ProjectsOverview";
import { AreaChart, BarChart, Calendar, DollarSign, Users, Zap, Mail, MessageSquare, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
  name: string;
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

interface Project {
  id: string;
  name: string;
  client: string;
  description: string;
  dueDate: string;
  status: "new" | "in-progress" | "completed" | "review" | "approved" | "on-hold";
  progress: number;
}

const Dashboard = () => {
  const { user } = useAuth();
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
      
      return data;
    },
    enabled: !!user,
  });

  // Fetch projects data for all months
  const { data: projects = [] } = useQuery({
    queryKey: ['dashboard-projects'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user?.id);
      
      if (error) {
        toast({
          title: "Error fetching projects",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
      
      return data.map(project => ({
        id: project.id,
        name: project.name,
        client: project.client,
        description: project.description || '',
        dueDate: new Date(project.due_date).toLocaleDateString(),
        status: project.status as Project['status'],
        progress: project.progress || 0,
      }));
    },
    enabled: !!user,
  });

  // Fetch activities data
  const { data: activities = [] } = useQuery({
    queryKey: ['dashboard-activities', selectedMonth],
    queryFn: async () => {
      const currentDate = new Date();
      const targetDate = subMonths(currentDate, selectedMonth);
      const startDate = format(startOfMonth(targetDate), 'yyyy-MM-dd');
      const endDate = format(endOfMonth(targetDate), 'yyyy-MM-dd');
      
      // Fetch recent tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select(`
          *,
          project:projects(name)
        `)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .order('created_at', { ascending: false })
        .limit(5);

      if (tasksError) {
        toast({
          title: "Error fetching tasks",
          description: tasksError.message,
          variant: "destructive",
        });
        return [];
      }

      // Fetch employees for task assignments
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, name');

      if (employeesError) {
        toast({
          title: "Error fetching employees",
          description: employeesError.message,
          variant: "destructive",
        });
        return [];
      }
      
      return (tasks as unknown as Task[]).map(task => {
        const employee = employees.find(emp => emp.id === task.assigned_to_id);
        return {
          id: task.id,
          user: {
            name: employee?.name || 'Unassigned',
            initials: employee?.name?.split(' ').map(n => n[0]).join('') || 'UA',
          },
          action: `task ${task.status}`,
          target: `${task.project?.name || 'Project'}: ${task.title}`,
          time: new Date(task.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' ago',
        };
      });
    },
    enabled: !!user,
  });

  // Calculate dashboard metrics for the selected month
  const currentDate = new Date();
  const targetDate = subMonths(currentDate, selectedMonth);
  const startDate = startOfMonth(targetDate);
  const endDate = endOfMonth(targetDate);
  const lastMonthDate = subMonths(targetDate, 1);
  const lastMonthStart = startOfMonth(lastMonthDate);
  const lastMonthEnd = endOfMonth(lastMonthDate);

  // Calculate metrics for current month
  const monthProjects = React.useMemo(() => {
    return projects.filter(project => {
      const projectDate = new Date(project.dueDate);
      return projectDate >= startDate && projectDate <= endDate;
    });
  }, [projects, startDate, endDate]);

  const totalProjects = monthProjects.length;
  const activeProjects = monthProjects.filter(p => p.status !== 'completed').length;
  
  // Calculate metrics for last month
  const lastMonthProjects = React.useMemo(() => {
    return projects.filter(project => {
      const projectDate = new Date(project.dueDate);
      return projectDate >= lastMonthStart && projectDate <= lastMonthEnd;
    });
  }, [projects, lastMonthStart, lastMonthEnd]);

  const lastMonthTotalProjects = lastMonthProjects.length;
  const lastMonthActiveProjects = lastMonthProjects.filter(p => p.status !== 'completed').length;

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
  
  // Calculate total revenue from converted and won leads for the selected month
  const convertedLeads = monthLeads.filter(lead => 
    lead.status === 'converted' || lead.status === 'won'
  );
  const lastMonthConvertedLeads = lastMonthLeads.filter(lead => 
    lead.status === 'converted' || lead.status === 'won'
  );

  const totalRevenue = convertedLeads.reduce((sum, lead) => sum + (Number(lead.price) || 0), 0);
  const lastMonthRevenue = lastMonthConvertedLeads.reduce((sum, lead) => sum + (Number(lead.price) || 0), 0);
  
  // Calculate conversion rate for the selected month
  const conversionRate = monthLeads.length > 0 
    ? ((convertedLeads.length / monthLeads.length) * 100).toFixed(1)
    : "0.0";
  
  const lastMonthConversionRate = lastMonthLeads.length > 0
    ? ((lastMonthConvertedLeads.length / lastMonthLeads.length) * 100).toFixed(1)
    : "0.0";

  // Calculate percentage changes
  const calculatePercentageChange = (current: number, previous: number) => {
    console.log('Calculating percentage change:', { current, previous });
    if (previous === 0) {
      // If previous was 0 and current is positive, show 100% increase
      return current > 0 ? 100 : 0;
    }
    const change = ((current - previous) / previous) * 100;
    return Math.round(change);
  };

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects.toString(),
      icon: <BarChart />,
      trend: { 
        value: calculatePercentageChange(totalProjects, lastMonthTotalProjects),
        positive: totalProjects >= lastMonthTotalProjects
      },
    },
    {
      title: "Active Leads",
      value: activeLeads.toString(),
      icon: <Users />,
      trend: { 
        value: calculatePercentageChange(activeLeads, lastMonthActiveLeads),
        positive: activeLeads >= lastMonthActiveLeads
      },
    },
    {
      title: "Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: <DollarSign />,
      trend: { 
        value: calculatePercentageChange(totalRevenue, lastMonthRevenue),
        positive: totalRevenue >= lastMonthRevenue
      },
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: <TrendingUp />,
      trend: { 
        value: calculatePercentageChange(Number(conversionRate), Number(lastMonthConversionRate)),
        positive: Number(conversionRate) >= Number(lastMonthConversionRate)
      },
    },
  ];

  const handleMonthChange = (value: string) => {
    const monthValue = Number(value);
    setSelectedMonth(monthValue);
    // Update URL without causing a navigation
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('month', monthValue.toString());
    window.history.pushState({}, '', newUrl.toString());
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Select value={selectedMonth.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
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
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <BusinessOverview selectedMonth={selectedMonth} />

        <div className="grid gap-6 md:grid-cols-2">
          <ProjectsOverview projects={monthProjects} />
          <RecentActivity activities={activities} />
        </div>

        <TeamPerformance />
      </div>
    </MainLayout>
  );
};

export default Dashboard;

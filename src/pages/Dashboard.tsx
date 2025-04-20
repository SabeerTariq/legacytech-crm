import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ProjectsOverview from "@/components/dashboard/ProjectsOverview";
import { AreaChart, BarChart, Calendar, DollarSign, Users, Zap, Mail, MessageSquare, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import TeamPerformance from "@/components/dashboard/TeamPerformance";
import BusinessOverview from "@/components/dashboard/BusinessOverview";

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

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch projects data
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
        status: project.status,
        progress: project.progress || 0,
      }));
    },
    enabled: !!user,
  });

  // Fetch leads data
  const { data: leads = [] } = useQuery({
    queryKey: ['dashboard-leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('*');
      
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

  // Fetch recent tasks and employees
  const { data: activities = [] } = useQuery<Activity[]>({
    queryKey: ['dashboard-activities'],
    queryFn: async () => {
      // Fetch recent tasks
      const { data: tasks, error: tasksError } = await supabase
        .from('project_tasks')
        .select(`
          id,
          title,
          status,
          created_at,
          assigned_to_id,
          project:projects (
            id,
            name
          )
        `)
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

      // Fetch employees for the tasks
      const employeeIds = tasks
        .map(task => task.assigned_to_id)
        .filter((id): id is string => id !== null);
      
      let employees: Employee[] = [];
      if (employeeIds.length > 0) {
        const { data: employeesData, error: employeesError } = await supabase
          .from('employees')
          .select('id, name')
          .in('id', employeeIds);
        
        if (employeesError) {
          toast({
            title: "Error fetching employees",
            description: employeesError.message,
            variant: "destructive",
          });
        } else {
          employees = employeesData || [];
        }
      }
      
      return (tasks as Task[]).map(task => {
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

  // Calculate dashboard metrics
  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status !== 'completed').length;
  
  const activeLeads = leads.filter(lead => 
    lead.status === 'new' || lead.status === 'contacted' || lead.status === 'qualified'
  ).length;
  
  // Calculate total revenue from converted and won leads
  const convertedLeads = leads.filter(lead => 
    lead.status === 'converted' || lead.status === 'won'
  );
  const totalRevenue = convertedLeads.reduce((sum, lead) => sum + (Number(lead.price) || 0), 0);
  
  // Calculate conversion rate
  const conversionRate = leads.length > 0 
    ? ((convertedLeads.length / leads.length) * 100).toFixed(1)
    : "0.0";

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects.toString(),
      icon: <BarChart />,
      trend: { value: activeProjects > 0 ? Math.round((activeProjects/totalProjects) * 100) : 0, positive: true },
    },
    {
      title: "Active Leads",
      value: activeLeads.toString(),
      icon: <Users />,
      trend: { value: leads.length > 0 ? Math.round((activeLeads/leads.length) * 100) : 0, positive: true },
    },
    {
      title: "Revenue",
      value: `$${totalRevenue.toLocaleString()}`,
      icon: <DollarSign />,
      trend: { value: 5, positive: true },
    },
    {
      title: "Conversion Rate",
      value: `${conversionRate}%`,
      icon: <TrendingUp />,
      trend: { value: 1.2, positive: true },
    },
  ];

  // Prepare projects for display in ProjectsOverview
  const projectsForDisplay = projects
    .filter(p => p.status !== 'completed')
    .slice(0, 4)
    .map(p => ({
      id: p.id,
      name: p.name,
      client: p.client,
      progress: p.progress || 0,
      status: p.status as "new" | "in-progress" | "review" | "approved" | "completed" | "on-hold",
      dueDate: p.dueDate,
    }));

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <BusinessOverview />

        <div className="grid gap-6 md:grid-cols-2">
          <ProjectsOverview projects={projectsForDisplay} />
          <RecentActivity activities={activities} />
        </div>

        <TeamPerformance />
      </div>
    </MainLayout>
  );
};

export default Dashboard;

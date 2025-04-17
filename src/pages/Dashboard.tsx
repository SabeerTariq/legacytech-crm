
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ProjectsOverview from "@/components/dashboard/ProjectsOverview";
import { AreaChart, BarChart, Calendar, DollarSign, Users, Zap, Mail, MessageSquare, TrendingUp } from "lucide-react";
import MarketingMetrics from "@/components/dashboard/MarketingMetrics";
import CampaignPerformance from "@/components/dashboard/CampaignPerformance";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import TeamPerformance from "@/components/dashboard/TeamPerformance";

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
  const totalRevenue = convertedLeads.reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
  
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

  // We'll keep the marketing stats fixed for now
  const marketingStats = [
    {
      title: "Email Opens",
      value: "68%",
      icon: <Mail />,
      trend: { value: 4, positive: true },
    },
    {
      title: "SMS Delivery",
      value: "98%",
      icon: <MessageSquare />,
      trend: { value: 2, positive: true },
    },
    {
      title: "Automations",
      value: "12",
      icon: <Zap />,
      trend: { value: 3, positive: true },
    },
    {
      title: "Tasks Due",
      value: "18",
      icon: <Calendar />,
      trend: { value: 2, positive: false },
    },
  ];

  // Fetch activities data (for now we'll use the mock data)
  const activities = [
    {
      id: "1",
      user: { name: "Alex Johnson", initials: "AJ" },
      action: "completed task",
      target: "Homepage Design",
      time: "5 minutes ago",
    },
    {
      id: "2",
      user: { name: "Maria Garcia", initials: "MG" },
      action: "added a comment to",
      target: "E-commerce Website",
      time: "10 minutes ago",
    },
    {
      id: "3",
      user: { name: "James Smith", initials: "JS" },
      action: "assigned task to",
      target: "Sarah Wilson",
      time: "30 minutes ago",
    },
    {
      id: "4",
      user: { name: "Sarah Wilson", initials: "SW" },
      action: "created a new project",
      target: "Branding for XYZ",
      time: "1 hour ago",
    },
    {
      id: "5",
      user: { name: "David Lee", initials: "DL" },
      action: "uploaded",
      target: "SEO Report for Client",
      time: "2 hours ago",
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
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <StatCard
              key={i}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </div>

        <TeamPerformance />
        
        <div className="grid gap-6 md:grid-cols-2">
          <MarketingMetrics />
          <CampaignPerformance />
        </div>

        <h2 className="text-2xl font-semibold mt-8">Marketing Overview</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {marketingStats.map((stat, i) => (
            <StatCard
              key={`marketing-${i}`}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              trend={stat.trend}
            />
          ))}
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <RecentActivity activities={activities} />
          <ProjectsOverview projects={projectsForDisplay} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

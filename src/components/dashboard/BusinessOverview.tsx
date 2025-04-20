import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface BusinessOverviewProps {
  selectedMonth: number;
}

const BusinessOverview = ({ selectedMonth }: BusinessOverviewProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch leads data
  const { data: leads = [] } = useQuery({
    queryKey: ['dashboard-leads', selectedMonth],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('leads')
        .select('id, status, date, created_at')
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

  // Fetch projects data
  const { data: projects = [] } = useQuery({
    queryKey: ['dashboard-projects', selectedMonth],
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
      
      return data;
    },
    enabled: !!user,
  });

  // Process project data for the chart
  const currentDate = new Date();
  const targetDate = subMonths(currentDate, selectedMonth);
  const startDate = startOfMonth(targetDate);
  const endDate = endOfMonth(targetDate);

  const monthProjects = React.useMemo(() => {
    return projects.filter(project => {
      const projectDate = new Date(project.due_date);
      return projectDate >= startDate && projectDate <= endDate;
    });
  }, [projects, startDate, endDate]);

  const projectStatusData = [
    { name: "To Do", value: monthProjects.filter(p => p.status === 'new' || p.status === 'not-started' || p.status === 'todo').length },
    { name: "In Progress", value: monthProjects.filter(p => p.status === 'in-progress').length },
    { name: "Completed", value: monthProjects.filter(p => p.status === 'completed').length },
  ];

  // Process leads data for the chart
  const targetMonth = targetDate.getMonth();
  const targetYear = targetDate.getFullYear();

  console.log('Filtering leads for:', {
    targetMonth,
    targetYear,
    totalLeads: leads.length,
    selectedMonth
  });

  const monthLeads = leads.filter(lead => {
    const leadDate = new Date(lead.date || lead.created_at);
    const leadMonth = leadDate.getMonth();
    const leadYear = leadDate.getFullYear();
    const isInTargetMonth = leadMonth === targetMonth && leadYear === targetYear;
    
    console.log('Lead date check:', {
      leadDate,
      leadMonth,
      leadYear,
      isInTargetMonth,
      leadStatus: lead.status
    });
    
    return isInTargetMonth;
  });

  console.log('Filtered leads:', {
    monthLeads: monthLeads.length,
    leadStatuses: monthLeads.map(lead => lead.status)
  });

  const leadStatusData = [
    { name: "Total Leads", value: monthLeads.length },
    { name: "New", value: monthLeads.filter(lead => lead.status === "new").length },
    { name: "Contacted", value: monthLeads.filter(lead => lead.status === "contacted").length },
    { name: "Won", value: monthLeads.filter(lead => lead.status === "won").length },
    { name: "Lost", value: monthLeads.filter(lead => lead.status === "lost").length },
  ];

  console.log('BusinessOverview - Lead Status Calculation:', {
    totalMonthLeads: monthLeads.length,
    wonLeads: leadStatusData.find(stat => stat.name === "Won")?.value,
    month: targetDate.toLocaleString('default', { month: 'long' }),
    year: targetDate.getFullYear(),
    leadStatuses: monthLeads.map(lead => lead.status)
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  try {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {projectStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={leadStatusData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Error rendering charts:", error);
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Skeleton className="h-full w-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Status Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <Skeleton className="h-full w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
};

export default BusinessOverview; 
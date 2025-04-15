
import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import RecentActivity from "@/components/dashboard/RecentActivity";
import ProjectsOverview from "@/components/dashboard/ProjectsOverview";
import { AreaChart, BarChart, Calendar, DollarSign, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Dashboard = () => {
  // Mock data for dashboard components
  const stats = [
    {
      title: "Total Projects",
      value: "24",
      icon: <BarChart />,
      trend: { value: 12, positive: true },
    },
    {
      title: "Active Leads",
      value: "42",
      icon: <Users />,
      trend: { value: 8, positive: true },
    },
    {
      title: "Revenue",
      value: "$48,500",
      icon: <DollarSign />,
      trend: { value: 5, positive: true },
    },
    {
      title: "Tasks Due",
      value: "18",
      icon: <Calendar />,
      trend: { value: 2, positive: false },
    },
  ];

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

  const projects = [
    {
      id: "1",
      name: "Agency Website Redesign",
      client: "ABC Company",
      progress: 75,
      status: "in-progress" as const,
      dueDate: "Next week",
    },
    {
      id: "2",
      name: "E-commerce Platform",
      client: "XYZ Store",
      progress: 40,
      status: "in-progress" as const,
      dueDate: "In 3 weeks",
    },
    {
      id: "3",
      name: "SEO Optimization",
      client: "Local Business",
      progress: 90,
      status: "review" as const,
      dueDate: "Tomorrow",
    },
    {
      id: "4",
      name: "Social Media Campaign",
      client: "Tech Startup",
      progress: 100,
      status: "completed" as const,
      dueDate: "Completed",
    },
  ];

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
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>
                Monthly revenue for the current year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border-dashed border-2 rounded-md">
                <div className="flex flex-col items-center text-muted-foreground">
                  <AreaChart className="h-8 w-8 mb-1" />
                  <span>Revenue chart will render here</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <RecentActivity activities={activities} />
        </div>

        <ProjectsOverview projects={projects} />
      </div>
    </MainLayout>
  );
};

export default Dashboard;


import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CheckCircle, AlertTriangle } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import StatCard from "@/components/dashboard/StatCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { ProjectsOverview } from "@/components/dashboard/ProjectsOverview";
import { SalesAssistant } from "@/components/dashboard/SalesAssistant";
import CampaignPerformance from "@/components/dashboard/CampaignPerformance";
import MarketingMetrics from "@/components/dashboard/MarketingMetrics";

const Dashboard = () => {
  // Sample data for recent activities
  const recentActivities = [
    {
      id: "1",
      user: {
        name: "John Smith",
        avatar: "/assets/avatars/john-smith.jpg",
        initials: "JS",
      },
      action: "closed a deal with",
      target: "Acme Inc.",
      time: "2 hours ago",
    },
    {
      id: "2",
      user: {
        name: "Sarah Johnson",
        avatar: "/assets/avatars/sarah-johnson.jpg",
        initials: "SJ",
      },
      action: "created a new task",
      target: "Website Redesign",
      time: "3 hours ago",
    },
    {
      id: "3",
      user: {
        name: "Mike Williams",
        avatar: "/assets/avatars/mike-williams.jpg",
        initials: "MW",
      },
      action: "commented on",
      target: "Q3 Marketing Plan",
      time: "5 hours ago",
    },
    {
      id: "4",
      user: {
        name: "Lisa Chen",
        avatar: "/assets/avatars/lisa-chen.jpg",
        initials: "LC",
      },
      action: "uploaded",
      target: "Client Presentation.pdf",
      time: "1 day ago",
    },
  ];

  // Sample data for projects
  const projects = [
    {
      id: "1",
      name: "Website Redesign",
      client: "Acme Corp",
      progress: 75,
      status: "in-progress",
      dueDate: "Aug 25, 2023",
    },
    {
      id: "2",
      name: "Mobile App Development",
      client: "TechStart Inc",
      progress: 32,
      status: "new",
      dueDate: "Sep 12, 2023",
    },
    {
      id: "3",
      name: "Marketing Campaign",
      client: "Global Retailers",
      progress: 100,
      status: "completed",
      dueDate: "Jul 30, 2023",
    },
  ];

  return (
    <MainLayout>
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Revenue"
              value="$250,500"
              icon={<DollarSign className="h-4 w-4 text-gray-500" />}
              description="Over the past year"
              trend={{ value: 12, positive: true }}
            />
            <StatCard
              title="New Customers"
              value="12,245"
              icon={<Users className="h-4 w-4 text-gray-500" />}
              description="In the last month"
              trend={{ value: 8, positive: true }}
            />
            <StatCard
              title="Tasks Completed"
              value="2,345"
              icon={<CheckCircle className="h-4 w-4 text-gray-500" />}
              description="This quarter"
              trend={{ value: 5, positive: true }}
            />
            <StatCard
              title="Pending Issues"
              value="34"
              icon={<AlertTriangle className="h-4 w-4 text-gray-500" />}
              description="Critical alerts"
              trend={{ value: 3, positive: false }}
            />
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <MarketingMetrics />
            <CampaignPerformance />
          </div>
          
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
            <RecentActivity activities={recentActivities} className="lg:col-span-3" />
            <ProjectsOverview projects={projects} className="lg:col-span-3" />
            <SalesAssistant />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

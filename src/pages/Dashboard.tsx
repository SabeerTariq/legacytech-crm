
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Users, CheckCircle, AlertTriangle } from "lucide-react";
import { SalesAssistant } from "@/components/dashboard/SalesAssistant";
import MainLayout from "@/components/layout/MainLayout";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {description && <p className="text-sm text-muted-foreground">{description}</p>}
    </CardContent>
  </Card>
);

const Dashboard = () => {
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
            />
            <StatCard
              title="New Customers"
              value="12,245"
              icon={<Users className="h-4 w-4 text-gray-500" />}
              description="In the last month"
            />
            <StatCard
              title="Tasks Completed"
              value="2,345"
              icon={<CheckCircle className="h-4 w-4 text-gray-500" />}
              description="This quarter"
            />
            <StatCard
              title="Pending Issues"
              value="34"
              icon={<AlertTriangle className="h-4 w-4 text-gray-500" />}
              description="Critical alerts"
            />
          </div>
          <SalesAssistant />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;

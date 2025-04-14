
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardMetrics } from '@/components/dashboard/DashboardMetrics';
import { SalesChart } from '@/components/dashboard/SalesChart';
import { ProjectStatusChart } from '@/components/dashboard/ProjectStatusChart';
import { LeadSourceChart } from '@/components/dashboard/LeadSourceChart';
import { RecentCustomers } from '@/components/dashboard/RecentCustomers';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';



export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name}</h1>
        <p className="page-description">Here's what's happening with your business today.</p>
      </div>

      {/* Dashboard Metrics */}
      <DashboardMetrics />

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SalesChart />
        <ProjectStatusChart />
      </div>

      {/* Recent Customers and Lead Sources */}
      <div className="grid gap-6 lg:grid-cols-2">
        <RecentCustomers />
        <LeadSourceChart />
      </div>
    </div>
  );
};

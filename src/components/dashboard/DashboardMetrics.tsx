import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUpRight, DollarSign, Users, Briefcase, Clock } from 'lucide-react';
import { useCustomers, useProjects, useSales, useLeads } from '@/hooks/useQueries';
import { Spinner } from '@/components/ui/spinner';

export const DashboardMetrics = () => {
  const { 
    data: customersData, 
    isLoading: isLoadingCustomers, 
    error: customersError 
  } = useCustomers();
  
  const { 
    data: projectsData, 
    isLoading: isLoadingProjects, 
    error: projectsError 
  } = useProjects();
  
  const { 
    data: salesData, 
    isLoading: isLoadingSales, 
    error: salesError 
  } = useSales();
  
  const { 
    data: leadsData, 
    isLoading: isLoadingLeads, 
    error: leadsError 
  } = useLeads();

  const isLoading = isLoadingCustomers || isLoadingProjects || isLoadingSales || isLoadingLeads;
  const hasError = customersError || projectsError || salesError || leadsError;

  // Calculate total sales
  const calculateTotalSales = () => {
    if (!salesData?.data?.sales) return 0;
    return salesData.data.sales.reduce((total: number, sale: any) => total + (sale.grossValue || 0), 0);
  };

  // Count active customers
  const countActiveCustomers = () => {
    if (!customersData?.data?.customers) return 0;
    return customersData.data.customers.filter((customer: any) => customer.status === 'active').length;
  };

  // Count active projects
  const countActiveProjects = () => {
    if (!projectsData?.data?.projects) return 0;
    return projectsData.data.projects.filter((project: any) => 
      project.status === 'in-progress' || project.status === 'planning'
    ).length;
  };

  // Calculate average turnaround time (in days)
  const calculateAvgTurnaround = () => {
    if (!projectsData?.data?.projects) return 0;
    
    const completedProjects = projectsData.data.projects.filter(
      (project: any) => project.status === 'completed' && project.completedDate && project.startDate
    );
    
    if (completedProjects.length === 0) return 0;
    
    const totalDays = completedProjects.reduce((total: number, project: any) => {
      const startDate = new Date(project.startDate);
      const completedDate = new Date(project.completedDate);
      const days = Math.floor((completedDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return total + days;
    }, 0);
    
    return Math.round(totalDays / completedProjects.length);
  };

  if (isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6 flex items-center justify-center">
              <Spinner size="md" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="grid gap-6 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-destructive">
            <CardContent className="p-6">
              <p className="text-destructive text-sm">Error loading data</p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalSales = calculateTotalSales();
  const activeCustomers = countActiveCustomers();
  const activeProjects = countActiveProjects();
  const avgTurnaround = calculateAvgTurnaround();

  return (
    <div className="grid gap-6 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sales</p>
              <h3 className="text-2xl font-bold">${totalSales.toLocaleString()}</h3>
              <p className="text-xs font-medium text-green-500 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> Updated just now
              </p>
            </div>
            <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
              <h3 className="text-2xl font-bold">{activeCustomers}</h3>
              <p className="text-xs font-medium text-green-500 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> Updated just now
              </p>
            </div>
            <div className="h-12 w-12 rounded-md bg-brand-blue/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-brand-blue" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Projects</p>
              <h3 className="text-2xl font-bold">{activeProjects}</h3>
              <p className="text-xs font-medium text-green-500 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> Updated just now
              </p>
            </div>
            <div className="h-12 w-12 rounded-md bg-brand-teal/10 flex items-center justify-center">
              <Briefcase className="h-6 w-6 text-brand-teal" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Turnaround</p>
              <h3 className="text-2xl font-bold">{avgTurnaround} days</h3>
              <p className="text-xs font-medium text-green-500 flex items-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> Based on completed projects
              </p>
            </div>
            <div className="h-12 w-12 rounded-md bg-brand-orange/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-brand-orange" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

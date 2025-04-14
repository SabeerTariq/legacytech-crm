import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { useProjects } from '@/hooks/useQueries';
import { Spinner } from '@/components/ui/spinner';

const COLORS = ['#319795', '#3182CE', '#DD6B20', '#38A169', '#E53E3E'];

export const ProjectStatusChart = () => {
  const { data, isLoading, error } = useProjects();

  // Process project data to group by status
  const projectsByStatus = useMemo(() => {
    if (!data?.data?.projects) return [];

    const statusCounts: Record<string, number> = {
      'planning': 0,
      'in-progress': 0,
      'on-hold': 0,
      'completed': 0,
      'cancelled': 0,
    };

    data.data.projects.forEach((project: any) => {
      if (statusCounts[project.status] !== undefined) {
        statusCounts[project.status]++;
      }
    });

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
      value: count,
    })).filter(item => item.value > 0);
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Status</CardTitle>
          <CardDescription>Distribution of projects by status</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <Spinner size="lg" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Status</CardTitle>
          <CardDescription>Distribution of projects by status</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="flex items-center justify-center h-full">
            <p className="text-destructive">Error loading project data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project Status</CardTitle>
        <CardDescription>Distribution of projects by status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {projectsByStatus.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No project data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {projectsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Projects']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

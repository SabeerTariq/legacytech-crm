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
import { useLeads } from '@/hooks/useQueries';
import { Spinner } from '@/components/ui/spinner';

const COLORS = ['#3182CE', '#319795', '#DD6B20', '#38A169', '#E53E3E', '#805AD5'];

export const LeadSourceChart = () => {
  const { data, isLoading, error } = useLeads();

  // Process lead data to group by source
  const leadsBySource = useMemo(() => {
    if (!data?.data?.leads) return [];

    const sourceCounts: Record<string, number> = {};

    data.data.leads.forEach((lead: any) => {
      if (!sourceCounts[lead.source]) {
        sourceCounts[lead.source] = 0;
      }
      sourceCounts[lead.source]++;
    });

    return Object.entries(sourceCounts)
      .map(([source, count]) => ({
        name: source,
        value: count,
      }))
      .sort((a, b) => b.value - a.value);
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lead Sources</CardTitle>
          <CardDescription>Distribution of leads by source</CardDescription>
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
          <CardTitle>Lead Sources</CardTitle>
          <CardDescription>Distribution of leads by source</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="flex items-center justify-center h-full">
            <p className="text-destructive">Error loading lead data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lead Sources</CardTitle>
        <CardDescription>Distribution of leads by source</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          {leadsBySource.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No lead data available</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadsBySource}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {leadsBySource.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, 'Leads']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useSales } from '@/hooks/useQueries';
import { Spinner } from '@/components/ui/spinner';
import { format, subMonths } from 'date-fns';

export const SalesChart = () => {
  const { data, isLoading, error } = useSales();

  // Process sales data to group by month
  const salesByMonth = useMemo(() => {
    if (!data?.data?.sales) return [];

    // Get the last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(new Date(), i);
      return {
        month: format(date, 'MMM'),
        monthYear: format(date, 'MMM yyyy'),
        amount: 0,
      };
    }).reverse();

    // Group sales by month
    data.data.sales.forEach((sale: any) => {
      const saleDate = new Date(sale.date);
      const saleMonth = format(saleDate, 'MMM');
      const saleMonthYear = format(saleDate, 'MMM yyyy');
      
      const monthIndex = months.findIndex(m => m.monthYear === saleMonthYear);
      if (monthIndex !== -1) {
        months[monthIndex].amount += sale.grossValue || 0;
      }
    });

    return months;
  }, [data]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Sales</CardTitle>
          <CardDescription>Sales performance over the last 6 months</CardDescription>
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
          <CardTitle>Monthly Sales</CardTitle>
          <CardDescription>Sales performance over the last 6 months</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          <div className="flex items-center justify-center h-full">
            <p className="text-destructive">Error loading sales data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Sales</CardTitle>
        <CardDescription>Sales performance over the last 6 months</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesByMonth} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip
                formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                contentStyle={{ backgroundColor: 'white', borderRadius: '8px' }}
              />
              <Bar dataKey="amount" fill="#319795" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

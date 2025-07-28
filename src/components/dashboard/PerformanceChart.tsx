import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { MonthlyPerformanceData } from '../../types/frontSeller';

interface PerformanceChartProps {
  data: MonthlyPerformanceData[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  const chartData = data.map(item => ({
    month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
    accounts: item.accounts_achieved,
    gross: Math.round(item.total_gross),
    cashIn: Math.round(item.total_cash_in),
    remaining: Math.round(item.total_remaining)
  })).reverse();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === 'accounts' ? value : `$${value.toLocaleString()}`,
                  name === 'accounts' ? 'Accounts' : 
                  name === 'gross' ? 'Gross' :
                  name === 'cashIn' ? 'Cash In' : 'Remaining'
                ]}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Bar 
                dataKey="gross" 
                fill="#3b82f6" 
                radius={[4, 4, 0, 0]}
                name="Gross"
              />
              <Bar 
                dataKey="cashIn" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]}
                name="Cash In"
              />
              <Bar 
                dataKey="remaining" 
                fill="#f59e0b" 
                radius={[4, 4, 0, 0]}
                name="Remaining"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex justify-center space-x-6 mt-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-sm text-muted-foreground">Gross</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-sm text-muted-foreground">Cash In</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span className="text-sm text-muted-foreground">Remaining</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 
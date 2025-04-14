
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { DollarSign, TrendingUp, Target, Users } from 'lucide-react';

// Mock data for dashboard
const frontSellerData = [
  { name: 'Admin User', sales: 15, value: 45000, target: 50000 },
  { name: 'Sales Rep', sales: 22, value: 62000, target: 60000 },
  { name: 'John Doe', sales: 10, value: 28000, target: 40000 },
  { name: 'Jane Smith', sales: 18, value: 52000, target: 50000 },
];

const recurringData = [
  { month: 'Jan', revenue: 8000 },
  { month: 'Feb', revenue: 9200 },
  { month: 'Mar', revenue: 9800 },
  { month: 'Apr', revenue: 10500 },
  { month: 'May', revenue: 11000 },
  { month: 'Jun', revenue: 12500 },
];

const servicePerformanceData = [
  { name: 'Website Design', value: 35, color: '#319795' },
  { name: 'Mobile Apps', value: 20, color: '#3182CE' },
  { name: 'SEO Services', value: 15, color: '#805AD5' },
  { name: 'Social Media', value: 18, color: '#F6AD55' },
  { name: 'Content Creation', value: 12, color: '#E53E3E' },
];

export const PerformancePage = () => {
  return (
    <div className="space-y-6">
      <div className="page-header">
        <h1 className="page-title">Performance Analytics</h1>
        <p className="page-description">Track sales, revenue, and team performance</p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sales (YTD)</p>
                <h3 className="text-2xl font-bold">$187,000</h3>
                <p className="text-xs font-medium text-green-500 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" /> 15% from last year
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
                <p className="text-sm font-medium text-muted-foreground">Target Achievement</p>
                <h3 className="text-2xl font-bold">78%</h3>
                <p className="text-xs font-medium text-yellow-500 flex items-center mt-1">
                  <Target className="h-3 w-3 mr-1" /> 22% to goal
                </p>
              </div>
              <div className="h-12 w-12 rounded-md bg-brand-teal/10 flex items-center justify-center">
                <Target className="h-6 w-6 text-brand-teal" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Team Performance</p>
                <h3 className="text-2xl font-bold">93%</h3>
                <p className="text-xs font-medium text-green-500 flex items-center mt-1">
                  <Users className="h-3 w-3 mr-1" /> 5% above average
                </p>
              </div>
              <div className="h-12 w-12 rounded-md bg-brand-blue/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-brand-blue" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="frontSeller">
        <TabsList>
          <TabsTrigger value="frontSeller">Front Seller</TabsTrigger>
          <TabsTrigger value="recurring">Recurring Revenue</TabsTrigger>
          <TabsTrigger value="upseller">Upseller</TabsTrigger>
        </TabsList>
        
        <TabsContent value="frontSeller" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Front Seller Performance</CardTitle>
              <CardDescription>Sales performance by team member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={frontSellerData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" stroke="#319795" />
                    <YAxis yAxisId="right" orientation="right" stroke="#F6AD55" />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="value" name="Sales Value ($)" fill="#319795" radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="target" name="Target ($)" fill="#F6AD55" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales Count</CardTitle>
                <CardDescription>Number of sales by team member</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={frontSellerData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="sales" name="Number of Sales" fill="#3182CE" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Services Breakdown</CardTitle>
                <CardDescription>Sales by service category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <Pie
                        data={servicePerformanceData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {servicePerformanceData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="recurring" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recurring Revenue</CardTitle>
              <CardDescription>Monthly recurring revenue trend</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={recurringData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`$${value}`, 'Revenue']}/>
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Monthly Revenue"
                      stroke="#319795" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Retention</CardTitle>
                <CardDescription>Retention rate by month</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-12 text-muted-foreground">
                  Coming soon: Customer retention analytics
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Service Renewals</CardTitle>
                <CardDescription>Renewal rate by service</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-12 text-muted-foreground">
                  Coming soon: Service renewal analytics
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="upseller" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Upseller Performance</CardTitle>
              <CardDescription>Upselling effectiveness by team member</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-muted-foreground">
                Coming soon: Upseller performance analytics
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

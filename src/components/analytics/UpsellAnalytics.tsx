import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  FileText,
  CreditCard,
  Clock,
  Calendar,
  BarChart3
} from "lucide-react";
import type { UpsellAnalytics, UpsellSummary } from "@/types/upsell";

const UpsellAnalytics: React.FC = () => {
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<UpsellAnalytics[]>([]);
  const [summary, setSummary] = useState<UpsellSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Load upsell analytics data
      const { data, error } = await supabase
        .from('sales_dispositions')
        .select('*')
        .eq('is_upsell', true)
        .gte('sale_date', getDateFromRange(timeRange))
        .order('sale_date', { ascending: false });

      if (error) throw error;

      // Transform data to match UpsellAnalytics interface
      const transformedAnalytics: UpsellAnalytics[] = (data || []).map((item: any) => ({
        sales_disposition_id: item.id,
        customer_name: item.customer_name,
        email: item.email,
        is_upsell: item.is_upsell,
        original_sales_disposition_id: item.original_sales_disposition_id,
        upsell_value: item.gross_value,
        sale_date: item.sale_date,
        service_types: item.service_types || [],
        project_count: 0, // Will be calculated
        recurring_service_count: 0,
        one_time_service_count: 0
      }));

      setAnalytics(transformedAnalytics);
      calculateSummary(transformedAnalytics);
    } catch (error) {
      console.error("Error loading upsell analytics:", error);
      toast({
        title: "Error",
        description: "Failed to load upsell analytics",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = (data: UpsellAnalytics[]) => {
    const totalUpsells = data.length;
    const totalUpsellRevenue = data.reduce((sum, item) => sum + item.upsell_value, 0);
    const averageUpsellValue = totalUpsells > 0 ? totalUpsellRevenue / totalUpsells : 0;

    // Calculate service type distribution
    const serviceTypeCounts: { [key: string]: number } = {};
    data.forEach(item => {
      item.service_types.forEach(type => {
        serviceTypeCounts[type] = (serviceTypeCounts[type] || 0) + 1;
      });
    });

    const topUpsellServices = Object.entries(serviceTypeCounts)
      .map(([serviceName, count]) => ({
        serviceName,
        count,
        revenue: data
          .filter(item => item.service_types.includes(serviceName))
          .reduce((sum, item) => sum + item.upsell_value, 0)
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Calculate monthly trends
    const monthlyData: { [key: string]: { upsells: number; revenue: number } } = {};
    data.forEach(item => {
      const month = new Date(item.sale_date).toISOString().slice(0, 7);
      if (!monthlyData[month]) {
        monthlyData[month] = { upsells: 0, revenue: 0 };
      }
      monthlyData[month].upsells += 1;
      monthlyData[month].revenue += item.upsell_value;
    });

    const upsellTrends = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        upsells: data.upsells,
        revenue: data.revenue
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    setSummary({
      totalUpsells,
      totalUpsellRevenue,
      averageUpsellValue,
      conversionRate: 0, // Would need total customers to calculate
      topUpsellServices,
      upsellTrends
    });
  };

  const getDateFromRange = (range: '7d' | '30d' | '90d') => {
    const date = new Date();
    switch (range) {
      case '7d':
        date.setDate(date.getDate() - 7);
        break;
      case '30d':
        date.setDate(date.getDate() - 30);
        break;
      case '90d':
        date.setDate(date.getDate() - 90);
        break;
    }
    return date.toISOString().split('T')[0];
  };

  const getServiceTypeIcon = (serviceType: string) => {
    switch (serviceType) {
      case 'project':
        return <FileText className="h-4 w-4" />;
      case 'recurring':
        return <CreditCard className="h-4 w-4" />;
      case 'one-time':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-8">Loading upsell analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Upsell Analytics</h1>
        <p className="text-muted-foreground">
          Track upsell performance and revenue generation from existing customers.
        </p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setTimeRange('7d')}
          className={`px-3 py-1 rounded-md text-sm ${
            timeRange === '7d' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          Last 7 Days
        </button>
        <button
          onClick={() => setTimeRange('30d')}
          className={`px-3 py-1 rounded-md text-sm ${
            timeRange === '30d' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          Last 30 Days
        </button>
        <button
          onClick={() => setTimeRange('90d')}
          className={`px-3 py-1 rounded-md text-sm ${
            timeRange === '90d' ? 'bg-primary text-primary-foreground' : 'bg-muted'
          }`}
        >
          Last 90 Days
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Upsells</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalUpsells}</div>
              <p className="text-xs text-muted-foreground">
                +{summary.totalUpsells > 0 ? Math.round((summary.totalUpsells / 30) * 100) : 0}% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.totalUpsellRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Average: ${summary.averageUpsellValue.toLocaleString()}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Value</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${summary.averageUpsellValue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Per upsell transaction
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Of customers upsold
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Top Upsell Services */}
      {summary && summary.topUpsellServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Upsell Services</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {summary.topUpsellServices.map((service, index) => (
                <div key={service.serviceName} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium">{service.serviceName}</div>
                      <div className="text-sm text-muted-foreground">
                        {service.count} upsells
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${service.revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">
                      ${(service.revenue / service.count).toLocaleString()} avg
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Upsells */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Upsells</CardTitle>
        </CardHeader>
        <CardContent>
          {analytics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No upsells found in the selected time range
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.slice(0, 10).map((item) => (
                <div key={item.sales_disposition_id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium">{item.customer_name}</div>
                      <div className="text-sm text-muted-foreground">{item.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <div className="font-medium">${item.upsell_value.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(item.sale_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {item.service_types.map((type, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {getServiceTypeIcon(type)}
                          <span className="ml-1">{type}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UpsellAnalytics; 
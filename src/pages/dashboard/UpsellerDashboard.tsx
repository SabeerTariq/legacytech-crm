import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Target, Calendar, TrendingUp, Users, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import { useUpsellerPerformance } from '../../hooks/useUpsellerPerformance';
import { Skeleton } from '../../components/ui/skeleton';

const UpsellerDashboardContent: React.FC = () => {
  const { dashboardData, loading, error, isUpsellerEmployee, refreshData } = useUpsellerPerformance();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshData();
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 30 seconds to ensure data is current
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        refreshData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loading, refreshData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Upseller Dashboard</h1>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={refreshData} disabled={loading}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">No Data Available</h2>
        <p className="text-muted-foreground mb-4">No performance data found for your account.</p>
        <Button onClick={refreshData} disabled={loading}>
          Refresh Data
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatMonth = (dateString: string | undefined) => {
    if (!dateString) return 'Unknown Month';
    
    try {
      // Handle different date formats
      let date: Date;
      
      // If it's already a valid date string, use it directly
      if (dateString.includes('-')) {
        date = new Date(dateString);
      } else {
        // Try to parse other formats
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string:', dateString);
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    } catch (error) {
      console.error('Error formatting date:', dateString, error);
      return 'Invalid Date';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Upseller Dashboard</h1>
          <p className="text-muted-foreground">
            Track your performance and compare with your team
          </p>
        </div>
        <div className="flex items-center space-x-2">
           <Button 
             onClick={handleRefresh} 
             variant="outline" 
             disabled={isRefreshing}
             className="flex items-center space-x-2"
           >
             <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
             <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
           </Button>
         </div>
      </div>

      {/* This Month Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <span>This Month Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Target Cash In | Cash In Achieved | Cash In Remaining */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Cash In Targets</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Target Cash In</span>
                  <span className="font-bold text-blue-600">{formatCurrency(dashboardData.currentMonth?.totalTarget || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Target Achieved</span>
                  <span className="font-bold text-green-600">{formatCurrency(dashboardData.currentMonth?.totalCashIn || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                  <span className="font-medium">Target Remaining</span>
                  <span className="font-bold text-red-600">{formatCurrency((dashboardData.currentMonth?.totalTarget || 0) - (dashboardData.currentMonth?.totalCashIn || 0))}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium">Receivable (All Assigned Customers)</span>
                  <span className="font-bold text-orange-600">{formatCurrency(dashboardData.currentMonth?.receivable || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                  <span className="font-medium">Accounts/Customers Assigned</span>
                  <span className="font-bold text-indigo-600">{dashboardData.currentMonth?.accountsAssigned || 0}</span>
                </div>
              </div>
            </div>

            {/* Total Gross | Total Cash In | Total Remaining */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Financial</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Total Gross</span>
                  <span className="font-bold text-blue-600">{formatCurrency(dashboardData.currentMonth?.totalGross || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Total Cash In</span>
                  <span className="font-bold text-green-600">{formatCurrency(dashboardData.currentMonth?.totalCashIn || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium">Total Remaining</span>
                  <span className="font-bold text-orange-600">{formatCurrency(dashboardData.currentMonth?.totalRemaining || 0)}</span>
                </div>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Progress</h3>
              <div className="space-y-3">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData.currentMonth?.totalTarget > 0 
                      ? (((dashboardData.currentMonth?.totalCashIn || 0) / dashboardData.currentMonth?.totalTarget) * 100).toFixed(1)
                      : '0.0'
                    }%
                  </div>
                  <div className="text-sm text-muted-foreground">Target Completion</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    #{dashboardData.personalRank || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground">Team Rank</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <span>Previous Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            
            {dashboardData.previousMonths && dashboardData.previousMonths.length > 0 ? (
              dashboardData.previousMonths.map((month, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="font-semibold text-lg mb-3">
                    {month.month ? formatMonth(month.month) : 'Unknown Month'}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">Accounts Assigned</span>
                      <span className="font-bold">{month.accountsAssigned || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <span className="font-medium">Total Gross</span>
                      <span className="font-bold">{formatCurrency(month.totalGross || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="font-medium">Total Cash In</span>
                      <span className="font-bold">{formatCurrency(month.totalCashIn || 0)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                      <span className="font-medium">Target Completion</span>
                      <span className="font-bold">
                        {month.totalTarget > 0 
                          ? `${((month.targetAchieved / month.totalTarget) * 100).toFixed(1)}%`
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No previous performance data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span>Team Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Team Financial */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Team Financial</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Total Target</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(dashboardData.teamPerformance?.reduce((sum, member) => sum + (member.total_target || 0), 0) || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Achieved Target</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(dashboardData.teamPerformance?.reduce((sum, member) => sum + (member.achieved_target || 0), 0) || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium">Remaining Target</span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(dashboardData.teamPerformance?.reduce((sum, member) => sum + (member.remaining_target || 0), 0) || 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Ranking */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Your Ranking</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Current Rank</span>
                  <span className="font-bold text-purple-600">
                    #{dashboardData.personalRank || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                  <span className="font-medium">Team Size</span>
                  <span className="font-bold text-indigo-600">
                    {dashboardData.teamPerformance?.length || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Members */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Team Members</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {dashboardData.teamPerformance && dashboardData.teamPerformance.length > 0 ? (
                  dashboardData.teamPerformance.map((member, index) => (
                    <div key={member.seller_id} className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                      <span className="font-medium truncate">
                        {member.seller_name || `Member ${index + 1}`}
                      </span>
                      <div className="flex items-center space-x-4">
                        <span className="font-bold text-blue-600">
                          {formatCurrency(member.total_target || 0)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {member.accounts_assigned || 0} accounts
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    No team data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Performance */}
      {dashboardData.teamPerformance && dashboardData.teamPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="h-5 w-5 text-indigo-600" />
              <span>Team Members Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {dashboardData.teamPerformance.map((member, index) => (
                <div key={member.seller_id} className="border rounded-lg p-4">
                  <div className="font-semibold text-lg mb-4 flex items-center justify-between">
                    <span>{member.seller_name}</span>
                    <span className="text-sm text-muted-foreground">Rank #{index + 1}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Target Section */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">TARGET</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="text-xs text-muted-foreground">Target</div>
                          <div className="font-bold text-blue-600">{formatCurrency(member.total_target || 0)}</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="text-xs text-muted-foreground">Achieved</div>
                          <div className="font-bold text-green-600">{formatCurrency(member.achieved_target || 0)}</div>
                        </div>
                        <div className="text-center p-2 bg-orange-50 rounded">
                          <div className="text-xs text-muted-foreground">Remaining</div>
                          <div className="font-bold text-orange-600">{formatCurrency(member.remaining_target || 0)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Financial Section */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">FINANCIAL</h4>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="text-xs text-muted-foreground">Target</div>
                          <div className="font-bold text-blue-600">{formatCurrency(member.total_target || 0)}</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="text-xs text-muted-foreground">Achieved</div>
                          <div className="font-bold text-green-600">{formatCurrency(member.achieved_target || 0)}</div>
                        </div>
                        <div className="text-center p-2 bg-red-50 rounded">
                          <div className="text-xs text-muted-foreground">Receivable</div>
                          <div className="font-bold text-red-600">{formatCurrency(member.receivable || 0)}</div>
                        </div>
                      </div>
                    </div>

                    {/* Total Remaining Section */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">TOTAL REMAINING</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="text-xs text-muted-foreground">Upsell + Receivable</div>
                          <div className="font-bold text-purple-600">{formatCurrency((member.remaining_target || 0) + (member.receivable || 0))}</div>
                        </div>
                      </div>
                    </div>

                    {/* Accounts Section */}
                    <div className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground">ACCOUNTS</h4>
                      <div className="grid grid-cols-1 gap-2">
                        <div className="text-center p-2 bg-indigo-50 rounded">
                          <div className="text-xs text-muted-foreground">Accounts Assigned</div>
                          <div className="font-bold text-indigo-600">{member.accounts_assigned || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const UpsellerDashboard: React.FC = () => {
  return <UpsellerDashboardContent />;
};

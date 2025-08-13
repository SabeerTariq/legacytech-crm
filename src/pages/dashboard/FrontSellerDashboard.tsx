import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { RefreshCw, Target, Calendar, TrendingUp, Users, DollarSign, AlertCircle } from 'lucide-react';
import { useFrontSellerPerformance } from '../../hooks/useFrontSellerPerformance';
import { Skeleton } from '../../components/ui/skeleton';
// Authentication removed - no user context needed

const FrontSellerDashboardContent: React.FC = () => {
  const { dashboardData, loading, error, isFrontSalesEmployee, refreshData, updateTarget } = useFrontSellerPerformance();
  const { toast } = useToast();
  const [isTargetDialogOpen, setIsTargetDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [targetData, setTargetData] = useState({
    targetAccounts: 0,
    targetGross: 0,
    targetCashIn: 0
  });

  const handleUpdateTarget = async () => {
    try {
      await updateTarget({
        target_accounts: targetData.targetAccounts,
        target_gross: targetData.targetGross,
        target_cash_in: targetData.targetCashIn
      });
      
      toast({
        title: "Target Updated",
        description: "Your monthly targets have been updated successfully.",
      });
      
      setIsTargetDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update targets. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshData();
      toast({
        title: "Data Refreshed",
        description: "Dashboard data has been updated with the latest information.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Auto-refresh every 30 seconds to ensure data is current
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading && !isRefreshing) {
        refreshData();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [loading, isRefreshing, refreshData]);

  // Permission check removed - all authenticated users can access

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Front Seller Dashboard</h1>
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
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              'Try Again'
            )}
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
        <Button onClick={handleRefresh} disabled={isRefreshing}>
          {isRefreshing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            'Refresh Data'
          )}
        </Button>
      </div>
    );
  }

  const formatCurrency = (amount: number | undefined | null) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '$0';
    }
    return `$${amount.toLocaleString()}`;
  };
  const formatMonth = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Front Seller Dashboard</h1>
          <p className="text-muted-foreground">
            Track your performance and compare with your team
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Dialog open={isTargetDialogOpen} onOpenChange={setIsTargetDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center space-x-2">
                <Target className="h-4 w-4" />
                <span>Set Targets</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Set Monthly Targets</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="targetAccounts">Target Accounts</Label>
                  <Input
                    id="targetAccounts"
                    type="number"
                    value={targetData.targetAccounts}
                    onChange={(e) => setTargetData(prev => ({ ...prev, targetAccounts: parseInt(e.target.value) || 0 }))}
                    placeholder="Enter target number of accounts"
                  />
                </div>
                <div>
                  <Label htmlFor="targetGross">Target Gross ($)</Label>
                  <Input
                    id="targetGross"
                    type="number"
                    value={targetData.targetGross}
                    onChange={(e) => setTargetData(prev => ({ ...prev, targetGross: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter target gross amount"
                  />
                </div>
                <div>
                  <Label htmlFor="targetCashIn">Target Cash In ($)</Label>
                  <Input
                    id="targetCashIn"
                    type="number"
                    value={targetData.targetCashIn}
                    onChange={(e) => setTargetData(prev => ({ ...prev, targetCashIn: parseFloat(e.target.value) || 0 }))}
                    placeholder="Enter target cash in amount"
                  />
                </div>
                <Button onClick={handleUpdateTarget} className="w-full">
                  Update Targets
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
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
            <Calendar className="h-5 w-5 text-blue-600" />
            <span>This Month Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Target Account | Accounts Achieved | Accounts Remaining */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Accounts</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Target Accounts</span>
                  <span className="font-bold text-blue-600">{dashboardData.currentMonth.targetAccounts}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Accounts Achieved</span>
                  <span className="font-bold text-green-600">{dashboardData.currentMonth.accountsAchieved}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium">Accounts Remaining</span>
                  <span className="font-bold text-orange-600">{dashboardData.currentMonth.accountsRemaining}</span>
                </div>
              </div>
            </div>

            {/* Total Gross | Total Cash In | Total Remaining */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Financial</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Total Gross</span>
                  <span className="font-bold text-blue-600">{formatCurrency(dashboardData.currentMonth.totalGross)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Total Cash In</span>
                  <span className="font-bold text-green-600">{formatCurrency(dashboardData.currentMonth.totalCashIn)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium">Total Remaining</span>
                  <span className="font-bold text-orange-600">{formatCurrency(dashboardData.currentMonth.totalRemaining)}</span>
                </div>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Progress</h3>
              <div className="space-y-3">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData.currentMonth.targetAccounts > 0 
                      ? ((dashboardData.currentMonth.accountsAchieved / dashboardData.currentMonth.targetAccounts) * 100).toFixed(1)
                      : '0.0'
                    }%
                  </div>
                  <div className="text-sm text-muted-foreground">Target Completion</div>
                </div>
                <div className="text-center p-4 bg-indigo-50 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    #{dashboardData.personalRank}
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
            {dashboardData.previousMonths.length > 0 ? (
              dashboardData.previousMonths.map((month, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <div className="font-semibold text-lg mb-3">
                    [{formatMonth(month.month)}]
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="font-medium">Accounts Achieved</span>
                      <span className="font-bold">{month.accounts_achieved}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                      <span className="font-medium">Total Gross</span>
                      <span className="font-bold">{formatCurrency(month.total_gross)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                      <span className="font-medium">Total Cash In</span>
                      <span className="font-bold">{formatCurrency(month.total_cash_in)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-purple-50 rounded">
                      <span className="font-medium">Target Completion</span>
                      <span className="font-bold">
                        {month.target_accounts > 0 
                          ? `${((month.accounts_achieved / month.target_accounts) * 100).toFixed(1)}%`
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
            {/* Team Accounts */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Team Accounts</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">Target Accounts</span>
                  <span className="font-bold text-blue-600">
                    {dashboardData.teamPerformance.reduce((sum, member) => sum + (member.target_accounts || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Accounts Achieved</span>
                  <span className="font-bold text-green-600">
                    {dashboardData.teamPerformance.reduce((sum, member) => sum + (member.accounts_achieved || 0), 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium">Accounts Remaining</span>
                  <span className="font-bold text-orange-600">
                    {dashboardData.teamPerformance.reduce((sum, member) => sum + ((member.target_accounts || 0) - (member.accounts_achieved || 0)), 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Financial */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Team Financial</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="font-medium">Total Gross</span>
                  <span className="font-bold text-blue-600">
                    {formatCurrency(dashboardData.teamPerformance.reduce((sum, member) => sum + (member.total_gross || 0), 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="font-medium">Total Cash In</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(dashboardData.teamPerformance.reduce((sum, member) => sum + (member.total_cash_in || 0), 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="font-medium">Total Remaining</span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(dashboardData.teamPerformance.reduce((sum, member) => sum + (member.total_remaining || 0), 0))}
                  </span>
                </div>
              </div>
            </div>

            {/* Team Averages */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Team Averages</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="font-medium">Avg Accounts</span>
                  <span className="font-bold text-purple-600">
                    {dashboardData.teamAverage.accountsAchieved.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-indigo-50 rounded-lg">
                  <span className="font-medium">Avg Gross</span>
                  <span className="font-bold text-indigo-600">
                    {formatCurrency(dashboardData.teamAverage.totalGross)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-cyan-50 rounded-lg">
                  <span className="font-medium">Avg Cash In</span>
                  <span className="font-bold text-cyan-600">
                    {formatCurrency(dashboardData.teamAverage.totalCashIn)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Members Performance */}
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
                  <span>{member.seller_name || 'Unknown Member'}</span>
                  <span className="text-sm text-muted-foreground">Rank #{Number(member.performance_rank || 0)}</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Accounts Section */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">ACCOUNTS</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="text-xs text-muted-foreground">Target</div>
                        <div className="font-bold text-blue-600">{member.target_accounts || 0}</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-xs text-muted-foreground">Achieved</div>
                        <div className="font-bold text-green-600">{member.accounts_achieved || 0}</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="text-xs text-muted-foreground">Remaining</div>
                        <div className="font-bold text-orange-600">{(member.target_accounts || 0) - (member.accounts_achieved || 0)}</div>
                      </div>
                    </div>
                  </div>

                  {/* Financial Section */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground">FINANCIAL</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="text-xs text-muted-foreground">Gross</div>
                        <div className="font-bold text-blue-600">{formatCurrency(member.total_gross)}</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-xs text-muted-foreground">Cash In</div>
                        <div className="font-bold text-green-600">{formatCurrency(member.total_cash_in)}</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="text-xs text-muted-foreground">Remaining</div>
                        <div className="font-bold text-orange-600">{formatCurrency(member.total_remaining)}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export const FrontSellerDashboard: React.FC = () => {
  return <FrontSellerDashboardContent />;
}; 
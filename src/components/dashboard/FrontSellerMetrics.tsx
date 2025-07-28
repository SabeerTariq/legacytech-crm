import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Target, TrendingUp, DollarSign, Users, Award } from 'lucide-react';
import { PerformanceMetrics } from '../../types/frontSeller';

interface FrontSellerMetricsProps {
  metrics: PerformanceMetrics;
  onUpdateTarget?: () => void;
}

export const FrontSellerMetrics: React.FC<FrontSellerMetricsProps> = ({
  metrics,
  onUpdateTarget
}) => {
  const {
    targetAccounts,
    accountsAchieved,
    accountsRemaining,
    totalGross,
    totalCashIn,
    totalRemaining,
    conversionRate
  } = metrics;

  const progressPercentage = targetAccounts > 0 ? (accountsAchieved / targetAccounts) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Target Accounts Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Target Accounts</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{targetAccounts}</div>
          <Progress value={progressPercentage} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {accountsAchieved} achieved ({conversionRate.toFixed(1)}%)
          </p>
        </CardContent>
      </Card>

      {/* Accounts Achieved Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Accounts Achieved</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{accountsAchieved}</div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {accountsRemaining} remaining
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Total Gross Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Gross</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            ${totalGross.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            ${totalCashIn.toLocaleString()} cash in
          </p>
        </CardContent>
      </Card>

      {/* Total Remaining Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Remaining</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            ${totalRemaining.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Outstanding balance
          </p>
        </CardContent>
      </Card>
    </div>
  );
}; 
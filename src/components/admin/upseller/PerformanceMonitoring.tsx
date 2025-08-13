import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Badge } from '../../ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../ui/select';
import { 
  TrendingUp, 
  Users, 
  Award, 
  Target,
  DollarSign,
  BarChart3,
  Calendar,
  User
} from 'lucide-react';
import { 
  TeamPerformanceSummary,
  UpsellerPerformanceSummary
} from '../../../types/upsellerManagement';

interface PerformanceMonitoringProps {
  teamPerformance: TeamPerformanceSummary[];
  upsellerPerformance: UpsellerPerformanceSummary[];
  onRefresh: () => void;
}

const PerformanceMonitoring: React.FC<PerformanceMonitoringProps> = ({ 
  teamPerformance, 
  upsellerPerformance, 
  onRefresh 
}) => {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    return `${year}-${month.toString().padStart(2, '0')}-01`;
  });

  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
  };

  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    
    // Generate options for current year and next year
    for (let year = currentYear; year <= currentYear + 1; year++) {
      for (let month = 1; month <= 12; month++) {
        const monthStr = month.toString().padStart(2, '0');
        const dateStr = `${year}-${monthStr}-01`;
        const monthName = new Date(year, month - 1, 1).toLocaleDateString('en-US', { month: 'long' });
        options.push({ value: dateStr, label: `${monthName} ${year}` });
      }
    }
    return options;
  };

  const getPerformanceColor = (percentage: number) => {
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 100) return <Badge variant="default" className="bg-green-600">Exceeded</Badge>;
    if (percentage >= 80) return <Badge variant="default" className="bg-blue-600">On Track</Badge>;
    if (percentage >= 60) return <Badge variant="default" className="bg-yellow-600">Needs Attention</Badge>;
    return <Badge variant="destructive">At Risk</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Monitoring</h2>
          <p className="text-muted-foreground">
            Monitor team and individual upseller performance
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-500" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {getMonthOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={onRefresh} variant="outline">
            <TrendingUp className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-muted-foreground">Teams</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{teamPerformance.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-muted-foreground">Upsellers</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{upsellerPerformance.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-muted-foreground">Avg Performance</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">
              {upsellerPerformance.length > 0 
                ? formatPercentage(upsellerPerformance.reduce((sum, up) => sum + up.performance_percentage, 0) / upsellerPerformance.length)
                : '0%'
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-muted-foreground">Top Performer</span>
            </div>
            <div className="text-lg font-bold text-purple-600">
              {upsellerPerformance.length > 0 
                ? upsellerPerformance[0]?.employee_name || 'N/A'
                : 'N/A'
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Team Performance - {formatDate(selectedMonth)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {teamPerformance.length > 0 ? (
            <div className="space-y-4">
              {teamPerformance.map((team, index) => (
                <div key={team.team_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      #{index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium text-lg">{team.team_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {team.member_count} members
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Total Target</div>
                      <div className="font-bold text-lg">
                        {formatCurrency(team.total_target)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Achieved</div>
                      <div className="font-bold text-lg text-green-600">
                        {formatCurrency(team.achieved_target)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Remaining</div>
                      <div className="font-bold text-lg text-orange-600">
                        {formatCurrency(team.remaining_target)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-muted-foreground">Performance</div>
                      <div className={`font-bold text-lg ${getPerformanceColor(team.average_performance)}`}>
                        {formatPercentage(team.average_performance)}
                      </div>
                      {getPerformanceBadge(team.average_performance)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No team performance data available for {formatDate(selectedMonth)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Individual Upseller Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5 text-green-600" />
            <span>Individual Performance - {formatDate(selectedMonth)}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upsellerPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Rank</th>
                    <th className="text-left py-3 px-4 font-medium">Upseller</th>
                    <th className="text-left py-3 px-4 font-medium">Team</th>
                    <th className="text-center py-3 px-4 font-medium">Target Accounts</th>
                    <th className="text-center py-3 px-4 font-medium">Target Gross</th>
                    <th className="text-center py-3 px-4 font-medium">Target Cash In</th>
                    <th className="text-center py-3 px-4 font-medium">Achieved</th>
                    <th className="text-center py-3 px-4 font-medium">Performance</th>
                    <th className="text-center py-3 px-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {upsellerPerformance.map((upseller, index) => (
                    <tr key={upseller.employee_id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <Badge variant={index === 0 ? "default" : "secondary"}>
                          #{index + 1}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{upseller.employee_name}</div>
                          <div className="text-sm text-muted-foreground">
                            Rank: {upseller.rank_overall || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-sm">
                          {upseller.team_name || 'No Team'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium">{upseller.target_accounts}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium">{formatCurrency(upseller.target_gross)}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="font-medium">{formatCurrency(upseller.target_cash_in)}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div>
                          <div className="font-medium text-green-600">
                            {formatCurrency(upseller.achieved_cash_in)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {upseller.achieved_accounts} accounts
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className={`font-bold ${getPerformanceColor(upseller.performance_percentage)}`}>
                          {formatPercentage(upseller.performance_percentage)}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {getPerformanceBadge(upseller.performance_percentage)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No individual performance data available for {formatDate(selectedMonth)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-yellow-600" />
              <span>Top Performers</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upsellerPerformance.slice(0, 5).map((upseller, index) => (
              <div key={upseller.employee_id} className="flex items-center justify-between py-3 border-b last:border-b-0">
                <div className="flex items-center space-x-3">
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    #{index + 1}
                  </Badge>
                  <div>
                    <div className="font-medium">{upseller.employee_name}</div>
                    <div className="text-sm text-muted-foreground">
                      {upseller.team_name || 'No Team'}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">
                    {formatPercentage(upseller.performance_percentage)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(upseller.achieved_cash_in)}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Performance Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span>Performance Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Exceeded (100%+)', color: 'bg-green-600', count: upsellerPerformance.filter(u => u.performance_percentage >= 100).length },
                { label: 'On Track (80-99%)', color: 'bg-blue-600', count: upsellerPerformance.filter(u => u.performance_percentage >= 80 && u.performance_percentage < 100).length },
                { label: 'Needs Attention (60-79%)', color: 'bg-yellow-600', count: upsellerPerformance.filter(u => u.performance_percentage >= 60 && u.performance_percentage < 80).length },
                { label: 'At Risk (<60%)', color: 'bg-red-600', count: upsellerPerformance.filter(u => u.performance_percentage < 60).length }
              ].map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${category.color}`}></div>
                    <span className="text-sm">{category.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{category.count}</span>
                    <span className="text-sm text-muted-foreground">
                      ({upsellerPerformance.length > 0 ? ((category.count / upsellerPerformance.length) * 100).toFixed(1) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PerformanceMonitoring;

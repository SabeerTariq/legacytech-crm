import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Trophy, Users, TrendingUp, Award } from 'lucide-react';
import { TeamPerformanceSummary } from '../../types/frontSeller';

interface TeamAnalyticsProps {
  teamPerformance: TeamPerformanceSummary[];
  personalRank: number;
  teamAverage: {
    accountsAchieved: number;
    totalGross: number;
    totalCashIn: number;
  };
}

export const TeamAnalytics: React.FC<TeamAnalyticsProps> = ({
  teamPerformance,
  personalRank,
  teamAverage
}) => {
  const getRankIcon = (rank: number | string) => {
    const rankNum = Number(rank);
    switch (rankNum) {
      case 1:
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 2:
        return <Award className="h-4 w-4 text-gray-400" />;
      case 3:
        return <Award className="h-4 w-4 text-orange-500" />;
      default:
        return <span className="text-sm font-medium">{rankNum}</span>;
    }
  };

  const getRankBadgeVariant = (rank: number | string) => {
    const rankNum = Number(rank);
    switch (rankNum) {
      case 1:
        return 'default' as const;
      case 2:
        return 'secondary' as const;
      case 3:
        return 'outline' as const;
      default:
        return 'secondary' as const;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Team Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Team Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {teamPerformance.slice(0, 5).map((member, index) => (
              <div
                key={member.seller_id}
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                    {getRankIcon(member.performance_rank)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{member.seller_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {member.accounts_achieved} accounts
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    ${member.total_gross.toLocaleString()}
                  </p>
                  <Badge variant={getRankBadgeVariant(member.performance_rank)} className="text-xs">
                    Rank #{Number(member.performance_rank)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Team Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Personal Rank */}
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Your Rank</p>
                  <p className="text-sm text-muted-foreground">Among {teamPerformance.length} team members</p>
                </div>
              </div>
              <Badge variant="default" className="text-lg px-3 py-1">
                #{personalRank}
              </Badge>
            </div>

            {/* Team Averages */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Avg. Accounts</span>
                <span className="font-semibold">
                  {teamAverage.accountsAchieved.toFixed(1)}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Avg. Gross</span>
                <span className="font-semibold">
                  ${teamAverage.totalGross.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Avg. Cash In</span>
                <span className="font-semibold">
                  ${teamAverage.totalCashIn.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Team Stats */}
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Team Highlights</h4>
              <div className="space-y-2 text-sm">
                <p className="text-green-700">
                  <span className="font-medium">Top Performer:</span> {teamPerformance[0]?.seller_name || 'N/A'}
                </p>
                <p className="text-green-700">
                  <span className="font-medium">Total Team Gross:</span> ${teamPerformance.reduce((sum, m) => sum + m.total_gross, 0).toLocaleString()}
                </p>
                <p className="text-green-700">
                  <span className="font-medium">Total Team Accounts:</span> {teamPerformance.reduce((sum, m) => sum + m.accounts_achieved, 0)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 
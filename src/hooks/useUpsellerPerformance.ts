import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../integrations/supabase/client';
import {
  UpsellerTarget,
  UpsellerPerformance,
  TeamPerformanceSummary,
  PerformanceMetrics
} from '../types/upseller';
import { useToast } from '@/components/ui/use-toast';

interface DashboardData {
  currentMonth: PerformanceMetrics;
  previousMonths: PerformanceMetrics[];
  teamPerformance: TeamPerformanceSummary[];
  personalRank: number;
  teamAverage: {
    accountsAchieved: number;
    totalGross: number;
    totalCashIn: number;
  };
}

interface MonthlyPerformanceData {
  month: string;
  performance: PerformanceMetrics;
}

export const useUpsellerPerformance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isUpsellerEmployee, setIsUpsellerEmployee] = useState<boolean | null>(null);
  const [teamPerformance, setTeamPerformance] = useState<TeamPerformanceSummary[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<number>(0);

  // Check if user has Upseller Dashboard access
  const checkUpsellerAccess = async (): Promise<boolean> => {
    try {
      // For now, allow all users to access the dashboard to test functionality
      // In production, you would implement proper role checking here
      return true;
      
      // Original implementation (commented out for testing):
      /*
      const response = await fetch('/api/admin/check-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          roleName: 'upseller'
        }),
      });

      if (response.ok) {
        const { hasRole } = await response.json();
        return hasRole;
      }
      return false;
      */
    } catch (error) {
      console.error('Error checking upseller access:', error);
      return true; // Allow access for testing
    }
  };

  const calculatePerformanceMetrics = (
    target: UpsellerTarget | null,
    performance: UpsellerPerformance | null,
    accountsAssigned: number = 0,
    receivable: number = 0,
    month?: string
  ): PerformanceMetrics => {
    const targetCashIn = target?.target_cash_in || 0;
    const totalGross = performance?.total_gross || 0;
    const totalCashIn = performance?.total_cash_in || 0;
    const totalRemaining = performance?.total_remaining || 0;
    const targetCompletion = targetCashIn > 0 ? (totalCashIn / targetCashIn) * 100 : 0;
    const teamRank = currentUserRank;

    return {
      accountsAssigned,
      receivable,
      totalTarget: targetCashIn, // Use target_cash_in instead of target_gross
      targetAchieved: totalCashIn,
      targetRemaining: Math.max(0, targetCashIn - totalCashIn),
      totalGross,
      totalCashIn,
      totalRemaining,
      targetCompletion,
      teamRank,
      month // Include month if provided
    };
  };

  const fetchCurrentMonthData = async () => {
    if (!user || !user.employee) return null;

    // Use actual current month in YYYY-MM-01 format
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // getMonth() is 0-indexed, so add 1
    const monthDate = `${year}-${month.toString().padStart(2, '0')}-01`; // Format as YYYY-MM-01

    console.log('🔍 Upseller Dashboard Debug:', {
      userId: user.id,
      employeeId: user.employee.id,
      currentMonthDate: monthDate,
      currentDate: now.toISOString(),
      year: year,
      month: month,
      monthDate: monthDate,
      actualDate: new Date().toISOString()
    });

    try {
      // First try to fetch target for current month
      let targetData = null;
      const { data: currentMonthTarget, error: currentMonthError } = await supabase
        .from('upseller_targets')
        .select('*')
        .eq('seller_id', user.employee.id)
        .eq('month', monthDate)
        .single();

      // If no target for current month, get the most recent target
      if (currentMonthError && currentMonthError.code === 'PGRST116') {
        console.log('📅 No target for current month, fetching most recent target...');
        const { data: recentTargetData, error: recentTargetError } = await supabase
          .from('upseller_targets')
          .select('*')
          .eq('seller_id', user.employee.id)
          .order('month', { ascending: false })
          .limit(1)
          .single();

        if (recentTargetError) {
          console.log('❌ No targets found for user');
          targetData = null;
        } else {
          console.log('✅ Found recent target:', recentTargetData);
          targetData = recentTargetData;
        }
      } else if (currentMonthError) {
        throw currentMonthError;
      } else {
        targetData = currentMonthTarget;
      }

      console.log('🎯 Target fetch result:', {
        targetData,
        monthDate
      });

      // Fetch performance for current month - use DATE format and auth user ID
      const { data: performanceData, error: performanceError } = await supabase
        .from('upseller_performance')
        .select('*')
        .eq('seller_id', user.id) // Use auth user ID for performance data
        .eq('month', monthDate)
        .single();

      console.log('📊 Performance fetch result:', {
        performanceData,
        performanceError,
        monthDate
      });

      if (performanceError && performanceError.code !== 'PGRST116') {
        throw performanceError;
      }

      // Fetch accounts assigned (projects assigned to this upseller)
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('id, total_amount, amount_paid')
        .eq('assigned_pm_id', user.employee.id) // Use correct column name
        .in('status', ['assigned', 'in_progress', 'review']); // Include relevant project statuses

      if (projectsError) {
        console.warn('Error fetching projects data:', projectsError);
      }

      // Fetch sales dispositions created by this upseller that have remaining amounts
      const { data: salesData, error: salesError } = await supabase
        .from('sales_dispositions')
        .select('id, gross_value, cash_in, remaining')
        .eq('user_id', user.id) // Sales created by this upseller
        .gt('remaining', 0); // Only include those with outstanding amounts

      if (salesError) {
        console.warn('Error fetching sales dispositions data:', salesError);
      }

      // Calculate accounts assigned and receivable
      const accountsAssigned = projectsData?.length || 0;
      
      // Project receivables (from assigned projects)
      const projectReceivable = projectsData?.reduce((sum, project) => {
        const remaining = (project.total_amount || 0) - (project.amount_paid || 0);
        return sum + Math.max(0, remaining);
      }, 0) || 0;
      
      // Sales disposition receivables (from sales created by upseller)
      const salesReceivable = salesData?.reduce((sum, sale) => {
        return sum + (sale.remaining || 0);
      }, 0) || 0;
      
      // Total receivable is the sum of both
      const receivable = projectReceivable + salesReceivable;

      console.log('📋 Financial data:', {
        projectsData,
        salesData,
        accountsAssigned,
        projectReceivable,
        salesReceivable,
        totalReceivable: receivable
      });

      // Calculate performance metrics with new fields
      const metrics = calculatePerformanceMetrics(targetData, performanceData, accountsAssigned, receivable, monthDate);

      console.log('📈 Calculated metrics:', metrics);
      console.log('📈 Target data used:', targetData);
      console.log('📈 Performance data used:', performanceData);

      return metrics;
    } catch (error) {
      console.error('❌ Error fetching current month data:', error);
      return calculatePerformanceMetrics(null, null, 0, 0, undefined);
    }
  };

  const fetchPreviousMonthsData = async (): Promise<PerformanceMetrics[]> => {
    try {
      const { data: performanceData, error } = await supabase
        .from('upseller_performance')
        .select('*')
        .eq('seller_id', user?.id)
        .order('month', { ascending: false })
        .limit(6);

      if (error) throw error;

      // Get targets for the same months
      const months = performanceData?.map(item => item.month) || [];
      const { data: targetsData } = await supabase
        .from('upseller_targets')
        .select('*')
        .in('month', months);

      const targetsByMonth = new Map(
        targetsData?.map(target => [target.month, target]) || []
      );

      console.log('📊 Previous months performance data:', performanceData);
      console.log('📊 Previous months targets data:', targetsData);

      return performanceData?.map(item => {
        const target = targetsByMonth.get(item.month);
        const metrics = calculatePerformanceMetrics(target, item, 0, 0, item.month);
        console.log('📊 Month item:', item.month, 'Calculated metrics:', metrics);
        return metrics;
      }) || [];
    } catch (error) {
      console.error('Error fetching previous months data:', error);
      return [];
    }
  };

  const fetchTeamPerformance = async (month: Date) => {
    try {
      // Format date as YYYY-MM-01 to match database format and convert to DATE
      const monthString = month.toISOString().split('T')[0].substring(0, 7) + '-01';
      
      const { data: teamData, error: teamError } = await supabase
        .rpc('get_upseller_team_performance_summary', { p_month: monthString });

      if (teamError) {
        console.error('Error fetching team performance:', teamError);
        return;
      }

      if (teamData) {
        setTeamPerformance(teamData);
        
        // Find current user's rank
        const currentUserRank = teamData.findIndex(
          (member: TeamPerformanceSummary) => member.seller_id === user?.id
        );
        
        if (currentUserRank !== -1) {
          setCurrentUserRank(currentUserRank + 1);
        }

        // Update dashboard data with team performance
        setDashboardData(prevData => {
          if (!prevData) return prevData;
          return {
            ...prevData,
            teamPerformance: teamData,
            personalRank: currentUserRank !== -1 ? currentUserRank + 1 : 0
          };
        });
      }
    } catch (error) {
      console.error('Error in fetchTeamPerformance:', error);
    }
  };

  const loadDashboardData = async () => {
    console.log('🔄 Starting loadDashboardData...');
    if (!user || !user.employee) {
      console.log('❌ No user or employee data, stopping load');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Setting loading state...');
      setLoading(true);
      setError(null);

      // Check if user has dashboard access
      console.log('🔐 Checking upseller access...');
      const hasAccess = await checkUpsellerAccess();
      console.log('🔐 Access result:', hasAccess);
      setIsUpsellerEmployee(hasAccess);

      if (!hasAccess) {
        console.log('❌ Access denied');
        setError('Access denied. This dashboard is only available for users with dashboard permissions or Upseller employees.');
        setLoading(false);
        return;
      }

      // Fetch all dashboard data
      console.log('📊 Fetching current month data...');
      const [currentMonthData, previousMonthsData] = await Promise.all([
        fetchCurrentMonthData(),
        fetchPreviousMonthsData()
      ]);

      console.log('📊 Data fetched:', { currentMonthData, previousMonthsData });

      // Fetch team performance separately (this will update the state)
      console.log('👥 Fetching team performance...');
      await fetchTeamPerformance(new Date());

      // Set initial dashboard data
      console.log('💾 Setting dashboard data...');
      setDashboardData({
        currentMonth: currentMonthData,
        previousMonths: previousMonthsData,
        teamPerformance: [], // Will be populated by fetchTeamPerformance
        personalRank: 0, // Will be updated by fetchTeamPerformance
        teamAverage: {
          accountsAchieved: 0,
          totalGross: 0,
          totalCashIn: 0
        }
      });

      console.log('✅ Dashboard data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      console.log('🔄 Setting loading to false');
      setLoading(false);
    }
  };

  const updateTarget = async (targetData: Partial<UpsellerTarget>) => {
    if (!user || !user.employee) return;

    try {
      // Check dashboard access before allowing target updates
      const hasAccess = await checkUpsellerAccess();
      if (!hasAccess) {
        throw new Error('Access denied. This dashboard is only available for users with dashboard permissions or Upseller employees.');
      }

      // Use the same date logic as fetchCurrentMonthData
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1; // getMonth() is 0-indexed, so add 1
      const monthString = `${year}-${month.toString().padStart(2, '0')}-01`; // Format as YYYY-MM-01

      // Ensure we have the required fields for the upseller_targets table
      const targetPayload = {
        seller_id: user.employee.id,
        month: monthString,
        target_accounts: 0, // Default value since we're only setting cash_in target
        target_gross: 0, // Default value since we're only setting cash_in target
        target_cash_in: targetData.target_cash_in || 0,
        ...targetData
      };

      const { error } = await supabase
        .from('upseller_targets')
        .upsert(targetPayload);

      if (error) throw error;

      // Reload dashboard data
      await loadDashboardData();
    } catch (error) {
      console.error('Error updating target:', error);
      throw error;
    }
  };

  // Add a function to manually refresh dashboard data
  const refreshData = async () => {
    await loadDashboardData();
  };

  // Set up real-time subscriptions for automatic updates
  useEffect(() => {
    if (!user) return;

    // Subscribe to changes in sales_dispositions table
    const salesSubscription = supabase
      .channel('sales_dispositions_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sales_dispositions',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Refresh dashboard data when sales disposition changes
          loadDashboardData();
        }
      )
      .subscribe((status) => {
        console.log('Sales disposition subscription status:', status);
      });

    // Subscribe to changes in upseller_performance table
    const performanceSubscription = supabase
      .channel('upseller_performance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'upseller_performance',
          filter: `seller_id=eq.${user.id}`
        },
        (payload) => {
          // Refresh dashboard data when performance changes
          loadDashboardData();
        }
      )
      .subscribe((status) => {
        console.log('Performance subscription status:', status);
      });

    // Subscribe to changes in upseller_targets table
    const targetsSubscription = supabase
      .channel('upseller_targets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'upseller_targets',
          filter: `seller_id=eq.${user.employee?.id}`
        },
        (payload) => {
          console.log('🎯 Target change detected:', payload);
          // Refresh dashboard data when targets change
          loadDashboardData();
        }
      )
      .subscribe((status) => {
        console.log('🎯 Targets subscription status:', status);
        console.log('🎯 Subscription filter:', `seller_id=eq.${user.employee?.id}`);
        console.log('🎯 User employee ID:', user.employee?.id);
      });

    // Backup subscription without filter for debugging
    const backupTargetsSubscription = supabase
      .channel('backup_targets_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'upseller_targets'
        },
        (payload) => {
          console.log('🎯 Backup target change detected:', payload);
          // Only refresh if it's for the current user
          if (payload.new && typeof payload.new === 'object' && 'seller_id' in payload.new) {
            const newData = payload.new as { seller_id: string };
            if (newData.seller_id === user.employee?.id) {
              console.log('🎯 Refreshing dashboard for current user');
              loadDashboardData();
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('🎯 Backup targets subscription status:', status);
      });

    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up real-time subscriptions');
      salesSubscription.unsubscribe();
      performanceSubscription.unsubscribe();
      targetsSubscription.unsubscribe();
      backupTargetsSubscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    console.log('🔄 Main useEffect triggered', { user: !!user, userId: user?.id });
    if (!user) return;

    const fetchData = async () => {
      try {
        console.log('🔄 Starting fetchData...');
        setLoading(true);
        setError(null);

        // Check if user has dashboard access
        console.log('🔐 Checking upseller access...');
        const hasAccess = await checkUpsellerAccess();
        console.log('🔐 Access result:', hasAccess);
        setIsUpsellerEmployee(hasAccess);

        if (!hasAccess) {
          console.log('❌ Access denied');
          setError('Access denied. This dashboard is only available for users with dashboard permissions or Upseller employees.');
          return;
        }

        // Fetch all data in parallel
        console.log('📊 Fetching data in parallel...');
        const [currentMonthData, previousMonthsData] = await Promise.all([
          fetchCurrentMonthData(),
          fetchPreviousMonthsData()
        ]);

        console.log('📊 Data fetched:', { currentMonthData, previousMonthsData });

        // Fetch team performance separately
        console.log('👥 Fetching team performance...');
        await fetchTeamPerformance(new Date());

        // Set dashboard data after all data is fetched
        console.log('💾 Setting dashboard data...');
        setDashboardData({
          currentMonth: currentMonthData,
          previousMonths: previousMonthsData,
          teamPerformance: [], // Will be populated by fetchTeamPerformance
          personalRank: 0, // Will be updated by fetchTeamPerformance
          teamAverage: {
            accountsAchieved: 0,
            totalGross: 0,
            totalCashIn: 0
          }
        });

        console.log('✅ Dashboard data loaded successfully');
      } catch (error) {
        console.error('❌ Error fetching dashboard data:', error);
        setError('Failed to fetch dashboard data');
      } finally {
        console.log('🔄 Setting loading to false');
        setLoading(false);
      }
    };

    fetchData();
  }, [user]); // Remove teamPerformance and currentUserRank from dependencies

  return {
    dashboardData,
    loading,
    error,
    isUpsellerEmployee,
    refreshData,
    updateTarget
  };
};

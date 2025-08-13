import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from "@/contexts/AuthContext";
// Authentication removed - no user context needed
// Permissions removed - no authentication needed
import {
  FrontSellerTarget,
  FrontSellerPerformance,
  TeamPerformanceSummary,
  PerformanceMetrics,
  MonthlyPerformanceData,
  DashboardData
} from '../types/frontSeller';

export const useFrontSellerPerformance = () => {
  const { user } = useAuth();
  // User and permissions context removed - no authentication needed
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isFrontSalesEmployee, setIsFrontSalesEmployee] = useState<boolean | null>(null);

  // Check if user has My Dashboard access
  const checkDashboardAccess = async (userId: string): Promise<boolean> => {
    try {
      // Use backend API to check if user has front_sales role
      const response = await fetch('/api/admin/check-user-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          roleName: 'front_sales'
        }),
      });

      if (!response.ok) {
        console.warn('Failed to check user role, defaulting to true');
        return true; // Default to true if API fails
      }

      const { hasRole } = await response.json();
      return hasRole;
    } catch (error) {
      console.error('Error checking dashboard access:', error);
      return true; // Default to true if there's an error
    }
  };

  const calculatePerformanceMetrics = (
    target: FrontSellerTarget | null,
    performance: FrontSellerPerformance | null
  ): PerformanceMetrics => {
    const targetAccounts = target?.target_accounts || 0;
    const accountsAchieved = performance?.accounts_achieved || 0;
    const accountsRemaining = Math.max(0, targetAccounts - accountsAchieved);
    const totalGross = performance?.total_gross || 0;
    const totalCashIn = performance?.total_cash_in || 0;
    const totalRemaining = performance?.total_remaining || 0;
    const targetCompletion = targetAccounts > 0 ? (accountsAchieved / targetAccounts) * 100 : 0;

    return {
      targetAccounts,
      accountsAchieved,
      accountsRemaining,
      totalGross,
      totalCashIn,
      totalRemaining,
      targetCompletion
    };
  };

  const fetchCurrentMonthData = async () => {
    if (!user || !user.employee) return null;

    // Use UTC dates to match database trigger format
    const now = new Date();
    const currentYear = now.getUTCFullYear();
    const currentMonth = now.getUTCMonth();
    const monthStart = new Date(Date.UTC(currentYear, currentMonth, 1));
    const monthDate = monthStart.toISOString().split('T')[0]; // For DATE comparison

    console.log('🔍 Front Sales Dashboard Debug:', {
      userId: user.id,
      employeeId: user.employee.id,
      currentMonthDate: monthDate,
      currentDate: now.toISOString(),
      monthStart: monthStart.toISOString()
    });

    try {
      // Fetch target for current month - use DATE format and employee ID
      const { data: targetData, error: targetError } = await supabase
        .from('front_seller_targets')
        .select('*')
        .eq('seller_id', user.employee.id)
        .eq('month', monthDate)
        .single();

      console.log('🎯 Target fetch result:', {
        targetData,
        targetError,
        monthDate
      });

      if (targetError && targetError.code !== 'PGRST116') {
        throw targetError;
      }

      // Fetch performance for current month - use DATE format and auth user ID
      const { data: performanceData, error: performanceError } = await supabase
        .from('front_seller_performance')
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

      // Calculate performance metrics
      const metrics = calculatePerformanceMetrics(targetData, performanceData);

      console.log('📈 Calculated metrics:', metrics);

      return metrics;
    } catch (error) {
      console.error('Error fetching current month data:', error);
      return calculatePerformanceMetrics(null, null);
    }
  };

  const fetchPreviousMonthsData = async (): Promise<MonthlyPerformanceData[]> => {
    if (!user || !user.employee) return [];

    try {
      // Calculate current month to exclude it from previous months
      const now = new Date();
      const currentYear = now.getUTCFullYear();
      const currentMonth = now.getUTCMonth();
      const currentMonthStart = new Date(Date.UTC(currentYear, currentMonth, 1));
      const currentMonthDate = currentMonthStart.toISOString().split('T')[0];

      // Fetch performance data for previous months (excluding current month) - use auth user ID
      const { data: performanceData, error: performanceError } = await supabase
        .from('front_seller_performance')
        .select('*')
        .eq('seller_id', user.id) // Use auth user ID for performance data
        .lt('month', currentMonthDate) // Only get months before current month
        .order('month', { ascending: false })
        .limit(6);

      if (performanceError) throw performanceError;

      // Fetch targets for the same months - use employee ID
      const { data: targetData, error: targetError } = await supabase
        .from('front_seller_targets')
        .select('*')
        .eq('seller_id', user.employee.id) // Use employee ID for target data
        .in('month', performanceData?.map(p => p.month) || []);

      if (targetError) throw targetError;

      // Create a map of targets by month for easy lookup
      const targetsByMonth = new Map();
      targetData?.forEach(target => {
        targetsByMonth.set(target.month, target.target_accounts);
      });

      return performanceData?.map(item => ({
        month: item.month,
        accounts_achieved: item.accounts_achieved,
        total_gross: item.total_gross,
        total_cash_in: item.total_cash_in,
        total_remaining: item.total_remaining,
        target_accounts: targetsByMonth.get(item.month) || 0
      })) || [];
    } catch (error) {
      console.error('Error fetching previous months data:', error);
      return [];
    }
  };

  const fetchTeamPerformance = async (): Promise<{
    teamPerformance: TeamPerformanceSummary[];
    personalRank: number;
    teamAverage: { accountsAchieved: number; totalGross: number; totalCashIn: number };
  }> => {
    if (!user || !user.employee) return { teamPerformance: [], personalRank: 0, teamAverage: { accountsAchieved: 0, totalGross: 0, totalCashIn: 0 } };

    try {
      // Use UTC dates to match database trigger format
      const now = new Date();
      const currentYear = now.getUTCFullYear();
      const currentMonth = now.getUTCMonth();
      const monthStart = new Date(Date.UTC(currentYear, currentMonth, 1));
      const monthString = monthStart.toISOString().split('T')[0];

      const { data, error } = await supabase
        .rpc('get_team_performance_summary', { p_month: monthString });

      if (error) throw error;

      const teamPerformance = data || [];
      const personalRank = teamPerformance.find(p => p.seller_id === user.id)?.performance_rank || 0; // Use auth user ID

      // Calculate team averages
      const totalAccounts = teamPerformance.reduce((sum, p) => sum + p.accounts_achieved, 0);
      const totalGross = teamPerformance.reduce((sum, p) => sum + p.total_gross, 0);
      const totalCashIn = teamPerformance.reduce((sum, p) => sum + p.total_cash_in, 0);
      const teamSize = teamPerformance.length || 1;

      const teamAverage = {
        accountsAchieved: totalAccounts / teamSize,
        totalGross: totalGross / teamSize,
        totalCashIn: totalCashIn / teamSize
      };

      return { teamPerformance, personalRank, teamAverage };
    } catch (error) {
      console.error('Error fetching team performance:', error);
      return { teamPerformance: [], personalRank: 0, teamAverage: { accountsAchieved: 0, totalGross: 0, totalCashIn: 0 } };
    }
  };

  const loadDashboardData = async () => {
    if (!user || !user.employee) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check if user has dashboard access
      const hasAccess = await checkDashboardAccess(user.id);
      setIsFrontSalesEmployee(hasAccess);

      if (!hasAccess) {
        setError('Access denied. This dashboard is only available for users with dashboard permissions or Front Sales employees.');
        setLoading(false);
        return;
      }

      // Fetch all dashboard data
      const [currentMonthData, previousMonthsData, teamPerformance] = await Promise.all([
        fetchCurrentMonthData(),
        fetchPreviousMonthsData(),
        fetchTeamPerformance()
      ]);

      setDashboardData({
        currentMonth: currentMonthData,
        previousMonths: previousMonthsData,
        teamPerformance: teamPerformance.teamPerformance,
        personalRank: teamPerformance.personalRank,
        teamAverage: teamPerformance.teamAverage
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateTarget = async (targetData: Partial<FrontSellerTarget>) => {
    if (!user || !user.employee) return;

    try {
      // Check dashboard access before allowing target updates
      const hasAccess = await checkDashboardAccess(user.id);
      if (!hasAccess) {
        throw new Error('Access denied. This dashboard is only available for users with dashboard permissions or Front Sales employees.');
      }

      // Use UTC dates to match database trigger format
      const now = new Date();
      const currentYear = now.getUTCFullYear();
      const currentMonth = now.getUTCMonth();
      const monthStart = new Date(Date.UTC(currentYear, currentMonth, 1));
      const monthString = monthStart.toISOString().split('T')[0];

      const { error } = await supabase
        .from('front_seller_targets')
        .upsert({
          seller_id: user.employee.id,
          month: monthString,
          ...targetData
        });

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

    // Subscribe to changes in front_seller_performance table
    const performanceSubscription = supabase
      .channel('front_seller_performance_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'front_seller_performance',
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

    // Cleanup subscriptions on unmount
    return () => {
      console.log('Cleaning up real-time subscriptions');
      salesSubscription.unsubscribe();
      performanceSubscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  return {
    dashboardData,
    loading,
    error,
    isFrontSalesEmployee,
    refreshData,
    updateTarget
  };
}; 
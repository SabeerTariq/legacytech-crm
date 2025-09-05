import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContextJWT';
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
      const response = await fetch('/api/admin/check-user-role-mysql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
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

  const fetchDashboardData = useCallback(async (): Promise<DashboardData | null> => {
    if (!user) return null;

    try {
      console.log('🔍 Fetching dashboard data for user:', user.id);

      const response = await fetch(`/api/front-sales/dashboard?user_id=${user.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch dashboard data');
      }

      console.log('✅ Dashboard data fetched successfully:', result.data);
      return result.data;

    } catch (error) {
      console.error('❌ Error fetching dashboard data:', error);
      throw error;
    }
  }, [user]);

  const updateTarget = async (targetData: {
    target_accounts: number;
    target_gross: number;
    target_cash_in: number;
  }) => {
    if (!user) {
      throw new Error('User data not available');
    }

    try {
      console.log('🎯 Updating target for user:', user.id, targetData);

      const response = await fetch('/api/front-sales/dashboard/targets', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          ...targetData
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update targets');
      }

      console.log('✅ Target updated successfully');
      
      // Refresh data after updating target
      await refreshData();

    } catch (error) {
      console.error('Error updating target:', error);
      throw error;
    }
  };

  const refreshData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Check dashboard access
      const hasAccess = await checkDashboardAccess(user.id);
      setIsFrontSalesEmployee(hasAccess);

      if (!hasAccess) {
        setError('You do not have access to the Front Sales dashboard');
        setLoading(false);
        return;
      }

      // Fetch dashboard data
      const data = await fetchDashboardData();
      setDashboardData(data);

      console.log('📊 Dashboard data loaded:', data);

    } catch (error) {
      console.error('Error refreshing data:', error);
      setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user, fetchDashboardData]);

  useEffect(() => {
    if (user) {
      refreshData();
    }
  }, [user, refreshData]);

  return {
    dashboardData,
    loading,
    error,
    isFrontSalesEmployee,
    refreshData,
    updateTarget
  };
};
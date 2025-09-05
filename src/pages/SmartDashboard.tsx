import React from 'react';
import { useAuth } from '@/contexts/AuthContextJWT';
import { usePermissions } from '@/contexts/PermissionContext';
import Dashboard from './Dashboard';
import { FrontSellerDashboard } from './dashboard/FrontSellerDashboard';

const SmartDashboard: React.FC = () => {
  const { user } = useAuth();
  const { loading: permissionsLoading } = usePermissions();

  // Show loading while permissions are being loaded
  if (permissionsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin (admin users should see main dashboard)
  const isAdminUser = () => {
    if (!user) return false;
    
    // Access user metadata safely
    // @ts-expect-error - Accessing dynamic user metadata
    const userMetadata = user?.user_metadata;
    if (userMetadata?.attributes?.role === 'super_admin' || 
        userMetadata?.attributes?.role === 'admin' ||
        userMetadata?.attributes?.is_admin === true) {
      return true;
    }
    
    return false;
  };

  // Check if user has front sales role (but not admin)
  const isFrontSalesUser = () => {
    if (!user || isAdminUser()) return false;
    
    // Access user metadata safely
    // @ts-expect-error - Accessing dynamic user metadata
    const userMetadata = user?.user_metadata;
    
    // Check user profile attributes for role
    if (userMetadata?.attributes?.role === 'front_sales') {
      return true;
    }
    
    // Check department
    if (userMetadata?.attributes?.department === 'Front Sales') {
      return true;
    }
    
    return false;
  };

  // Determine which dashboard to show
  const getDashboardComponent = () => {
    if (isFrontSalesUser()) {
      return <FrontSellerDashboard />;
    }
    
    // Default to main dashboard for admin and other users
    return <Dashboard />;
  };

  return (
    <div>
      {getDashboardComponent()}
    </div>
  );
};

export default SmartDashboard; 
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/contexts/PermissionContext';
import { NAVIGATION_PERMISSIONS } from '@/types/permissions';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  fallback,
  redirectTo = '/login'
}) => {
  const { user, loading: authLoading } = useAuth();
  const { loading: permissionLoading, canRead } = usePermissions();
  const location = useLocation();

  // Show loading spinner while checking authentication and permissions
  if (authLoading || permissionLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // If user is disabled, show disabled message
  if (user.status === 'disabled') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Account Disabled</h2>
          <p className="text-gray-600">Your account has been disabled. Please contact your administrator.</p>
        </div>
      </div>
    );
  }

  // Check if specific permissions are required
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(permission => canRead(permission));
    
    if (!hasRequiredPermissions) {
      return fallback ? (
        <>{fallback}</>
      ) : (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      );
    }
  }

  // Check navigation-based permissions
  const currentPath = location.pathname;
  const requiredModule = NAVIGATION_PERMISSIONS[currentPath];
  
  if (requiredModule && !canRead(requiredModule)) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this module.</p>
        </div>
      </div>
    );
  }

  // All checks passed, render children
  return <>{children}</>;
};

export default ProtectedRoute; 
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, UserRole, useAuthorization } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles = []
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('ProtectedRoute: Loading authentication state...');
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
        <p className="ml-2 text-muted-foreground">Verifying authentication...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated || !user) {
    console.log('ProtectedRoute: User is not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: User is authenticated:', user);

  // If roles are specified, check if user has permission
  if (allowedRoles.length > 0) {
    const hasPermission = user && allowedRoles.includes(user.role);

    if (!hasPermission) {
      // Redirect to unauthorized page or dashboard
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Render the protected content
  return <Outlet />;
};

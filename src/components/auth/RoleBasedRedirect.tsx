import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextJWT';

interface RoleBasedRedirectProps {
  children: React.ReactNode;
}

const RoleBasedRedirect: React.FC<RoleBasedRedirectProps> = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // If user is not loaded yet, show children (loading state)
  if (!user) {
    return <>{children}</>;
  }

  // Check if user is on the root path and has a role
  const currentPath = location.pathname;
  
  console.log('RoleBasedRedirect check:', {
    currentPath,
    userRole: user.role?.name,
    userEmail: user.email
  });
  
  if (currentPath === '/' && user.role) {
    // Redirect based on role
    switch (user.role.name) {
      case 'front_sales':
        console.log('Redirecting front_sales user to front-seller-dashboard');
        return <Navigate to="/front-seller-dashboard" replace />;
      case 'upseller':
        console.log('Redirecting upseller user to upseller-dashboard');
        return <Navigate to="/upseller-dashboard" replace />;
      case 'admin':
        console.log('Admin user staying on main dashboard');
        return <>{children}</>; // Admin stays on main dashboard
      default:
        console.log('Default user staying on main dashboard');
        return <>{children}</>; // Default to main dashboard
    }
  }

  // For all other paths, show the children
  return <>{children}</>;
};

export default RoleBasedRedirect; 
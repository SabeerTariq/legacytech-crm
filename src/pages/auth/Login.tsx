import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContextJWT';
import LoginForm from '@/components/auth/LoginForm';

const Login: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('Login component - User:', user?.email, 'Loading:', loading);

  // Redirect to appropriate dashboard based on role if already logged in
  useEffect(() => {
    console.log('Login useEffect - User:', user?.email, 'Role:', user?.role?.name);
    
    if (user) {
      console.log('User is logged in, checking role for redirect...');
      // Redirect based on user role
      if (user.role) {
        switch (user.role.name) {
          case 'front_sales':
            console.log('Redirecting front_sales user to /front-seller-dashboard');
            navigate('/front-seller-dashboard');
            break;
          case 'upseller':
            console.log('Redirecting upseller user to /upseller-dashboard');
            navigate('/upseller-dashboard');
            break;
          case 'admin':
            console.log('Redirecting admin user to /');
            navigate('/');
            break;
          default:
            console.log('Redirecting default user to /');
            navigate('/');
            break;
        }
      } else {
        console.log('User has no role, redirecting to /');
        navigate('/');
      }
    } else {
      console.log('No user, showing login form');
    }
  }, [user, navigate]);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Show login form if not logged in
  if (!user) {
    console.log('Rendering login form');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Sign in to LogicWorks CRM
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your credentials to access the system
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  // This should not be reached due to the redirect above
  console.log('Login component - unexpected state, user:', user?.email);
  return null;
};

export default Login; 
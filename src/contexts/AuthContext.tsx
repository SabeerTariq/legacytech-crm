
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '../services/api';
import { mockApi } from '../services/mockApi';

// Define user roles
export type UserRole = 'admin' | 'sales' | 'project_manager';

// Define user type
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  active?: boolean;
}



// Auth context type
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

// Create auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth provider props
interface AuthProviderProps {
  children: ReactNode;
}

// Create auth provider
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkAuth = async () => {
      console.log('Checking authentication...');
      const storedToken = localStorage.getItem('token');
      console.log('Stored token:', storedToken ? 'Token exists' : 'No token');

      if (storedToken) {
        try {
          // Set token in state and API headers
          setToken(storedToken);
          api.setAuthToken(storedToken);

          // Get current user from API
          const response = await api.getCurrentUser();
          console.log('Current user response:', response);

          if (response.status === 'success' && response.data?.user) {
            const userData = response.data.user;
            setUser(userData);
            setIsAuthenticated(true);
            console.log('User authenticated successfully:', userData);
          } else {
            console.error('Invalid response structure:', response);
            throw new Error('Failed to get user data: invalid response structure');
          }
        } catch (error: any) {
          console.error('Failed to authenticate user:', error);

          // Clear invalid token
          localStorage.removeItem('token');
          setToken(null);
          api.removeAuthToken();
          setIsAuthenticated(false);

          // Show error message
          const errorMessage = error.response?.data?.message || error.message || 'Authentication failed';
          toast.error(errorMessage);
        }
      } else {
        console.log('No token found, user is not authenticated');
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    console.log('Login attempt with:', { email, password });

    try {
      // Call the real API login endpoint
      const response = await api.login(email, password);

      console.log('Login response:', response);

      // Check if response has the expected structure
      if (response.status !== 'success') {
        throw new Error('Login failed: ' + (response.message || 'Unknown error'));
      }

      // Extract token and user from response
      const token = response.token;
      const user = response.data?.user;

      if (!token || !user) {
        console.error('Invalid response structure:', response);
        throw new Error('Invalid response from server: missing token or user data');
      }

      console.log('Login successful:', { token, user });

      // Save token to localStorage
      localStorage.setItem('token', token);

      // Set token in API headers
      api.setAuthToken(token);

      // Update state
      setToken(token);
      setUser(user);
      setIsAuthenticated(true);

      toast.success(`Welcome back, ${user.name}!`);
      console.log('Login successful, navigating to home');
      navigate('/');
    } catch (error: any) {
      // Handle error message
      const errorMessage = error.response?.data?.message || error.message || 'Login failed. Please try again.';
      toast.error(errorMessage);
      console.error('Login error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (userData: any) => {
    setIsLoading(true);

    try {
      const response = await api.register(userData);

      if (response.status === 'success') {
        const { token, user } = response;

        // Save token to localStorage
        localStorage.setItem('token', token);

        // Set token in API headers
        api.setAuthToken(token);

        // Update state
        setToken(token);
        setUser(user);
        setIsAuthenticated(true);

        toast.success(`Welcome, ${user.name}!`);
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    console.log('Logout initiated');

    try {
      // In a real app, you would call api.logout() here
      // await api.logout();

      // Clear token from localStorage
      localStorage.removeItem('token');
      console.log('Token removed from localStorage');

      // Remove token from API headers
      api.removeAuthToken();
      console.log('Token removed from API headers');

      // Update state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      console.log('Auth state reset');

      toast.info('You have been logged out');
      console.log('Navigating to login page');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);

      // Even if there's an error, we should still reset the state
      localStorage.removeItem('token');
      api.removeAuthToken();
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isLoading,
      login,
      register,
      logout,
      isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Auth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Role-based auth hook
export const useAuthorization = (allowedRoles: UserRole[]) => {
  const { user } = useAuth();

  if (!user) {
    return false;
  }

  return allowedRoles.includes(user.role);
};

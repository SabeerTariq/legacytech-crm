import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User } from '@/types/auth';
import apiClient from '@/lib/api/client';

// Types
interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' }
  | { type: 'LOGOUT' };

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

// Initial state
const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
};

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  const payload = 'payload' in action ? action.payload : undefined;
  console.log('AuthReducer:', action.type, payload);
  
  let newState: AuthState;
  
  switch (action.type) {
    case 'SET_LOADING':
      newState = { ...state, loading: action.payload };
      break;
    case 'SET_USER':
      newState = { ...state, user: action.payload, loading: false, error: null };
      // Store user in localStorage for persistence
      if (action.payload) {
        localStorage.setItem('crm_user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('crm_user');
      }
      break;
    case 'SET_ERROR':
      newState = { ...state, error: action.payload, loading: false };
      break;
    case 'CLEAR_ERROR':
      newState = { ...state, error: null };
      break;
    case 'LOGOUT':
      newState = { ...state, user: null, loading: false, error: null };
      localStorage.removeItem('crm_user');
      localStorage.removeItem('jwt_token');
      break;
    default:
      newState = state;
  }
  
  return newState;
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to create user object from profile data
const createUserFromProfile = (profileData: {
  id: string;
  email: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
  employee?: {
    employee_id?: string;
    id?: string;
    full_name: string;
    department: string;
    job_title: string;
  };
  attributes?: Record<string, unknown>;
  roles?: Array<{
    id: string;
    name: string;
    display_name: string;
    description: string;
  }>;
}): User => {
  console.log('Creating user from profile:', profileData);
  
  // Extract department from either employee data or attributes
  const department = profileData.employee?.department || 'General';
  
  const user: User = {
    id: profileData.id,
    email: profileData.email,
    display_name: profileData.employee?.full_name || profileData.display_name || profileData.email,
    is_admin: profileData.is_admin || false,
    status: 'active',
    created_at: profileData.created_at,
    employee: profileData.employee ? {
      id: profileData.employee.employee_id || profileData.employee.id,
      full_name: profileData.employee.full_name,
      department: department,
      job_title: profileData.employee.job_title,
    } : {
      id: profileData.id,
      full_name: profileData.display_name || profileData.email,
      department: department,
      job_title: 'User'
    },
    attributes: profileData.attributes || {},
  };

  // Set role if available from the roles array
  if (profileData.roles && profileData.roles.length > 0) {
    const role = profileData.roles[0];
    user.role = {
      id: role.id,
      name: role.name,
      display_name: role.display_name,
      description: role.description
    };
    console.log('User role set:', user.role);
  } else {
    // Default role for users without assigned role
    user.role = {
      id: profileData.id,
      name: 'user',
      display_name: 'User',
      description: 'Regular user'
    };
    console.log('Default role set:', user.role);
  }

  console.log('Final user object:', user);
  return user;
};

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        console.log('Checking existing session...');
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // First, try to get user from localStorage
        const storedUser = localStorage.getItem('crm_user');
        const storedToken = localStorage.getItem('jwt_token');
        
        if (storedUser && storedToken) {
          try {
            const oldUser = JSON.parse(storedUser);
            console.log('Found stored user:', oldUser.email);
            
            // Verify token is still valid by getting fresh profile
            const profileResponse = await apiClient.getProfile();
            
            if (profileResponse.success && profileResponse.data) {
              console.log('Stored user verified, recreating user object');
              
              // Create user object from profile data
              const user = createUserFromProfile(profileResponse.data);
              dispatch({ type: 'SET_USER', payload: user });
              return;
            } else {
              console.log('Stored user no longer valid, clearing');
              localStorage.removeItem('crm_user');
              localStorage.removeItem('jwt_token');
            }
          } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('crm_user');
            localStorage.removeItem('jwt_token');
          }
        }

        // No valid session found
        console.log('No valid session found');
        dispatch({ type: 'SET_LOADING', payload: false });
        
      } catch (error) {
        console.error('Error checking existing session:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkExistingSession();
  }, []);

  // Login function - authenticate with JWT
  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('Login attempt for:', credentials.email);
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // Call JWT login endpoint
      const response = await apiClient.login(credentials);
      
      if (response.success && response.data) {
        console.log('Login successful, setting user');
        
        // Store JWT token
        localStorage.setItem('jwt_token', response.data.token);
        
        // Get user profile
        const profileResponse = await apiClient.getProfile();
        
        if (profileResponse.success && profileResponse.data) {
          // Create user object from profile data
          const user = createUserFromProfile(profileResponse.data);
          dispatch({ type: 'SET_USER', payload: user });
        } else {
          throw new Error('Failed to get user profile');
        }
      } else {
        throw new Error(response.message || 'Login failed');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      console.error('Login error:', errorMessage);
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log('Logging out user');
      
      // Call logout endpoint to invalidate token
      await apiClient.logout();
      
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  console.log('AuthContext state:', state);

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

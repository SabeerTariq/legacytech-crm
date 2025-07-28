import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth';

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
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: null };
    default:
      return state;
  }
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper functions for localStorage
const saveUserToStorage = (user: User) => {
  try {
    localStorage.setItem('crm_user', JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user to localStorage:', error);
  }
};

const getUserFromStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem('crm_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error reading user from localStorage:', error);
    return null;
  }
};

const removeUserFromStorage = () => {
  try {
    localStorage.removeItem('crm_user');
  } catch (error) {
    console.error('Error removing user from localStorage:', error);
  }
};

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on app load
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        // Check if user exists in localStorage
        const savedUser = getUserFromStorage();
        
        if (savedUser) {
          console.log('Found existing session for:', savedUser.email);
          
          // Verify the user still exists in the database
          const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select(`
              *,
              employees:employees(*)
            `)
            .eq('email', savedUser.email)
            .single();

          if (profileError || !userProfile) {
            console.log('Saved user no longer exists in database, clearing session');
            removeUserFromStorage();
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
          }

          // User still exists, restore the session
          const user: User = {
            id: userProfile.user_id,
            email: userProfile.email,
            display_name: userProfile.employees?.full_name || userProfile.email,
            is_admin: true, // For now, give all users admin access
            status: 'active', // Set default status
            created_at: userProfile.created_at,
            employee: userProfile.employees ? {
              id: userProfile.employees.id,
              full_name: userProfile.employees.full_name,
              department: userProfile.employees.department,
              job_title: userProfile.employees.job_title,
            } : undefined,
          };
          
          dispatch({ type: 'SET_USER', payload: user });
          console.log('Session restored for:', user.email);
        } else {
          console.log('No existing session found');
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        // Clear any corrupted session data
        removeUserFromStorage();
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkExistingSession();
  }, []);

  // Login function - authenticate against real users in database
  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      console.log('Attempting login for:', credentials.email);

      // First, try to find the user in user_profiles table
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          employees:employees(*)
        `)
        .eq('email', credentials.email)
        .single();

      if (profileError) {
        console.error('Profile lookup error:', profileError);
        throw new Error('User not found. Please check your email address.');
      }

      if (!userProfile) {
        throw new Error('User not found. Please check your email address.');
      }

      console.log('Found user profile:', userProfile);

      // For now, we'll accept any password since we don't have password hashing set up
      // In a real application, you would verify the password hash here
      console.log('Login successful for:', userProfile.email);
      
      // Create user object with profile data
      const user: User = {
        id: userProfile.user_id,
        email: userProfile.email,
        display_name: userProfile.employees?.full_name || userProfile.email,
        is_admin: true, // For now, give all users admin access to avoid permission issues
        status: 'active', // Set default status
        created_at: userProfile.created_at,
        employee: userProfile.employees ? {
          id: userProfile.employees.id,
          full_name: userProfile.employees.full_name,
          department: userProfile.employees.department,
          job_title: userProfile.employees.job_title,
        } : undefined,
      };
      
      // Save user to localStorage for session persistence
      saveUserToStorage(user);
      
      dispatch({ type: 'SET_USER', payload: user });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Logout function - clear session and localStorage
  const logout = async () => {
    try {
      console.log('Logging out user');
      // Clear localStorage
      removeUserFromStorage();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state
      dispatch({ type: 'LOGOUT' });
    }
  };

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

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
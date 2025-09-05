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
      break;
    default:
      newState = state;
  }
  
  return newState;
};

// Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to create user object from profile
const createUserFromProfile = (userProfile: any, roleData?: any): User => {
  console.log('Creating user from profile:', userProfile);
  console.log('Role data:', roleData);
  
  // Extract department from either employees table or attributes
  const department = userProfile.employees?.department || userProfile.attributes?.department || 'General';
  
  const user: User = {
    id: userProfile.user_id,
    email: userProfile.email,
    display_name: userProfile.employees?.full_name || userProfile.email,
    is_admin: userProfile.is_admin || false,
    status: 'active',
    created_at: userProfile.created_at,
    employee: userProfile.employees ? {
      id: userProfile.employees.id,
      full_name: userProfile.employees.full_name,
      department: department,
      job_title: userProfile.employees.job_title,
    } : {
      id: userProfile.user_id,
      full_name: userProfile.display_name || userProfile.email,
      department: department,
      job_title: 'User'
    },
    attributes: userProfile.attributes || {},
  };

  // Set role if available
  if (roleData && roleData.length > 0 && roleData[0]?.roles) {
    const role = roleData[0].roles as any;
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
      id: userProfile.user_id,
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
        if (storedUser) {
          try {
            const oldUser = JSON.parse(storedUser);
            console.log('Found stored user:', oldUser.email);
            
            // Verify user still exists in database and recreate user object
            const { data: userProfile, error: profileError } = await supabase
              .from('user_profiles')
              .select(`
                *,
                employees:employees(*)
              `)
              .eq('email', oldUser.email)
              .single();

            if (!profileError && userProfile) {
              console.log('Stored user verified, recreating user object');
              
              // Load user role
              let roleData = null;
              try {
                const { data: userRoleData, error: roleError } = await supabase
                  .from('user_roles')
                  .select(`
                    roles (
                      id,
                      name,
                      display_name,
                      description
                    )
                  `)
                  .eq('user_id', userProfile.user_id);

                if (!roleError && userRoleData && userRoleData.length > 0) {
                  roleData = userRoleData;
                }
              } catch (error) {
                console.error('Error loading user role:', error);
              }

              // Recreate user object with updated profile data
              const user = createUserFromProfile(userProfile, roleData);
              dispatch({ type: 'SET_USER', payload: user });
              return;
            } else {
              console.log('Stored user no longer exists in database, clearing');
              localStorage.removeItem('crm_user');
            }
          } catch (error) {
            console.error('Error parsing stored user:', error);
            localStorage.removeItem('crm_user');
          }
        }

        // If no stored user, check Supabase session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error getting session:', sessionError);
          dispatch({ type: 'SET_LOADING', payload: false });
          return;
        }

        if (session?.user) {
          console.log('Found existing Supabase session for:', session.user.email);
          
          // Get user profile from database
          const { data: userProfile, error: profileError } = await supabase
            .from('user_profiles')
            .select(`
              *,
              employees:employees(*)
            `)
            .eq('user_id', session.user.id)
            .single();

          if (profileError || !userProfile) {
            console.log('User profile not found, logging out');
            await supabase.auth.signOut();
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
          }

          // Load user role
          let roleData = null;
          try {
            const { data: userRoleData, error: roleError } = await supabase
              .from('user_roles')
              .select(`
                roles (
                  id,
                  name,
                  display_name,
                  description
                )
              `)
              .eq('user_id', userProfile.user_id);

            if (!roleError && userRoleData && userRoleData.length > 0) {
              roleData = userRoleData;
            }
          } catch (error) {
            console.error('Error loading user role:', error);
          }

          const user = createUserFromProfile(userProfile, roleData);
          dispatch({ type: 'SET_USER', payload: user });
          console.log('Session restored for:', user.email);
        } else {
          console.log('No existing session found');
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch (error) {
        console.error('Error checking existing session:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkExistingSession();
  }, []);

  // Login function - authenticate with database users
  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('Login attempt for:', credentials.email);
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      // First, check if user exists in user_profiles
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          employees:employees(*)
        `)
        .eq('email', credentials.email)
        .single();

      if (profileError || !userProfile) {
        throw new Error('User not found. Please check your email address.');
      }

      console.log('Found user profile:', userProfile);

      // Load user role from database
      let roleData = null;
      try {
        const { data: userRoleData, error: roleError } = await supabase
          .from('user_roles')
          .select(`
            roles (
              id,
              name,
              display_name,
              description
            )
          `)
          .eq('user_id', userProfile.user_id);

        if (!roleError && userRoleData && userRoleData.length > 0) {
          roleData = userRoleData;
        }
      } catch (error) {
        console.error('Error loading user role:', error);
      }

      // Create user object
      const user = createUserFromProfile(userProfile, roleData);
      
      // Set up Supabase session for RLS policies
      try {
        // Create a custom session for the user
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: 'custom_token_' + user.id, // Custom token for RLS
          refresh_token: 'custom_refresh_' + user.id,
        });
        
        if (sessionError) {
          console.warn('Failed to set Supabase session:', sessionError);
        } else {
          console.log('Supabase session set successfully');
        }
      } catch (sessionError) {
        console.warn('Error setting Supabase session:', sessionError);
      }
      
      console.log('Login successful, setting user:', user);
      dispatch({ type: 'SET_USER', payload: user });
      
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
      await supabase.auth.signOut();
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
export interface User {
  id: string;
  email: string;
  display_name: string;
  is_admin: boolean;
  created_at: string;
  status?: 'active' | 'disabled';
  role?: {
    id: string;
    name: string;
    display_name: string;
    description: string;
  };
  employee?: {
    id: string;
    full_name: string;
    department: string;
    job_title: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
} 
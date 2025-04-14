// Mock API service for testing
import { api } from './api';

// Mock users
const mockUsers = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@legacytech.com',
    role: 'admin',
    active: true,
  },
  {
    id: 2,
    name: 'Sales User',
    email: 'sales@legacytech.com',
    role: 'sales',
    active: true,
  },
  {
    id: 3,
    name: 'Project Manager',
    email: 'pm@legacytech.com',
    role: 'project_manager',
    active: true,
  }
];

// Mock login function
export const mockLogin = async (email: string, password: string) => {
  console.log('mockLogin called with:', { email, password });

  // Find user by email
  const user = mockUsers.find(u => u.email === email);
  console.log('User found:', user);

  // Check if user exists and password is correct
  if (user && password === 'password') {
    // Generate a JWT-like token (in a real app, this would be a proper JWT)
    const token = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.${btoa(JSON.stringify({
      id: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24) // 24 hours
    }))}.MOCK_SIGNATURE`;

    console.log('Generated token:', token);

    // Set the token in the API service
    api.setAuthToken(token);

    // Store token in localStorage
    localStorage.setItem('token', token);

    // Return success response
    const response = {
      success: true,
      data: {
        user,
        token
      }
    };
    console.log('Login success response:', response);
    return response;
  }

  // Return error for invalid credentials
  const errorResponse = {
    success: false,
    message: 'Invalid email or password'
  };
  console.log('Login error response:', errorResponse);
  return errorResponse;
};

// Mock getCurrentUser function
export const mockGetCurrentUser = async () => {
  // Get token from localStorage
  const token = localStorage.getItem('token');

  if (!token) {
    return {
      success: false,
      message: 'Not authenticated'
    };
  }

  try {
    // Parse JWT-like token
    // In a real app, you would verify the signature
    const tokenParts = token.split('.');

    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format');
    }

    // Decode the payload
    const payload = JSON.parse(atob(tokenParts[1]));
    console.log('Token payload:', payload);

    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      throw new Error('Token expired');
    }

    // Find user by ID
    const user = mockUsers.find(u => u.id === payload.id);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      success: true,
      data: {
        user
      }
    };
  } catch (error) {
    console.error('Error parsing token:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Authentication error'
    };
  }
};

// Export mock API functions
export const mockApi = {
  login: mockLogin,
  getCurrentUser: mockGetCurrentUser
};

import { supabase } from '../../integrations/supabase/client';
import { Employee } from '../../hooks/useEmployees';
import { ModulePermission } from '../../types/permissions';

export interface CreateUserData {
  employee_id: string;
  password: string;
  permissions: ModulePermission[];
  role_id?: string; // Optional role ID for role assignment
}

export interface AdminUser {
  id: string;
  employee_id: string;
  email: string;
  user_management_email?: string;
  status: 'active' | 'disabled';
  created_by_admin_id: string;
  created_at: string;
  employee: Employee;
  role?: {
    id: string;
    name: string;
    display_name: string;
    description: string;
  };
}

class AdminService {
  async createUser(userData: CreateUserData): Promise<AdminUser> {
    try {
      const response = await fetch(`/api/admin/create-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create user');
      }

      const result = await response.json();
      console.log('User created successfully');
      return result.user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUsers(): Promise<AdminUser[]> {
    try {
      // Fetch users from user_profiles with employee data
      const { data: userProfiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select(`
          *,
          employees:employees(*)
        `)
        .order('created_at', { ascending: false });

      if (profilesError) {
        throw new Error(profilesError.message);
      }

      // Fetch all user roles from backend API (bypasses RLS)
      let userRolesMap = {};
      try {
        const response = await fetch('/api/admin/get-user-roles');
        
        if (response.ok) {
          const userData = await response.json();
          userRolesMap = userData;
        }
      } catch (error) {
        console.warn('Failed to fetch user roles from API:', error);
      }

      // Map users with their roles
      const usersWithRoles = (userProfiles || []).map((profile) => {
        const userInfo = userRolesMap[profile.user_id];
        const role = userInfo ? {
          id: profile.user_id,
          name: 'user',
          display_name: userInfo.display_name || 'User',
          description: 'Regular user'
        } : undefined;

        return {
          id: profile.user_id,
          employee_id: profile.employee_id || '',
          email: profile.attributes?.user_management_email || profile.email,
          user_management_email: profile.attributes?.user_management_email || profile.email,
          status: (profile.is_active ? 'active' : 'disabled') as 'active' | 'disabled',
          created_by_admin_id: '1', // TODO: Get from profile
          created_at: profile.created_at,
          employee: {
            id: profile.employees?.id || '',
            full_name: profile.employees?.full_name || profile.employees?.name || profile.display_name,
            email: profile.employees?.email || profile.email,
            department: profile.employees?.department || 'Unknown',
            job_title: profile.employees?.job_title || profile.employees?.position || 'User',
            date_of_joining: profile.employees?.date_of_joining || ''
          },
          role
        };
      });

      return usersWithRoles;

    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // First, get the user's email for proper deletion
      const { data: userProfile, error: profileError } = await supabase
        .from('user_profiles')
        .select('email')
        .eq('user_id', userId)
        .single();

      let userEmail = '';

      if (profileError) {
        console.error('Error fetching user profile for deletion:', profileError);
        // Try to get email from auth.users directly
        try {
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
          if (authError) {
            throw new Error('User not found');
          }
          userEmail = authUser.user.email;
        } catch (authError) {
          console.error('Error getting auth user:', authError);
          throw new Error('Could not find user email');
        }
      } else {
        userEmail = userProfile.email;
      }

      console.log('Deleting user with email:', userEmail);

      // Call backend API for deletion (this handles all the cleanup)
      const response = await fetch(`/api/admin/delete-user`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }

      console.log('User deletion completed successfully');
      
      // Force a refresh of the user list
      await this.getUsers();

    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<CreateUserData>): Promise<void> {
    try {
      const updateData = { userId, userData };
      const response = await fetch(`/api/admin/update-user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // New method to get all users including orphaned auth users
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      // Get users from user_profiles (normal flow)
      const normalUsers = await this.getUsers();

      // Get orphaned auth users
      const { data: orphanedUsers, error: orphanedError } = await supabase
        .from('auth.users')
        .select('id, email, created_at')
        .not('id', 'in', `(${normalUsers.map(u => `'${u.id}'`).join(',')})`)
        .like('email', '%@logicworks.com');

      if (orphanedError) {
        console.warn('Error fetching orphaned users:', orphanedError);
        return normalUsers;
      }

      // Convert orphaned users to AdminUser format
      const orphanedAdminUsers: AdminUser[] = (orphanedUsers || []).map(user => ({
        id: user.id,
        employee_id: '',
        email: user.email,
        user_management_email: user.email,
        status: 'active' as const,
        created_by_admin_id: '1',
        created_at: user.created_at,
        employee: {
          id: '',
          full_name: user.email.split('@')[0],
          email: user.email,
          department: 'Unknown',
          job_title: 'User',
          date_of_joining: ''
        }
      }));

      return [...normalUsers, ...orphanedAdminUsers];
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }
}

export default new AdminService(); 
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/hooks/useEmployees';
import { ModulePermission } from '@/types/permissions';

export interface CreateUserData {
  employee_id: string;
  email: string;
  password: string;
  permissions: ModulePermission[];
}

export interface AdminUser {
  id: string;
  employee_id: string;
  email: string;
  status: 'active' | 'disabled';
  created_by_admin_id: string;
  created_at: string;
  employee: Employee;
}

class AdminService {
  async createUser(userData: CreateUserData): Promise<AdminUser> {
    try {
      // Call backend API instead of direct Supabase admin functions
      const response = await fetch('http://localhost:3001/api/admin/create-user', {
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
      return result.user;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUsers(): Promise<AdminUser[]> {
    try {
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

      return userProfiles?.map(profile => ({
        id: profile.user_id,
        employee_id: profile.employee_id || '',
        email: profile.email,
        status: profile.is_active ? 'active' : 'disabled',
        created_by_admin_id: '1', // TODO: Get from profile
        created_at: profile.created_at,
        employee: {
          id: profile.employees?.id || '',
          full_name: profile.employees?.full_name || profile.employees?.name || profile.display_name,
          email: profile.employees?.email || profile.email,
          department: profile.employees?.department || 'Unknown',
          job_title: profile.employees?.job_title || profile.employees?.position || 'User',
          date_of_joining: profile.employees?.date_of_joining || ''
        }
      })) || [];

    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      // Call backend API for user deletion
      const response = await fetch(`http://localhost:3001/api/admin/delete-user`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: Partial<CreateUserData>): Promise<void> {
    try {
      // Call backend API for user updates
      const response = await fetch(`http://localhost:3001/api/admin/update-user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, userData }),
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
}

export const adminService = new AdminService(); 
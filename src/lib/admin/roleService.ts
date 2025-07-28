import { supabase } from '@/integrations/supabase/client';

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  hierarchy_level: number;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  module_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  screen_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface RoleWithPermissions extends Role {
  permissions: RolePermission[];
}

export interface CreateRoleData {
  name: string;
  display_name: string;
  description?: string;
  permissions: {
    module_name: string;
    can_create: boolean;
    can_read: boolean;
    can_update: boolean;
    can_delete: boolean;
    screen_visible: boolean;
  }[];
}

export interface UpdateRoleData extends Partial<CreateRoleData> {
  id: string;
}

const API_BASE_URL = 'http://localhost:3001/api/admin';

// Get all roles
export const getRoles = async (): Promise<Role[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/roles`);
    if (!response.ok) {
      throw new Error('Failed to fetch roles');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching roles:', error);
    throw error;
  }
};

// Get role by ID with permissions
export const getRoleById = async (id: string): Promise<RoleWithPermissions> => {
  try {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch role');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching role:', error);
    throw error;
  }
};

// Create new role
export const createRole = async (roleData: CreateRoleData): Promise<Role> => {
  try {
    const response = await fetch(`${API_BASE_URL}/roles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create role');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating role:', error);
    throw error;
  }
};

// Update role
export const updateRole = async (roleData: UpdateRoleData): Promise<Role> => {
  try {
    const response = await fetch(`${API_BASE_URL}/roles/${roleData.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(roleData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update role');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating role:', error);
    throw error;
  }
};

// Delete role
export const deleteRole = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/roles/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete role');
    }
  } catch (error) {
    console.error('Error deleting role:', error);
    throw error;
  }
};

// Get all available modules
export const getModules = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/roles/modules/list`);
    if (!response.ok) {
      throw new Error('Failed to fetch modules');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching modules:', error);
    throw error;
  }
};

// Get user permissions
export const getUserPermissions = async (userId: string) => {
  try {
    const { data, error } = await supabase.rpc('get_user_permissions', {
      user_uuid: userId
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    throw error;
  }
};

// Check if user has specific permission
export const checkUserPermission = async (
  userId: string, 
  moduleName: string, 
  action: 'create' | 'read' | 'update' | 'delete' | 'visible'
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('user_has_permission', {
      user_uuid: userId,
      module_name: moduleName,
      action: action
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error checking user permission:', error);
    return false;
  }
}; 
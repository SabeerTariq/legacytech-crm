import apiClient from '@/lib/api/client';

export interface UserPermission {
  module_name: string;
  can_create: boolean;
  can_read: boolean;
  can_update: boolean;
  can_delete: boolean;
  screen_visible: boolean;
}

export const getUserPermissions = async (userId: string): Promise<UserPermission[]> => {
  try {
    console.log('🔍 PermissionService: Getting permissions for user:', userId);
    
    // Use the profile endpoint to get user permissions
    const response = await apiClient.getProfile();
    console.log('🔍 PermissionService: Profile response:', response);
    
    if (response.error) {
      console.error('❌ PermissionService: Error fetching user profile for permissions:', response.error);
      return [];
    }

    // Extract permissions from the profile response
    // The API returns { success: true, data: { permissions: [...] } }
    const userData = response.data || response;
    console.log('🔍 PermissionService: User data extracted:', userData);
    
    // Check if we have the correct data structure
    if (!userData || typeof userData !== 'object') {
      console.error('❌ PermissionService: Invalid user data structure');
      return [];
    }
    
    // Extract permissions array from the correct path
    const permissions = (userData as any).permissions || [];
    console.log('🔍 PermissionService: Permissions extracted:', permissions);
    
    // Log each permission for debugging
    if (permissions.length > 0) {
      permissions.forEach(perm => {
        console.log(`🔍 Permission: ${perm.module_name} - Visible: ${perm.screen_visible}, Read: ${perm.can_read}`);
      });
    } else {
      console.log('⚠️ PermissionService: No permissions found in response');
    }
    
    return permissions;
  } catch (error) {
    console.error('❌ PermissionService: Error in getUserPermissions:', error);
    return [];
  }
};

export const checkUserPermission = async (
  userId: string, 
  moduleName: string, 
  action: 'create' | 'read' | 'update' | 'delete' | 'visible'
): Promise<boolean> => {
  try {
    const permissions = await getUserPermissions(userId);
    const permission = permissions.find(p => p.module_name === moduleName);
    
    if (!permission) {
      return false;
    }
    
    switch (action) {
      case 'create':
        return permission.can_create;
      case 'read':
        return permission.can_read;
      case 'update':
        return permission.can_update;
      case 'delete':
        return permission.can_delete;
      case 'visible':
        return permission.screen_visible;
      default:
        return false;
    }
  } catch (error) {
    console.error('Error in checkUserPermission:', error);
    return false;
  }
}; 
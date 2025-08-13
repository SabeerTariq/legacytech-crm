import { supabase } from '@/integrations/supabase/client';

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
    const { data, error } = await supabase.rpc('get_user_permissions', {
      user_uuid: userId
    });

    if (error) {
      console.error('Error fetching user permissions:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUserPermissions:', error);
    return [];
  }
};

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
      console.error('Error checking user permission:', error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error('Error in checkUserPermission:', error);
    return false;
  }
}; 
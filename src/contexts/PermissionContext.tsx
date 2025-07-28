import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { Permission, PermissionContextType as OriginalPermissionContextType } from '@/types/permissions';

// Simplified permission context for admin access
interface PermissionContextType {
  permissions: Permission[];
  loading: boolean;
  canRead: (module: string) => boolean;
  canCreate: (module: string) => boolean;
  canUpdate: (module: string) => boolean;
  canDelete: (module: string) => boolean;
  isVisible: (module: string) => boolean;
  hasAnyPermission: (module: string) => boolean;
  refreshPermissions: () => Promise<void>;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        // Simplified: Admin gets all permissions for all modules
        if (user?.is_admin) {
          const allPermissions: Permission[] = [
            // Dashboard
            { id: 1, user_id: user.id, module_id: 1, can_create: true, can_read: true, can_update: true, can_delete: true, screen_visible: true },
            // Leads
            { id: 2, user_id: user.id, module_id: 2, can_create: true, can_read: true, can_update: true, can_delete: true, screen_visible: true },
            // Customers
            { id: 3, user_id: user.id, module_id: 3, can_create: true, can_read: true, can_update: true, can_delete: true, screen_visible: true },
            // Sales
            { id: 4, user_id: user.id, module_id: 4, can_create: true, can_read: true, can_update: true, can_delete: true, screen_visible: true },
            // Projects
            { id: 5, user_id: user.id, module_id: 5, can_create: true, can_read: true, can_update: true, can_delete: true, screen_visible: true },
            // Employees
            { id: 6, user_id: user.id, module_id: 6, can_create: true, can_read: true, can_update: true, can_delete: true, screen_visible: true },
            // Admin
            { id: 7, user_id: user.id, module_id: 7, can_create: true, can_read: true, can_update: true, can_delete: true, screen_visible: true },
          ];
          
          setPermissions(allPermissions);
          console.log('Admin permissions loaded:', allPermissions.length, 'permissions');
        } else {
          // Non-admin users get basic read permissions
          const basicPermissions: Permission[] = [
            { id: 1, user_id: user?.id || '', module_id: 1, can_create: false, can_read: true, can_update: false, can_delete: false, screen_visible: true },
            { id: 2, user_id: user?.id || '', module_id: 2, can_create: false, can_read: true, can_update: false, can_delete: false, screen_visible: true },
            { id: 3, user_id: user?.id || '', module_id: 3, can_create: false, can_read: true, can_update: false, can_delete: false, screen_visible: true },
          ];
          setPermissions(basicPermissions);
        }
      } catch (error) {
        console.error('Error loading permissions:', error);
        // Fallback to basic permissions
        setPermissions([
          { id: 1, user_id: user?.id || '', module_id: 1, can_create: false, can_read: true, can_update: false, can_delete: false, screen_visible: true },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadPermissions();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Permission checking functions - simplified for admin access
  const canRead = (module: string): boolean => {
    if (!user) return false;
    if (user.is_admin) return true; // Admin can read everything
    const permission = permissions.find(p => p.module?.name === module);
    return permission?.can_read || false;
  };

  const canCreate = (module: string): boolean => {
    if (!user) return false;
    if (user.is_admin) return true; // Admin can create everything
    const permission = permissions.find(p => p.module?.name === module);
    return permission?.can_create || false;
  };

  const canUpdate = (module: string): boolean => {
    if (!user) return false;
    if (user.is_admin) return true; // Admin can update everything
    const permission = permissions.find(p => p.module?.name === module);
    return permission?.can_update || false;
  };

  const canDelete = (module: string): boolean => {
    if (!user) return false;
    if (user.is_admin) return true; // Admin can delete everything
    const permission = permissions.find(p => p.module?.name === module);
    return permission?.can_delete || false;
  };

  const isVisible = (module: string): boolean => {
    if (!user) return false;
    if (user.is_admin) return true; // Admin can see everything
    const permission = permissions.find(p => p.module?.name === module);
    return permission?.screen_visible || false;
  };

  const hasAnyPermission = (module: string): boolean => {
    if (!user) return false;
    if (user.is_admin) return true; // Admin has all permissions
    const permission = permissions.find(p => p.module?.name === module);
    return !!(permission?.can_read || permission?.can_create || permission?.can_update || permission?.can_delete);
  };

  const refreshPermissions = async (): Promise<void> => {
    // Simplified - no need to refresh for admin
    console.log('Permissions refreshed');
  };

  const value: PermissionContextType = {
    permissions,
    loading,
    canRead,
    canCreate,
    canUpdate,
    canDelete,
    isVisible,
    hasAnyPermission,
    refreshPermissions,
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = (): PermissionContextType => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionProvider');
  }
  return context;
}; 
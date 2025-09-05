import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContextJWT';
import { getUserPermissions, type UserPermission } from '@/lib/permissions/permissionService';

interface PermissionContextType {
  permissions: UserPermission[];
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
  const [permissions, setPermissions] = useState<UserPermission[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPermissions = async () => {
    if (!user?.id) {
      console.log('PermissionContext: No user ID, clearing permissions');
      setPermissions([]);
      setLoading(false);
      return;
    }

    try {
      console.log('PermissionContext: Loading permissions for user:', user.id);
      setLoading(true);
      
      const userPermissions = await getUserPermissions(user.id);
      console.log('PermissionContext: Raw permissions from service:', userPermissions);
      
      // Check if front_sales permission exists
      const frontSalesPermission = userPermissions.find(p => p.module_name === 'front_sales');
      console.log('PermissionContext: Front sales permission:', frontSalesPermission);
      
      // Check leads permission specifically
      const leadsPermission = userPermissions.find(p => p.module_name === 'leads');
      console.log('PermissionContext: Leads permission:', leadsPermission);
      
      // Debug: Check upseller_management permission
      const upsellerManagementPermission = userPermissions.find(p => p.module_name === 'upseller_management');
      console.log('🔍 PermissionContext - upseller_management permission:', upsellerManagementPermission);
      console.log('🔍 PermissionContext - All permissions loaded:', userPermissions.map(p => ({ module: p.module_name, visible: p.screen_visible })));
      
      setPermissions(userPermissions);
      console.log('PermissionContext: Permissions set successfully, count:', userPermissions.length);
    } catch (error) {
      console.error('❌ PermissionContext: Error loading permissions:', error);
      setPermissions([]);
    } finally {
      setLoading(false);
      console.log('PermissionContext: Loading completed');
    }
  };

  useEffect(() => {
    loadPermissions();
  }, [user?.id]);

  // Permission checking functions
  const canRead = (module: string): boolean => {
    if (!user) {
      return false;
    }
    
    // Admin override: Admin users can read all modules
    if (user?.role?.name === 'admin') {
      return true;
    }
    
    const permission = permissions.find(p => p.module_name === module);
    return permission?.can_read || false;
  };

  const canCreate = (module: string): boolean => {
    if (!user) return false;
    
    // Admin override: Admin users can create in all modules
    if (user?.role?.name === 'admin') {
      return true;
    }
    
    const permission = permissions.find(p => p.module_name === module);
    return permission?.can_create || false;
  };

  const canUpdate = (module: string): boolean => {
    if (!user) return false;
    
    // Admin override: Admin users can update all modules
    if (user?.role?.name === 'admin') {
      return true;
    }
    
    const permission = permissions.find(p => p.module_name === module);
    return permission?.can_update || false;
  };

  const canDelete = (module: string): boolean => {
    if (!user) return false;
    
    // Admin override: Admin users can delete in all modules
    if (user?.role?.name === 'admin') {
      return true;
    }
    
    const permission = permissions.find(p => p.module_name === module);
    return permission?.can_delete || false;
  };

  const isVisible = (module: string): boolean => {
    if (!user) {
      return false;
    }
    
    // Admin override: Admin users can see all modules
    if (user?.role?.name === 'admin') {
      console.log(`🔓 Admin override: ${module} is visible for admin user`);
      return true;
    }
    
    const permission = permissions.find(p => p.module_name === module);
    
    // Debug: Log upseller_management visibility check
    if (module === 'upseller_management') {
      console.log('🔍 PermissionContext - isVisible check for upseller_management:', {
        module,
        permission,
        permissionsCount: permissions.length,
        allPermissions: permissions.map(p => ({ module: p.module_name, visible: p.screen_visible }))
      });
    }
    
    return permission?.screen_visible || false;
  };

  const hasAnyPermission = (module: string): boolean => {
    if (!user) return false;
    
    const permission = permissions.find(p => p.module_name === module);
    return !!(permission?.can_read || permission?.can_create || permission?.can_update || permission?.can_delete);
  };

  const refreshPermissions = async (): Promise<void> => {
    await loadPermissions();
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
import React from 'react';
import UserManagement from '@/components/admin/UserManagement';
import ModuleGuard from '@/components/auth/ModuleGuard';

const AdminUserManagement: React.FC = () => {
  return (
    <ModuleGuard module="user_management" action="read">
      <UserManagement />
    </ModuleGuard>
  );
};

export default AdminUserManagement; 
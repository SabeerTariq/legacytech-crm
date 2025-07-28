import React from 'react';

interface ModuleGuardProps {
  module: string;
  action: 'create' | 'read' | 'update' | 'delete';
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showFallback?: boolean;
}

const ModuleGuard: React.FC<ModuleGuardProps> = ({
  module,
  action,
  children,
  fallback,
  showFallback = false
}) => {
  // In the simplified admin-only system, always allow access
  return <>{children}</>;
};

export default ModuleGuard; 
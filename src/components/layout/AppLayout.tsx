
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Spinner } from '@/components/ui/spinner';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto" />
          <p className="mt-4 text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <AppHeader />
          <main className="flex-1 p-6 md:p-8 pt-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

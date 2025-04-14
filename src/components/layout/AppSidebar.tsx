
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import {
  Home,
  Users,
  DollarSign,
  Briefcase,
  BarChart,
  MessageSquare,
  Settings,
  LogOut,
  UserPlus,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export const AppSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Define main navigation items
  const navItems = [
    { title: 'Dashboard', path: '/', icon: Home },
    { title: 'Leads', path: '/leads', icon: UserPlus },
    { title: 'Customers', path: '/customers', icon: Users },
    { title: 'Sales', path: '/sales', icon: DollarSign },
    { title: 'Projects', path: '/projects', icon: Briefcase },
    { title: 'Performance', path: '/performance', icon: BarChart },
    { title: 'Messages', path: '/messages', icon: MessageSquare },
    { title: 'API Examples', path: '/examples', icon: Code },
  ];

  // Admin-only items
  const adminItems = [
    { title: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="px-4 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-teal text-white">
            <span className="text-lg font-bold">LT</span>
          </div>
          <span className="text-lg font-semibold text-white">Legacy Tech</span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                  >
                    <div className="flex w-full items-center gap-2">
                      <item.icon size={18} />
                      <span>{item.title}</span>
                      <Link to={item.path} className="absolute inset-0" />
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {user?.role === 'admin' && adminItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    isActive={location.pathname === item.path}
                  >
                    <div className="flex w-full items-center gap-2">
                      <item.icon size={18} />
                      <span>{item.title}</span>
                      <Link to={item.path} className="absolute inset-0" />
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            {user?.avatar && (
              <img
                src={user.avatar}
                alt={user.name}
                className="h-10 w-10 rounded-full border border-sidebar-accent"
              />
            )}
            <div className="text-sm">
              <p className="font-medium text-white">{user?.name}</p>
              <p className="text-sidebar-accent-foreground">{user?.role}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full border-sidebar-accent text-sidebar-accent-foreground hover:text-white"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

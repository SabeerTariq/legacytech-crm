
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Settings,
  FolderKanban,
  FileSpreadsheet,
  Zap,
  ClipboardList,
  DollarSign,
  Bot,
  RefreshCw,
  UserCheck,
  User,
  Repeat,
  TrendingUp,
  Briefcase,
  Target,
  Shield,
  Users2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { usePermissions } from "@/contexts/PermissionContext";
import { useAuth } from "@/contexts/AuthContext";
import { NAVIGATION_PERMISSIONS } from "@/types/permissions";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  module?: string; // Add module for permission checking
}

const NavigationMenu = () => {
  const location = useLocation();
  const { canRead, loading, isVisible, refreshPermissions } = usePermissions();
  const { user } = useAuth();

  console.log('NavigationMenu - User info:', {
    userEmail: user?.email,
    userRole: user?.role?.name,
    userRoleName: user?.role?.name
  });

  // Temporary debug function
  const debugPermissions = async () => {
    console.log('🔄 Force refreshing permissions...');
    await refreshPermissions();
    console.log('✅ Permissions refreshed');
  };

  const allNavItems: NavItem[] = [
    // Role-based main dashboard
    ...(user?.role?.name === 'front_sales' ? [
      { icon: BarChart3, label: "My Dashboard", path: "/front-seller-dashboard", module: "my_dashboard" }
    ] : user?.role?.name === 'upseller' ? [
      { icon: BarChart3, label: "My Dashboard", path: "/upseller-dashboard", module: "my_dashboard" }
    ] : [
      { icon: BarChart3, label: "Dashboard", path: "/", module: "dashboard" }
    ]),
    { icon: Users, label: "Leads", path: "/leads", module: "leads" },
    { icon: UserCheck, label: "Customers", path: "/customers", module: "customers" },
    { icon: ClipboardList, label: "Sales Form", path: "/sales-form", module: "sales_form" },
    { icon: TrendingUp, label: "Upsell", path: "/upsell", module: "upsell" },
    // Role-based additional dashboard links (only for admin) - removed duplicate path
    ...(user?.role?.name === 'admin' ? [
      { icon: TrendingUp, label: "Admin Dashboard", path: "/admin-dashboard", module: "dashboard" }
    ] : []),
    { icon: Users2, label: "Front Sales Management", path: "/front-sales-management", module: "front_sales_management" },
    { icon: Briefcase, label: "All Projects", path: "/projects", module: "projects" },
    { icon: FolderKanban, label: "Project Assignment", path: "/projects/assignment", module: "projects" },
    { icon: FolderKanban, label: "My Projects", path: "/projects/my-projects", module: "projects" },
    { icon: FolderKanban, label: "Kanban Board", path: "/kanban", module: "kanban" },
    { icon: DollarSign, label: "Payments", path: "/payments", module: "payments" },
    { icon: Repeat, label: "Recurring Services", path: "/recurring-services", module: "recurring_services" },
    { icon: MessageSquare, label: "Messages", path: "/messages", module: "messages" },
    { icon: Zap, label: "Automation", path: "/automation", module: "automation" },
    { icon: Calendar, label: "Calendar", path: "/calendar", module: "calendar" },
    { icon: FileText, label: "Documents", path: "/documents", module: "documents" },
    { icon: Bot, label: "Better Ask Saul", path: "/better-ask-saul", module: "better_ask_saul" },
    { icon: Settings, label: "Settings", path: "/settings", module: "settings" },
    // Department items
    { icon: FolderKanban, label: "Development", path: "/departments/development", module: "development" },
    { icon: FolderKanban, label: "Front Sales", path: "/departments/front-sales", module: "front_sales" },
    { icon: FolderKanban, label: "HR", path: "/departments/hr", module: "hr" },
    { icon: FolderKanban, label: "Marketing", path: "/departments/marketing", module: "marketing" },
    { icon: FolderKanban, label: "Other", path: "/departments/other", module: "other" },
    { icon: FolderKanban, label: "Production", path: "/departments/production", module: "production" },
    { icon: FolderKanban, label: "Upseller", path: "/departments/upseller", module: "upseller" },
    // HR items
    { icon: UserCheck, label: "Employees", path: "/hr/employees", module: "employees" },
    { icon: Shield, label: "User Management", path: "/admin/users", module: "user_management" },
    { icon: Shield, label: "Role Management", path: "/admin/roles", module: "role_management" },
    { icon: Target, label: "Upseller Management", path: "/admin/upseller-management", module: "upseller_management" },
  ];

  console.log('NavigationMenu - Initial allNavItems:', allNavItems.map(item => ({ label: item.label, module: item.module })));
  
  // Debug: Check if My Dashboard is in the initial array
  const myDashboardInInitial = allNavItems.find(item => item.label === "My Dashboard");
  console.log('My Dashboard in initial array:', !!myDashboardInInitial, myDashboardInInitial);

  // Filter nav items based on permissions
  const filterNavItems = (items: NavItem[]) => {
    console.log('NavigationMenu - Debug Info:', {
      loading,
      userRole: user?.role?.name,
      userEmail: user?.email,
      totalItems: items.length
    });
    
    // If permissions are still loading, show all items to prevent flickering
    if (loading) {
      console.log('Permissions loading, showing all items');
      return items;
    }
    
    const filtered = items.filter(item => {
      if (!item.module) {
        console.log(`Item ${item.label} has no module, showing`);
        return true; // Show items without module restrictions
      }
      
      // Special case: Always show My Dashboard for front_sales and upseller users
      if (item.label === "My Dashboard" && (user?.role?.name === 'front_sales' || user?.role?.name === 'upseller')) {
        console.log(`Special case: My Dashboard always visible for ${user?.role?.name} users`);
        return true;
      }
      
      // Debug: Check why My Dashboard might be filtered out
      if (item.label === "My Dashboard") {
        console.log(`Debug My Dashboard: user role = ${user?.role?.name}, isVisible(${item.module}) = ${isVisible(item.module)}`);
      }
      
      // Special debugging for upseller_management
      if (item.module === 'upseller_management') {
        console.log(`🔍 Debugging upseller_management:`, {
          label: item.label,
          module: item.module,
          userRole: user?.role?.name,
          isVisibleResult: isVisible(item.module),
          permissionsLoading: loading
        });
      }
      
      const visible = isVisible(item.module);
      console.log(`Item ${item.label} (${item.module}): ${visible ? 'SHOWING' : 'HIDDEN'}`);
      return visible;
    });
    
    console.log('Final filtered items:', filtered.map(item => item.label));
    return filtered;
  };

  let filteredNavItems = filterNavItems(allNavItems);
  
  // Force include My Dashboard for front_sales users if not already present
  if (user?.role?.name === 'front_sales' && !filteredNavItems.find(item => item.label === "My Dashboard")) {
    console.log('Forcing My Dashboard for front_sales user');
    filteredNavItems = [
      { icon: BarChart3, label: "My Dashboard", path: "/front-seller-dashboard", module: "my_dashboard" },
      ...filteredNavItems
    ];
  }

  // Force include My Dashboard for upseller users if not already present
  if (user?.role?.name === 'upseller' && !filteredNavItems.find(item => item.label === "My Dashboard")) {
    console.log('Forcing My Dashboard for upseller user');
    filteredNavItems = [
      { icon: BarChart3, label: "My Dashboard", path: "/upseller-dashboard", module: "my_dashboard" },
      ...filteredNavItems
    ];
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent>
        {/* Temporary debug button */}
        {user?.role?.name === 'admin' && (
          <div className="p-2 border-b border-gray-200">
            <button
              onClick={debugPermissions}
              className="w-full px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              🔄 Debug: Refresh Permissions
            </button>
          </div>
        )}
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.path}>
              <SidebarMenuButton asChild>
                <Link 
                  to={item.path} 
                  className={cn(
                    "flex items-center gap-2",
                    location.pathname === item.path && "bg-accent text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};

export default NavigationMenu;



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
  Bug,
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
import { NAVIGATION_PERMISSIONS } from "@/types/permissions";

interface NavItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  path: string;
  module?: string; // Add module for permission checking
}

const NavigationMenu = () => {
  const location = useLocation();
  const { canRead, loading, isVisible } = usePermissions();

  const mainNavItems: NavItem[] = [
    { icon: BarChart3, label: "Dashboard", path: "/", module: "dashboard" },
    { icon: Users, label: "Leads", path: "/leads", module: "leads" },
    { icon: UserCheck, label: "Customers", path: "/customers", module: "customers" },
    { icon: ClipboardList, label: "Sales Form", path: "/sales-form", module: "sales" },
    { icon: TrendingUp, label: "Upsell", path: "/upsell", module: "upsell" },
    { icon: TrendingUp, label: "My Dashboard", path: "/front-seller-dashboard", module: "my_dashboard" },
    { icon: Users2, label: "Front Sales Management", path: "/front-sales-management", module: "front_sales_management" },
    { icon: Briefcase, label: "All Projects", path: "/projects", module: "projects" },
    { icon: FolderKanban, label: "Project Assignment", path: "/projects/assignment", module: "projects" },
    { icon: FolderKanban, label: "My Projects", path: "/projects/my-projects", module: "projects" },
    { icon: FolderKanban, label: "Kanban Board", path: "/kanban", module: "kanban" },
    { icon: DollarSign, label: "Payments", path: "/payments", module: "payments" },
    { icon: Repeat, label: "Recurring Services", path: "/recurring-services", module: "recurring_services" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: Zap, label: "Automation", path: "/automation" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: FileText, label: "Documents", path: "/documents" },
    { icon: Bot, label: "Better Ask Saul", path: "/better-ask-saul" },
    { icon: User, label: "My Profile", path: "/profile" },
    { icon: Bug, label: "Debug", path: "/debug" },
  ];
  
  const departmentsNavItems = [
    { icon: FolderKanban, label: "Development", path: "/departments/development" },
    { icon: FolderKanban, label: "Front Sales", path: "/departments/front-sales" },
    { icon: FolderKanban, label: "HR", path: "/departments/hr" },
    { icon: FolderKanban, label: "Marketing", path: "/departments/marketing" },
    { icon: FolderKanban, label: "Other", path: "/departments/other" },
    { icon: FolderKanban, label: "Production", path: "/departments/production" },
    { icon: FolderKanban, label: "Upseller", path: "/departments/upseller" },
  ];

  const renewalsNavItems = [
    { icon: RefreshCw, label: "Active Renewals", path: "/renewals/active" },
    { icon: RefreshCw, label: "Pending Renewals", path: "/renewals/pending" },
    { icon: RefreshCw, label: "Renewal History", path: "/renewals/history" },
  ];

  const hrNavItems = [
    { icon: UserCheck, label: "Employees", path: "/hr/employees", module: "employees" },
    { icon: Shield, label: "User Management", path: "/admin/users", module: "user_management" },
    { icon: Shield, label: "Role Management", path: "/admin/roles", module: "role_management" },
    { icon: UserCheck, label: "Recruitment", path: "/hr/recruitment" },
    { icon: UserCheck, label: "Performance", path: "/hr/performance" },
    { icon: UserCheck, label: "Benefits", path: "/hr/benefits" },
  ];

  // Filter nav items based on permissions
  const filterNavItems = (items: NavItem[]) => {
    // If permissions are still loading, show all items to prevent flickering
    if (loading) {
      return items;
    }
    
    return items.filter(item => {
      if (!item.module) return true; // Show items without module restrictions
      return isVisible(item.module);
    });
  };

  const filteredMainNavItems = filterNavItems(mainNavItems);
  const filteredHrNavItems = filterNavItems(hrNavItems);

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Main</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {filteredMainNavItems.map((item) => (
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
      
      <SidebarGroup>
        <SidebarGroupLabel>Departments</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {departmentsNavItems.map((item) => (
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

      <SidebarGroup>
        <SidebarGroupLabel>Renewals</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {renewalsNavItems.map((item) => (
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

      <SidebarGroup>
        <SidebarGroupLabel>HR</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {filteredHrNavItems.map((item) => (
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
      
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link 
                  to="/settings" 
                  className={cn(
                    "flex items-center gap-2",
                    location.pathname === "/settings" && "bg-accent text-accent-foreground"
                  )}
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
};

export default NavigationMenu;


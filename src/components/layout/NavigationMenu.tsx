import React from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  Briefcase, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Settings,
  KanbanSquare,
  FolderKanban,
  FileSpreadsheet,
  Zap,
  ClipboardList  // Added for Sales Disposition form
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

const NavigationMenu = () => {
  const location = useLocation();
  
  const mainNavItems = [
    { icon: BarChart3, label: "Dashboard", path: "/" },
    { icon: Users, label: "Leads", path: "/leads" },
    { icon: ClipboardList, label: "Sales Form", path: "/sales-form" }, // Moved here
    { icon: Briefcase, label: "Projects", path: "/projects" },
    { icon: KanbanSquare, label: "Tasks", path: "/tasks" },
    { icon: MessageSquare, label: "Messages", path: "/messages" },
    { icon: Zap, label: "Automation", path: "/automation" },
    { icon: Calendar, label: "Calendar", path: "/calendar" },
    { icon: FileText, label: "Documents", path: "/documents" },
  ];
  
  const departmentsNavItems = [
    { icon: FolderKanban, label: "Design", path: "/departments/design" },
    { icon: FolderKanban, label: "Development", path: "/departments/development" },
    { icon: FolderKanban, label: "Marketing", path: "/departments/marketing" },
    { icon: FolderKanban, label: "Content", path: "/departments/content" },
  ];

  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Main</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {mainNavItems.map((item) => (
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

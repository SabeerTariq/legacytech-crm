
import React, { useState, useEffect } from "react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Menu, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import NavigationMenu from "@/components/layout/NavigationMenu";
import { useAuth } from "@/contexts/AuthContextJWT";
import { removeBackgroundFromImage } from "@/utils/imageUtils";
import BrandSelector from "./BrandSelector";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const [logoSrc, setLogoSrc] = useState("/lovable-uploads/7384a9eb-2ebd-4c5e-88fc-269cd741a97a.png");

  useEffect(() => {
    const processLogo = async () => {
      const transparentLogo = await removeBackgroundFromImage(logoSrc);
      if (transparentLogo) {
        setLogoSrc(transparentLogo);
      }
    };

    processLogo();
  }, []);
  
  // Get user initials from name or email
  const getUserInitials = () => {
    if (!user) return "US";
    
    if (user.employee?.name) {
      return user.employee.name
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    
    return user.email?.substring(0, 2).toUpperCase() || "US";
  };

  const handleSignOut = async () => {
    await logout();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="border-r">
          <SidebarHeader className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="rounded-md p-1.5">
                <img 
                  src={logoSrc} 
                  alt="LogicWorks CRM Logo" 
                  className="h-10 w-10"
                />
              </div>
              <div className="font-bold text-xl">LogicWorks CRM</div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <NavigationMenu />
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback>{getUserInitials()}</AvatarFallback>
                </Avatar>
                <div className="text-sm font-medium">
                  {user?.employee?.name || user?.email?.split('@')[0] || "User"}
                </div>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Log Out</TooltipContent>
              </Tooltip>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="h-14 border-b flex items-center justify-between px-6">
            <div className="flex items-center">
              <SidebarTrigger>
                <Menu className="h-5 w-5" />
              </SidebarTrigger>
            </div>
            <div className="flex items-center space-x-4">
              <BrandSelector />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <MessageCircle className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Messages</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Notifications</TooltipContent>
              </Tooltip>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;

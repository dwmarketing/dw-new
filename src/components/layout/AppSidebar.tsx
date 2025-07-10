
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter } from "@/components/ui/sidebar";
import { BarChart3, Users, Settings, Bot } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { usePermissions } from "@/hooks/usePermissions";
import { UserAvatar } from "./UserAvatar";

const menuItems = [
  {
    title: "Performance",
    url: "/dashboard",
    icon: BarChart3,
    permission: "dashboard"
  },
  {
    title: "Agente de IA - Copy",
    url: "/ai-agents",
    icon: Bot,
    permission: "ai-agents"
  },
  {
    title: "Business Managers",
    url: "/business-managers",
    icon: Settings,
    permission: "business-managers"
  },
  {
    title: "Usuários",
    url: "/users",
    icon: Users,
    permission: "users"
  },
  {
    title: "Configurações",
    url: "/settings",
    icon: Settings,
    permission: "settings"
  }
];

export function AppSidebar() {
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { canAccessPage, loading } = usePermissions();
  
  // Filter menu items based on permissions
  const filteredMenuItems = menuItems.filter(item => {
    if (loading) return false;
    return canAccessPage(item.permission);
  });
  
  return (
    <Sidebar className="bg-slate-950 border-slate-800">
      <SidebarHeader className="p-6 bg-slate-900 flex items-center justify-center">
        <img 
          src="/lovable-uploads/29f409d4-c2a9-4ea6-bca2-cd311948bf55.png" 
          alt="Logo da Empresa" 
          className="h-32 w-auto max-w-[70%] object-contain" 
        />
      </SidebarHeader>
      <SidebarContent className="bg-slate-900">
        <SidebarGroup>
          <SidebarGroupLabel className="text-slate-100">Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="text-slate-100 hover:text-white hover:bg-slate-800 data-[state=active]:bg-slate-700 data-[state=active]:text-white"
                  >
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 bg-slate-900">
        <UserAvatar />
      </SidebarFooter>
    </Sidebar>
  );
}

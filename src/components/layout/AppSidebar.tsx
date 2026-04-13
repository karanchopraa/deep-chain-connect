import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  FileInput,
  Network,
  Package,
  Landmark,
  Shield,
  Anchor,
} from "lucide-react";
import { useRole, UserRole } from "@/contexts/RoleContext";

import { Database, Fingerprint } from "lucide-react";

const navItems: { title: string; url: string; icon: any; roles: UserRole[] }[] = [
  { title: "Captain Dashboard", url: "/dashboard", icon: LayoutDashboard, roles: ["admin"] },
  { title: "Event Logging", url: "/events", icon: FileInput, roles: ["admin", "supplier", "processor", "logistics", "buyer", "financier"] },
  { title: "Transaction Hub", url: "/transactions", icon: Database, roles: ["admin", "buyer", "supplier", "processor", "logistics", "financier"] },
  { title: "Network Governance", url: "/network", icon: Network, roles: ["admin"] },
  { title: "Consortium Inventory", url: "/inventory", icon: Package, roles: ["admin", "buyer", "supplier", "processor"] },
  { title: "Traceability Lifecycle", url: "/traceability", icon: Fingerprint, roles: ["admin", "buyer", "supplier", "processor", "logistics", "financier"] },
  { title: "Settlements", url: "/settlements", icon: Landmark, roles: ["admin", "buyer", "supplier", "financier"] },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { role } = useRole();

  const filteredItems = navItems.filter((item) => item.roles.includes(role));

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-captain flex items-center justify-center">
            <Anchor className="w-4 h-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-sm font-bold text-sidebar-foreground tracking-tight">WOW Platform</span>
              <span className="text-[10px] text-sidebar-foreground/50 uppercase tracking-widest">Consortium</span>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase text-[10px] tracking-widest">
            {!collapsed && "Navigation"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/40 uppercase text-[10px] tracking-widest">
            {!collapsed && "Security"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <div className="flex items-center gap-2 text-sidebar-foreground/40 px-2 py-1.5 cursor-default">
                    <Shield className="h-4 w-4" />
                    {!collapsed && (
                      <div className="flex flex-col">
                        <span className="text-[10px]">Hyperledger Fabric</span>
                        <span className="text-[9px] text-emerald">● Connected</span>
                      </div>
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

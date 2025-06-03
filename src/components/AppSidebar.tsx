
import { Link, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { 
  ShoppingCart, 
  Package, 
  ClipboardList, 
  FileText, 
  Disc, 
  Shield, 
  FileCheck, 
  List, 
  Settings, 
  LogOut,
  Building,
  Truck,
  RotateCcw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";

const navigationItems = [
  {
    title: "New Transfer Request",
    url: "/",
    icon: ShoppingCart,
  },
  {
    title: "MTO Form",
    url: "/mto-order",
    icon: Package,
  },
  {
    title: "Order Tracking",
    url: "/order-management",
    icon: ClipboardList,
  },
  {
    title: "Cross-Dock Printable Forms",
    url: "/cross-dock",
    icon: FileText,
  },
  {
    title: "Wheel Refurb Order",
    url: "/wheel-order",
    icon: Disc,
  },
  {
    title: "Warranty: Local Retread Form",
    url: "/retread-warranty",
    icon: Shield,
  },
  {
    title: "Warranty: National Account Form",
    url: "/national-warranty",
    icon: FileCheck,
  },
  {
    title: "Approved Tire Tread List",
    url: "/approved-treads",
    icon: List,
  },
];

const adminItems = [
  {
    title: "Admin Inventory",
    url: "/admin-inventory",
    icon: Building,
  },
  {
    title: "Admin Orders",
    url: "/admin-orders",
    icon: Truck,
  },
  {
    title: "All Orders",
    url: "/all-orders",
    icon: ClipboardList,
  },
  {
    title: "Pending Orders",
    url: "/pending-orders",
    icon: RotateCcw,
  },
  {
    title: "Completed Orders",
    url: "/completed-orders",
    icon: FileCheck,
  },
];

const bottomItems = [
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const { selectedPlant } = usePlant();

  const handleLogout = () => {
    logout();
  };

  return (
    <Sidebar side="right" className="border-l">
      <SidebarContent>
        {/* Plant Info */}
        <SidebarGroup>
          <SidebarGroupLabel>Current Plant</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-md">
              <Building className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">{selectedPlant}</span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin Navigation */}
        {user?.isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                      <Link to={item.url}>
                        <item.icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupLabel>Preferences</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location.pathname === item.url}>
                    <Link to={item.url}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with Logout */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

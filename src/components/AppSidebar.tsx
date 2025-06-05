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
  Home,
  ShoppingCart, 
  Package, 
  ClipboardList, 
  FileText, 
  Disc, 
  Shield, 
  List, 
  Settings, 
  LogOut,
  Building,
  Truck,
  RotateCcw,
  Search,
  AlertTriangle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";

const navigationItems = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "New Transfer Request",
    url: "/transfer-request",
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
    title: "Customer Complaint Form",
    url: "/complaint-tracking",
    icon: AlertTriangle,
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
    icon: FileText,
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
    <Sidebar 
      side="right" 
      className="border-l-0 shadow-2xl"
      style={{
        background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 50%, #1E40AF 100%)",
        borderRadius: "12px 0 0 12px"
      }}
    >
      <SidebarContent className="bg-transparent">
        {/* Plant Info */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-100 font-semibold">Current Plant</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center gap-2 p-3 bg-blue-600/40 rounded-lg backdrop-blur-sm border border-blue-400/30">
              <Building className="w-4 h-4 text-blue-200" />
              <span className="text-sm font-medium text-blue-100">{selectedPlant}</span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-100 font-semibold">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="text-blue-100 hover:bg-blue-500/30 hover:text-white data-[active=true]:bg-blue-500/50 data-[active=true]:text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-blue-400/30"
                  >
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
            <SidebarGroupLabel className="text-blue-100 font-semibold">Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                      className="text-blue-100 hover:bg-blue-500/30 hover:text-white data-[active=true]:bg-blue-500/50 data-[active=true]:text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-blue-400/30"
                    >
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
          <SidebarGroupLabel className="text-blue-100 font-semibold">Preferences</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="text-blue-100 hover:bg-blue-500/30 hover:text-white data-[active=true]:bg-blue-500/50 data-[active=true]:text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-blue-400/30"
                  >
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

      {/* Footer with User Info and Logout */}
      <SidebarFooter className="bg-transparent border-t border-blue-400/30">
        {user && (
          <div className="p-3 mb-2 bg-blue-600/40 rounded-lg backdrop-blur-sm border border-blue-400/30">
            <div className="text-xs text-blue-200 mb-1">Logged in as:</div>
            <div className="text-sm font-medium text-blue-100">{user.name}</div>
            <div className="text-xs text-blue-300">{user.storeName}</div>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={handleLogout}
              className="text-blue-100 hover:bg-red-500/30 hover:text-white rounded-lg transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-red-400/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}


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
  AlertTriangle,
  MessageSquare,
  Users,
  Mail,
  Globe,
  Network
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { hasRegionalOrderingAccess } from "@/utils/regionalOrderingAccess";

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
  {
    title: "Plant Broadcasts",
    url: "/plant-broadcasts",
    icon: Globe,
  },
];

// Regional ordering for management roles
const regionalOrderingItems = [
  {
    title: "Regional Ordering",
    url: "/regional-ordering",
    icon: Network,
  },
];

// Add My Complaints for non-admin users
const storeUserItems = [
  {
    title: "My Complaints",
    url: "/my-complaints",
    icon: MessageSquare,
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

// Super Admin only items
const superAdminItems = [
  {
    title: "User Management",
    url: "/user-management",
    icon: Users,
  },
  {
    title: "Email Routing",
    url: "/admin/email-routing",
    icon: Mail,
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
        {/* TEMPORARILY HIDDEN: Plant Info to avoid confusion during transition to mandatory form-specific plant selectors */}
        {/* Each order form now has its own required "Destination Plant" dropdown that overrides this display */}
        {/* 
        <SidebarGroup>
          <SidebarGroupLabel className="text-blue-100 font-semibold">Current Plant</SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="flex items-center gap-2 p-3 bg-blue-600/40 rounded-lg backdrop-blur-sm border border-blue-400/30">
              <Building className="w-4 h-4 text-blue-200" />
              <span className="text-sm font-medium text-blue-100">{selectedPlant}</span>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
        */}

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

        {/* Regional Ordering for Management Roles */}
        {hasRegionalOrderingAccess(user) && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-blue-100 font-semibold">Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {regionalOrderingItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                     <SidebarMenuButton 
                       asChild 
                       isActive={location.pathname === item.url}
                       className="text-orange-200 hover:bg-orange-500/30 hover:text-orange-100 data-[active=true]:bg-orange-500/50 data-[active=true]:text-orange-100 rounded-lg transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-orange-400/30"
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

        {/* Store User Navigation */}
        {user && !user.isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-blue-100 font-semibold">My Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {storeUserItems.map((item) => (
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

        {/* Super Admin Navigation */}
        {user?.email?.toLowerCase() === 'roderickdemarais@aol.com' && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-blue-100 font-semibold">Super Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {superAdminItems.map((item) => (
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

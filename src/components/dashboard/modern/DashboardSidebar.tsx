import { Home, FileText, Package, Shield, Wrench, Settings, UserCog } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  icon: React.ElementType;
  path: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },
  { title: "Make a Request", icon: FileText, path: "/dashboard#make-request" },
  { title: "Orders & Transfers", icon: Package, path: "/dashboard#orders" },
  { title: "Warranty", icon: Shield, path: "/warranty-submission" },
  { title: "Wheel Services", icon: Wrench, path: "/powder-coat-request" },
  { title: "Tools & Resources", icon: Settings, path: "/dashboard#tools" },
  { title: "Admin Dashboard", icon: UserCog, path: "/dashboard#admin", adminOnly: true },
];

export function DashboardSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNavigation = (path: string) => {
    if (path.includes("#")) {
      const [route, hash] = path.split("#");
      if (route === location.pathname) {
        // Same page, scroll to section
        const element = document.getElementById(hash);
        element?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate(path);
      }
    } else {
      navigate(path);
    }
  };

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" && !location.hash;
    }
    return location.pathname + location.hash === path || location.pathname === path;
  };

  const filteredNavItems = navItems.filter(
    (item) => !item.adminOnly || (item.adminOnly && user?.isAdmin)
  );

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-xl">C</span>
          </div>
          <span className="text-lg font-semibold">Conlan Tire</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{item.title}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

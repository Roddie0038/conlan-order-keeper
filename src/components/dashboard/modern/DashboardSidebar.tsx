import { Home, FileText, Package, Shield, Wrench, Settings, UserCog, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

interface NavItem {
  title: string;
  icon: React.ElementType;
  path: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { title: "Dashboard", icon: Home, path: ROUTES.dashboard },
  { title: "Make a Request", icon: FileText, path: `${ROUTES.dashboard}#make-request` },
  { title: "Orders & Transfers", icon: Package, path: `${ROUTES.dashboard}#orders` },
  { title: "Warranty", icon: Shield, path: ROUTES.warrantySubmission },
  { title: "Wheel Services", icon: Wrench, path: ROUTES.wheelPowderCoat },
  { title: "Tools & Resources", icon: Settings, path: `${ROUTES.dashboard}#tools` },
  { title: "Admin Dashboard", icon: UserCog, path: `${ROUTES.dashboard}#admin`, adminOnly: true },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function DashboardSidebar({ isOpen = true, onClose }: DashboardSidebarProps) {
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
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-64 flex flex-col transition-transform duration-300 lg:translate-x-0",
          "bg-gradient-to-b from-slate-900/95 to-slate-900/98 backdrop-blur-xl border-r border-white/10 shadow-2xl shadow-black/50",
          !isOpen && "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/30">
                <span className="text-white font-bold text-xl">C</span>
              </div>
              <span className="text-lg font-semibold text-white">Conlan Tire</span>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={onClose}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => {
                  handleNavigation(item.path);
                  onClose?.();
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all",
                  active
                    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/30 translate-x-1"
                    : "text-slate-300 hover:bg-white/5 hover:text-white hover:translate-x-1"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

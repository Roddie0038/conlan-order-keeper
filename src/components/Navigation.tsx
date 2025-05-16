
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { DarkModeToggle } from "./DarkModeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { LayoutDashboard, Database, ClipboardList, ShoppingCart, Disc, Building, Package } from "lucide-react";

// Define an interface for the link item to include the highlight property
interface NavLink {
  href: string;
  label: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}

export function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const { user } = useAuth();
  const { selectedPlant } = usePlant();

  const links: NavLink[] = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4 mr-2" /> },
    { href: "/pending-orders", label: "New Order", icon: <ShoppingCart className="w-4 h-4 mr-2" /> },
    { href: "/order-management", label: "Order Management", icon: <ClipboardList className="w-4 h-4 mr-2" /> },
    { href: "/mto-order", label: "MTO Orders" },
    { href: "/cross-dock", label: "Cross Dock Paperwork" },
    { href: "/wheel-order", label: "Wheel Powder Coating", icon: <Disc className="w-4 h-4 mr-2" /> },
  ];

  // Add admin-specific links
  if (user?.isAdmin) {
    links.push(
      { href: "/admin-inventory", label: "Inventory Management" },
      { 
        href: "/admin-orders", 
        label: "Admin Order Management", 
        icon: <ClipboardList className="w-4 h-4 mr-2" />,
        highlight: true
      }
    );
  }

  return (
    <nav className="bg-[#1e40af] dark:bg-gray-900 shadow-sm">
      <div className="container mx-auto px-4 bg-zinc-600 hover:bg-zinc-500 dark:bg-gray-800 dark:hover:bg-gray-700">
        <div className="flex h-16 items-center justify-between overflow-x-auto">
          <div className="flex space-x-4 md:space-x-8">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-bold text-white rounded-md transition-colors flex items-center whitespace-nowrap",
                  isActive(link.href)
                    ? "bg-[#0ea5e9] text-white dark:bg-blue-600"
                    : link.highlight
                      ? "bg-amber-500 hover:bg-amber-600 dark:bg-amber-600 dark:hover:bg-amber-700"
                      : "hover:bg-[#0ea5e9] hover:text-white dark:hover:bg-blue-600"
                )}
              >
                {link.icon && link.icon}
                {link.label}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 py-1 px-3 bg-blue-800 text-white rounded-full border border-blue-500">
              <Building className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-bold text-amber-400">{selectedPlant}</span>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}

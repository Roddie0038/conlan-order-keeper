
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

export function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const links = [
    {
      href: "/pending-orders",
      label: "New Order",
    },
    {
      href: "/all-pending-orders",
      label: "All Pending Orders",
    },
    {
      href: "/mto-order",
      label: "MTO Orders",
    },
    {
      href: "/completed-orders",
      label: "Completed Orders",
    },
    {
      href: "/cross-dock",
      label: "Cross Dock Paperwork",
    },
  ];

  return (
    <nav className="bg-[#1e40af] dark:bg-slate-800 shadow-sm">
      <div className="container mx-auto px-4 bg-zinc-600 hover:bg-zinc-500 dark:bg-slate-700 dark:hover:bg-slate-600">
        <div className="flex items-center justify-between h-16">
          <div className="flex space-x-8 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  "px-3 py-2 text-sm font-bold text-white rounded-md transition-colors",
                  isActive(link.href)
                    ? "bg-[#0ea5e9] text-white dark:bg-blue-600"
                    : "hover:bg-[#0ea5e9] hover:text-white dark:hover:bg-blue-600"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}

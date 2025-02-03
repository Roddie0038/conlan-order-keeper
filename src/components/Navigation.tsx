import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export function Navigation() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const links = [
    { href: "/pending-orders", label: "New Order" },
    { href: "/mto-order", label: "MTO Orders" },
    { href: "/completed-orders", label: "Completed Orders" },
  ];

  return (
    <nav className="bg-[#FF8C00] shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex space-x-8 h-16 items-center">
          {links.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "px-3 py-2 text-sm font-bold text-black rounded-md transition-colors",
                isActive(link.href)
                  ? "bg-primary text-primary-foreground"
                  : "hover:text-primary hover:bg-accent"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
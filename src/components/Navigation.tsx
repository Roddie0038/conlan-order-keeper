import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
export function Navigation() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const links = [{
    href: "/pending-orders",
    label: "New Order"
  }, {
    href: "/all-pending-orders",
    label: "All Pending Orders"
  }, {
    href: "/mto-order",
    label: "MTO Orders"
  }, {
    href: "/completed-orders",
    label: "Completed Orders"
  }, {
    href: "/cross-dock",
    label: "Cross Dock Paperwork"
  }];
  return <nav className="bg-[#1e40af] shadow-sm">
      <div className="container mx-auto px-4 bg-zinc-600 hover:bg-zinc-500">
        <div className="flex space-x-8 h-16 items-center bg-zinc-600 hover:bg-zinc-500">
          {links.map(link => <Link key={link.href} to={link.href} className={cn("px-3 py-2 text-sm font-bold text-white rounded-md transition-colors", isActive(link.href) ? "bg-[#0ea5e9] text-white" : "hover:bg-[#0ea5e9] hover:text-white")}>
              {link.label}
            </Link>)}
        </div>
      </div>
    </nav>;
}
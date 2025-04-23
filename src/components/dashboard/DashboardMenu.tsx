
// Add "ALL ORDERS" menu item visible only for admin (already done but add adminOnly flag for clarity)

import { Box, Package, CheckSquare, Database, Truck, Disc, ClipboardList } from "lucide-react";
import { MenuCard, MenuItemProps } from "./MenuCard";
import { useAuth } from "@/contexts/AuthContext";

interface DashboardMenuProps {
  loaded: boolean;
}

export function DashboardMenu({ loaded }: DashboardMenuProps) {
  const { user } = useAuth();
  
  const menuItems: MenuItemProps[] = [
    {
      title: "NEW ORDER",
      icon: null,
      path: "/pending-orders",
      color: "",
      borderColor: "border-yellow-500",
      delay: 0.1,
      size: "col-span-1",
      hideTitle: true,
      fullSizeImage: true,
      backgroundImage: "/lovable-uploads/b866e767-c11e-42b3-8973-1e01be98c454.png"
    },
    {
      title: "MTO",
      icon: null,
      path: "/mto-order",
      color: "",
      borderColor: "border-blue-400",
      delay: 0.2,
      size: "col-span-1",
      hideTitle: true,
      fullSizeImage: true,
      backgroundImage: "/lovable-uploads/9f69d8f3-d46e-4cb7-9aa4-c71919921d67.png"
    },
    {
      title: "ORDER MANAGEMENT",
      icon: null,
      path: "/order-management",
      color: "",
      borderColor: "border-yellow-400",
      delay: 0.3,
      size: "col-span-1",
      highlight: true,
      hideTitle: true,
      fullSizeImage: true,
      backgroundImage: "/lovable-uploads/7f6dce61-94af-46e1-9797-99bc1808efa9.png"
    },
    {
      title: "CROSS DOCK",
      icon: null,
      path: "/cross-dock",
      color: "",
      borderColor: "border-green-400",
      delay: 0.4,
      size: "col-span-1",
      hideTitle: true,
      fullSizeImage: true,
      backgroundImage: "/lovable-uploads/621af873-8fbf-44ed-8587-a590c85a7b53.png"
    },
    {
      title: "WHEEL REFURB ORDER",
      icon: null,
      path: "/wheel-order",
      color: "",
      borderColor: "border-[#2F9599]",
      delay: 0.5,
      size: "col-span-1",
      hideTitle: true,
      fullSizeImage: true,
      backgroundImage: "/lovable-uploads/8d829cab-7b94-46fc-9281-84ee33a52d3c.png"
    }
  ];
  
  // Admin-only "ALL ORDERS" card uses the supplied dashboard image
  if (user?.isAdmin) {
    menuItems.push({
      title: "ALL ORDERS",
      icon: null, // We show just the image
      path: "/admin-orders",
      color: "",
      borderColor: "border-amber-400",
      delay: 0.6,
      size: "col-span-1",
      highlight: true,
      adminOnly: true,
      backgroundImage: "/lovable-uploads/4fb3a709-c374-4a11-a611-16b4857831b7.png", // Using the image provided
      fullSizeImage: true,
      hideTitle: true,
    });
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {menuItems.map((item) => (
        (!item.adminOnly || (user?.isAdmin)) && <MenuCard key={item.title} item={item} loaded={loaded} />
      ))}
    </div>
  );
}

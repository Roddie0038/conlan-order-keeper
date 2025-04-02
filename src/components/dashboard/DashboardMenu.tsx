
import { Box, Package, CheckSquare, Database, Truck, Disc, ClipboardList } from "lucide-react";
import { MenuCard, MenuItemProps } from "./MenuCard";

interface DashboardMenuProps {
  loaded: boolean;
}

export function DashboardMenu({ loaded }: DashboardMenuProps) {
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
      icon: <Package size={36} className="text-white drop-shadow-sm" />,
      path: "/mto-order",
      color: "from-blue-500 to-purple-900",
      borderColor: "border-blue-400",
      delay: 0.2,
      size: "col-span-1",
      backgroundImage: "/lovable-uploads/9323845a-ce1e-4487-bfb4-a5abab06965f.png"
    },
    {
      title: "ORDER MANAGEMENT",
      icon: <ClipboardList size={36} className="text-white drop-shadow-sm" />,
      path: "/order-management",
      color: "from-red-600 to-yellow-500",
      borderColor: "border-yellow-400",
      delay: 0.3,
      size: "col-span-1",
      highlight: true,
      backgroundImage: "/lovable-uploads/8e895365-a10c-4b41-9eb1-dcafc41e688a.png"
    },
    {
      title: "CROSS DOCK",
      icon: <Truck size={36} className="text-white drop-shadow-sm" />,
      path: "/cross-dock",
      color: "from-green-500 to-green-700",
      borderColor: "border-green-400",
      delay: 0.4,
      size: "col-span-1",
      backgroundImage: "/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png"
    },
    {
      title: "WHEEL REFURB ORDER",
      icon: null,
      path: "/wheel-order",
      color: "", // Removed gradient background color
      borderColor: "border-[#2F9599]",
      delay: 0.5,
      size: "col-span-1",
      hideTitle: true,
      fullSizeImage: true, // New property to indicate full size image
      backgroundImage: "/lovable-uploads/8d829cab-7b94-46fc-9281-84ee33a52d3c.png"
    },
    {
      title: "WAREHOUSE INVENTORY",
      icon: <Database size={36} className="text-white drop-shadow-sm" />,
      path: "/relentless-inventory",
      color: "from-purple-500 to-purple-700",
      borderColor: "border-purple-400",
      delay: 0.6,
      highlight: true,
      size: "col-span-1",
      backgroundImage: "/lovable-uploads/be43b300-3ff2-43c1-b522-e326db67e4e1.png"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {menuItems.map((item) => (
        <MenuCard key={item.title} item={item} loaded={loaded} />
      ))}
    </div>
  );
}

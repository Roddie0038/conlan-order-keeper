
import { Box, Package, CheckSquare, Database, Truck, Disc, ClipboardList } from "lucide-react";
import { MenuCard, MenuItemProps } from "./MenuCard";

interface DashboardMenuProps {
  loaded: boolean;
}

export function DashboardMenu({ loaded }: DashboardMenuProps) {
  const menuItems: MenuItemProps[] = [
    {
      title: "NEW ORDER",
      icon: <Box size={36} className="text-white drop-shadow-sm" />,
      path: "/pending-orders",
      color: "from-orange-500 to-red-500",
      borderColor: "border-yellow-500",
      delay: 0.1,
      size: "col-span-1",
      backgroundImage: "/lovable-uploads/ccf8c0b0-c0d6-410a-9dc4-e76c7f073cc9.png"
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
      title: "WHEEL POWDER COATING",
      icon: <Disc size={36} className="text-white drop-shadow-sm" />,
      path: "/wheel-order",
      color: "from-[#2F9599] to-[#267376]",
      borderColor: "border-[#2F9599]",
      delay: 0.5,
      size: "col-span-1",
      backgroundImage: "/lovable-uploads/1d2dc4a7-eabb-489d-8be6-adb2766a4def.png"
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

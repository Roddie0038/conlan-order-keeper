
import { Box, Package, CheckSquare, Database, Truck, Disc, ClipboardList } from "lucide-react";
import { MenuCard, MenuItemProps } from "./MenuCard";

interface DashboardMenuProps {
  loaded: boolean;
}

export function DashboardMenu({ loaded }: DashboardMenuProps) {
  const menuItems: MenuItemProps[] = [
    {
      title: "NEW ORDER",
      icon: <Box size={36} />,
      path: "/pending-orders",
      color: "from-orange-500 to-red-500",
      borderColor: "border-yellow-500",
      delay: 0.1,
      size: "col-span-1"
    },
    {
      title: "MTO",
      icon: <Package size={36} />,
      path: "/mto-order",
      color: "from-blue-500 to-purple-900",
      borderColor: "border-blue-400",
      delay: 0.2,
      size: "col-span-1"
    },
    {
      title: "ORDER MANAGEMENT",
      icon: <ClipboardList size={36} />,
      path: "/order-management",
      color: "from-red-600 to-yellow-500",
      borderColor: "border-yellow-400",
      delay: 0.3,
      size: "col-span-1",
      highlight: true
    },
    {
      title: "CROSS DOCK",
      icon: <Truck size={36} />,
      path: "/cross-dock",
      color: "from-green-500 to-green-700",
      borderColor: "border-green-400",
      delay: 0.4,
      size: "col-span-1"
    },
    {
      title: "WHEEL POWDER COATING",
      icon: <Disc size={36} />,
      path: "/wheel-order",
      color: "from-[#2F9599] to-[#267376]",
      borderColor: "border-[#2F9599]",
      delay: 0.5,
      size: "col-span-1"
    },
    {
      title: "WAREHOUSE INVENTORY",
      icon: <Database size={36} />,
      path: "/relentless-inventory",
      color: "from-purple-500 to-purple-700",
      borderColor: "border-purple-400",
      delay: 0.6,
      highlight: true,
      size: "col-span-1"
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

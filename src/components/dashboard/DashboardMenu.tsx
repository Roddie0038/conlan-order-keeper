
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
      icon: null,
      path: "/mto-order",
      color: "",
      borderColor: "border-blue-400",
      delay: 0.2,
      size: "col-span-1",
      hideTitle: true,
      fullSizeImage: true,
      backgroundImage: "/lovable-uploads/2a2af5fe-894f-4d64-b91b-1ad72497dead.png"
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
      backgroundImage: "/lovable-uploads/85dc387c-b2e4-4cce-9756-0c355ece0473.png"
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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {menuItems.map((item) => (
        <MenuCard key={item.title} item={item} loaded={loaded} />
      ))}
    </div>
  );
}

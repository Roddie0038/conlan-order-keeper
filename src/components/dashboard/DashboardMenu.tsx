import { Box, Package, CheckSquare, Database, Truck, Disc, ClipboardList, Rocket, FileCheck, AlertTriangle } from "lucide-react";
import { MenuCard, MenuItemProps } from "./MenuCard";
import { ApprovedTreadsCard } from "./ApprovedTreadsCard";
import { useAuth } from "@/contexts/AuthContext";
import { DeploymentControls } from "@/components/admin/DeploymentControls";

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
      backgroundImage: "/lovable-uploads/a0aa8846-9b65-429e-8825-76c0574bf5b8.png"
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
    },
    {
      title: "RETREAD WARRANTY",
      icon: null,
      path: "/retread-warranty",
      color: "",
      borderColor: "border-red-400",
      delay: 0.6,
      size: "col-span-1",
      hideTitle: true,
      fullSizeImage: true,
      backgroundImage: "/lovable-uploads/d9828434-70c4-4af6-9e0a-0b609fdf1264.png"
    },
    {
      title: "CUSTOMER COMPLAINT FORM",
      icon: null,
      path: "/complaint-tracking",
      color: "",
      borderColor: "border-orange-500",
      delay: 0.8,
      size: "col-span-1",
      hideTitle: true,
      fullSizeImage: true,
      backgroundImage: "/lovable-uploads/79d57732-9949-4d90-812e-8581ada7c116.png"
    }
  ];
  
  if (user?.isAdmin) {
    menuItems.push({
      title: "ALL ORDERS",
      icon: null,
      path: "/admin-orders",
      color: "",
      borderColor: "border-amber-400",
      delay: 0.9,
      size: "col-span-1",
      highlight: true,
      hideTitle: true,
      fullSizeImage: true,
      backgroundImage: "/lovable-uploads/d105eb33-3189-4f02-995f-dfd6eaf2b08a.png"
    });
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {menuItems.map((item) => (
          <MenuCard key={item.title} item={item} loaded={loaded} />
        ))}
        
        {/* Approved Treads Card */}
        <ApprovedTreadsCard loaded={loaded} delay={0.7} />
      </div>
      
      {user?.username === 'Conlan97' && (
        <div className="mt-10 max-w-md mx-auto">
          <DeploymentControls />
        </div>
      )}
    </>
  );
}

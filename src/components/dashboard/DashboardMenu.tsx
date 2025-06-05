
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { MenuCard, MenuItemProps } from "./MenuCard";
import {
  Package,
  ClipboardList,
  Truck,
  Wrench,
  Shield,
  Settings,
  AlertTriangle,
  Warehouse,
  FileText,
  Users,
  ShoppingCart,
} from "lucide-react";

export function DashboardMenu() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const menuItems: MenuItemProps[] = [
    {
      title: "NEW ORDER",
      icon: <Package className="h-12 w-12 text-white drop-shadow-lg" />,
      path: "/order-form",
      color: "from-blue-600 via-blue-700 to-blue-800",
      borderColor: "border-blue-400",
      delay: 0.1,
      size: "col-span-2 row-span-2",
      backgroundImage: "/lovable-uploads/96697586-f8cf-4aa5-8415-fee779a6cd7b.png",
    },
    {
      title: "PENDING ORDERS",
      icon: <ClipboardList className="h-8 w-8 text-white" />,
      path: "/pending-orders",
      color: "from-yellow-500 via-yellow-600 to-yellow-700",
      borderColor: "border-yellow-400",
      delay: 0.2,
      size: "col-span-1 row-span-1",
    },
    {
      title: "COMPLETED ORDERS",
      icon: <Truck className="h-8 w-8 text-white" />,
      path: "/completed-orders",
      color: "from-green-500 via-green-600 to-green-700",
      borderColor: "border-green-400",
      delay: 0.3,
      size: "col-span-1 row-span-1",
    },
    {
      title: "MTO",
      icon: <Wrench className="h-10 w-10 text-white drop-shadow-lg" />,
      path: "/mto-order",
      color: "from-purple-600 via-purple-700 to-purple-800",
      borderColor: "border-purple-400",
      delay: 0.4,
      size: "col-span-2 row-span-1",
      backgroundImage: "/lovable-uploads/7fc96df5-7b90-4a30-ab9c-e13b08d62d40.png",
    },
    {
      title: "CROSS DOCK",
      icon: <Warehouse className="h-10 w-10 text-white drop-shadow-lg" />,
      path: "/cross-dock",
      color: "from-indigo-600 via-indigo-700 to-indigo-800",
      borderColor: "border-indigo-400",
      delay: 0.5,
      size: "col-span-1 row-span-2",
    },
    {
      title: "WHEEL REFURB ORDER",
      icon: <Shield className="h-8 w-8 text-white" />,
      path: "/wheel-order",
      color: "from-orange-500 via-orange-600 to-orange-700",
      borderColor: "border-orange-400",
      delay: 0.6,
      size: "col-span-1 row-span-1",
      backgroundImage: "/lovable-uploads/8e895365-a10c-4b41-9eb1-dcafc41e688a.png",
    },
    {
      title: "WAREHOUSE INVENTORY",
      icon: <Package className="h-12 w-12 text-white drop-shadow-lg" />,
      path: "/relentless-inventory",
      color: "from-purple-600 via-purple-700 to-purple-900",
      borderColor: "border-purple-300",
      delay: 0.7,
      size: "col-span-2 row-span-2",
      highlight: true,
      backgroundImage: "/lovable-uploads/310fc0d8-29ad-4965-98d1-a236b46f73e8.png",
    },
    {
      title: "ORDER MANAGEMENT",
      icon: <Settings className="h-12 w-12 text-white drop-shadow-lg" />,
      path: "/order-management",
      color: "from-red-600 via-red-700 to-red-900",
      borderColor: "border-yellow-300",
      delay: 0.8,
      size: "col-span-2 row-span-2",
      highlight: true,
      backgroundImage: "/lovable-uploads/9936c75b-4159-4c84-88ee-829bdaaadb09.png",
    },
    {
      title: "Customer Complaint Form",
      icon: <AlertTriangle className="h-10 w-10 text-white drop-shadow-lg" />,
      path: "/complaint-tracking",
      color: "from-orange-600 via-orange-700 to-red-800",
      borderColor: "border-orange-400",
      delay: 0.9,
      size: "col-span-2 row-span-1",
      backgroundImage: "/lovable-uploads/ae62768c-60e7-48f3-8e2c-4be929733313.png",
    },
  ];

  if (user?.isAdmin) {
    menuItems.push(
      {
        title: "ADMIN INVENTORY",
        icon: <Warehouse className="h-8 w-8 text-white" />,
        path: "/admin-inventory",
        color: "from-gray-600 via-gray-700 to-gray-800",
        borderColor: "border-gray-400",
        delay: 1.0,
        size: "col-span-1 row-span-1",
      },
      {
        title: "ADMIN ORDERS",
        icon: <Users className="h-8 w-8 text-white" />,
        path: "/admin-orders",
        color: "from-slate-600 via-slate-700 to-slate-800",
        borderColor: "border-slate-400",
        delay: 1.1,
        size: "col-span-1 row-span-1",
      }
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-4 grid-rows-6 gap-6 max-w-6xl mx-auto" style={{ minHeight: '600px' }}>
        {menuItems.map((item, index) => (
          <MenuCard key={item.title} item={item} loaded={loaded} />
        ))}
      </div>
    </div>
  );
}

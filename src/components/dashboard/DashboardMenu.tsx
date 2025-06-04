import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FileText, Package, ClipboardList, Truck, Settings, Wrench, Shield, AlertTriangle } from "lucide-react";

const menuItems = [
  {
    title: "Order Form",
    description: "Submit a new tire order to the warehouse",
    href: "/order-form",
    icon: Package,
    bgColor: "bg-blue-500",
    available: true,
  },
  {
    title: "Pending Orders",
    description: "View your store's pending tire orders",
    href: "/pending-orders",
    icon: ClipboardList,
    bgColor: "bg-yellow-500",
    available: true,
  },
  {
    title: "Completed Orders",
    description: "View your store's completed tire orders",
    href: "/completed-orders",
    icon: Truck,
    bgColor: "bg-green-500",
    available: true,
  },
  {
    title: "MTO Order",
    description: "Submit a new MTO (Make To Order) request",
    href: "/mto-order",
    icon: Wrench,
    bgColor: "bg-purple-500",
    available: true,
  },
  {
    title: "Wheel Order",
    description: "Submit a new Wheel and Powder Coating order",
    href: "/wheel-order",
    icon: Shield,
    bgColor: "bg-orange-500",
    available: true,
  },
  {
    title: "Order Management",
    description: "Manage and track all orders",
    href: "/order-management",
    icon: Settings,
    bgColor: "bg-gray-500",
    available: true,
  },
  {
    title: "Complaint Tracking",
    description: "Submit and track complaints for tire transfers, retreads, and work orders",
    href: "/complaint-tracking",
    icon: AlertTriangle,
    bgColor: "bg-orange-500",
    available: true,
  },
];

export function DashboardMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map((item) => (
          <Card key={item.title} className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden">
            <div className={`${item.bgColor} p-6 flex items-center`}>
              <item.icon className="h-6 w-6 text-white mr-4" />
              <h2 className="text-2xl font-semibold text-white">{item.title}</h2>
            </div>
            <CardContent className="p-6">
              <p className="text-gray-700">{item.description}</p>
              <a href={item.href} className="block mt-4 text-blue-600 hover:underline">
                Go to {item.title}
              </a>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center">
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              {user?.username} ({user?.store})
            </DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

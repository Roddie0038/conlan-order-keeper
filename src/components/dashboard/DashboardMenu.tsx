
import { useState, useEffect } from "react";
import { MenuCard } from "./MenuCard";
import { useAuth } from "@/contexts/AuthContext";
import {
  ShoppingCart,
  ClipboardCheck,
  Truck,
  Package,
  ShieldCheck,
  FileText,
  CheckCircle,
  Boxes,
  Send
} from "lucide-react";
import { MenuItemProps } from "./MenuCard";

export const DashboardMenu = () => {
  const { user } = useAuth();
  const [loaded, setLoaded] = useState(false);
  
  useEffect(() => {
    // Slightly delay setting loaded to true for animation purposes
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      <MenuCard
        item={{
          title: "NEW ORDER",
          description: "Place a new order for products",
          icon: <ShoppingCart className="h-8 w-8 text-blue-500" />,
          path: "/",
          color: "from-blue-500 to-blue-700",
          borderColor: "border-blue-400",
          delay: 0.1,
          size: "col-span-1",
        }}
        loaded={loaded}
      />
      
      <MenuCard
        item={{
          title: "MTO",
          description: "Place a made-to-order tire request",
          icon: <FileText className="h-8 w-8 text-green-500" />,
          path: "/mto-order",
          color: "from-green-500 to-green-700",
          borderColor: "border-green-400",
          delay: 0.2,
          size: "col-span-1",
        }}
        loaded={loaded}
      />
      
      <MenuCard
        item={{
          title: "WHEEL REFURB ORDER",
          description: "Order wheel powder coating services",
          icon: <CheckCircle className="h-8 w-8 text-purple-500" />,
          path: "/wheel-order",
          color: "from-purple-500 to-purple-700",
          borderColor: "border-purple-400",
          delay: 0.3,
          size: "col-span-1",
        }}
        loaded={loaded}
      />
      
      <MenuCard
        item={{
          title: "PENDING ORDERS",
          description: "View your store's pending orders",
          icon: <ClipboardCheck className="h-8 w-8 text-amber-500" />,
          path: "/pending-orders",
          color: "from-amber-500 to-amber-700",
          borderColor: "border-amber-400",
          delay: 0.4,
          size: "col-span-1",
        }}
        loaded={loaded}
      />
      
      <MenuCard
        item={{
          title: "COMPLETED ORDERS",
          description: "View your store's completed orders",
          icon: <CheckCircle className="h-8 w-8 text-emerald-500" />,
          path: "/completed-orders",
          color: "from-emerald-500 to-emerald-700",
          borderColor: "border-emerald-400",
          delay: 0.5,
          size: "col-span-1",
        }}
        loaded={loaded}
      />
      
      <MenuCard
        item={{
          title: "CROSS DOCK",
          description: "Create cross dock paperwork",
          icon: <Truck className="h-8 w-8 text-indigo-500" />,
          path: "/cross-dock",
          color: "from-indigo-500 to-indigo-700",
          borderColor: "border-indigo-400",
          delay: 0.6,
          size: "col-span-1",
        }}
        loaded={loaded}
      />
      
      {user?.isAdmin && (
        <>
          <MenuCard
            item={{
              title: "ALL PENDING ORDERS",
              description: "View all stores' pending orders",
              icon: <ClipboardCheck className="h-8 w-8 text-rose-500" />,
              path: "/all-pending-orders",
              color: "from-rose-500 to-rose-700",
              borderColor: "border-rose-400",
              delay: 0.7,
              size: "col-span-1",
            }}
            loaded={loaded}
          />
          
          <MenuCard
            item={{
              title: "WAREHOUSE INVENTORY",
              description: "View inventory levels for all stores",
              icon: <Package className="h-8 w-8 text-cyan-500" />,
              path: "/relentless-inventory",
              color: "from-cyan-500 to-cyan-700",
              borderColor: "border-cyan-400",
              delay: 0.8,
              size: "col-span-1",
            }}
            loaded={loaded}
          />
          
          <MenuCard
            item={{
              title: "INVENTORY MANAGEMENT",
              description: "Manage inventory items and levels",
              icon: <Boxes className="h-8 w-8 text-slate-500" />,
              path: "/admin/inventory",
              color: "from-slate-500 to-slate-700",
              borderColor: "border-slate-400",
              delay: 0.9,
              size: "col-span-1",
            }}
            loaded={loaded}
          />
          
          <MenuCard
            item={{
              title: "ORDER MANAGEMENT",
              description: "Manage all orders across stores",
              icon: <ShieldCheck className="h-8 w-8 text-violet-500" />,
              path: "/admin/orders",
              color: "from-red-500 to-yellow-500",
              borderColor: "border-orange-400",
              delay: 1.0,
              size: "col-span-1",
            }}
            loaded={loaded}
          />
          
          <MenuCard
            item={{
              title: "TEST WEBHOOKS",
              description: "Send test webhooks for integration testing",
              icon: <Send className="h-8 w-8 text-blue-500" />,
              path: "/test-webhooks",
              color: "from-blue-400 to-blue-600",
              borderColor: "border-blue-300",
              delay: 1.1,
              size: "col-span-1",
            }}
            loaded={loaded}
          />
        </>
      )}
    </div>
  );
};

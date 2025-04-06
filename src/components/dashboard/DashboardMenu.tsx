
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

export const DashboardMenu = () => {
  const { user } = useAuth();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
      <MenuCard
        title="New Order"
        description="Place a new order for products"
        icon={<ShoppingCart className="h-8 w-8 text-blue-500" />}
        linkTo="/"
      />
      
      <MenuCard
        title="MTO Order"
        description="Place a made-to-order tire request"
        icon={<FileText className="h-8 w-8 text-green-500" />}
        linkTo="/mto-order"
      />
      
      <MenuCard
        title="Wheel Powder Coating"
        description="Order wheel powder coating services"
        icon={<CheckCircle className="h-8 w-8 text-purple-500" />}
        linkTo="/wheel-order"
      />
      
      <MenuCard
        title="Pending Orders"
        description="View your store's pending orders"
        icon={<ClipboardCheck className="h-8 w-8 text-amber-500" />}
        linkTo="/pending-orders"
      />
      
      <MenuCard
        title="Completed Orders"
        description="View your store's completed orders"
        icon={<CheckCircle className="h-8 w-8 text-emerald-500" />}
        linkTo="/completed-orders"
      />
      
      <MenuCard
        title="Cross Dock"
        description="Create cross dock paperwork"
        icon={<Truck className="h-8 w-8 text-indigo-500" />}
        linkTo="/cross-dock"
      />
      
      {user?.isAdmin && (
        <>
          <MenuCard
            title="All Pending Orders"
            description="View all stores' pending orders"
            icon={<ClipboardCheck className="h-8 w-8 text-rose-500" />}
            linkTo="/all-pending-orders"
          />
          
          <MenuCard
            title="Relentless Inventory"
            description="View inventory levels for all stores"
            icon={<Package className="h-8 w-8 text-cyan-500" />}
            linkTo="/relentless-inventory"
          />
          
          <MenuCard
            title="Admin: Inventory"
            description="Manage inventory items and levels"
            icon={<Boxes className="h-8 w-8 text-slate-500" />}
            linkTo="/admin/inventory"
          />
          
          <MenuCard
            title="Admin: Orders"
            description="Manage all orders across stores"
            icon={<ShieldCheck className="h-8 w-8 text-violet-500" />}
            linkTo="/admin/orders"
          />
          
          <MenuCard
            title="Test Webhooks"
            description="Send test webhooks for integration testing"
            icon={<Send className="h-8 w-8 text-blue-500" />}
            linkTo="/test-webhooks"
          />
        </>
      )}
    </div>
  );
};

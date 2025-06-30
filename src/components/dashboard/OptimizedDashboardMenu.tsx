
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { memo } from "react";
import { 
  Package, 
  ClipboardList, 
  CheckCircle, 
  ArrowRightLeft, 
  Settings,
  AlertTriangle,
  Wrench,
  Archive,
  Truck
} from "lucide-react";
import { OptimizedMenuCard, MenuItemProps } from "./OptimizedMenuCard";

const menuItems: MenuItemProps[] = [
  {
    title: "NEW ORDER",
    icon: <Package className="h-12 w-12 text-white" />,
    path: "/pending-orders",
    color: "from-blue-600 to-blue-800",
    borderColor: "border-blue-500",
    delay: 0.1,
    size: "col-span-1 row-span-1",
    backgroundImage: "/lovable-uploads/4ef561a4-e81e-40b4-910a-06dd13dc66ca.png"
  },
  {
    title: "MTO",
    icon: <Settings className="h-12 w-12 text-white" />,
    path: "/mto",
    color: "from-purple-600 to-purple-800",
    borderColor: "border-purple-500",
    delay: 0.2,
    size: "col-span-1 row-span-1",
    backgroundImage: "/lovable-uploads/310fc0d8-29ad-4965-98d1-a236b46f73e8.png"
  },
  {
    title: "PENDING ORDERS",
    icon: <ClipboardList className="h-8 w-8 text-white" />,
    path: "/all-pending-orders",
    color: "from-yellow-600 to-yellow-800",
    borderColor: "border-yellow-500",
    delay: 0.3,
    size: "col-span-1 row-span-1"
  },
  {
    title: "COMPLETED ORDERS",
    icon: <CheckCircle className="h-8 w-8 text-white" />,
    path: "/completed-orders",
    color: "from-green-600 to-green-800",
    borderColor: "border-green-500",
    delay: 0.4,
    size: "col-span-1 row-span-1"
  },
  {
    title: "CROSS DOCK",
    icon: <ArrowRightLeft className="h-12 w-12 text-white" />,
    path: "/cross-dock",
    color: "from-indigo-600 to-indigo-800",
    borderColor: "border-indigo-500",
    delay: 0.5,
    size: "col-span-1 row-span-1",
    backgroundImage: "/lovable-uploads/46d498f4-cb0a-44a8-9a30-33cd70d45dde.png"
  },
  {
    title: "WAREHOUSE INVENTORY",
    icon: <Archive className="h-12 w-12 text-white" />,
    path: "/admin-inventory",
    color: "from-purple-700 to-purple-900",
    borderColor: "border-purple-600",
    delay: 0.6,
    size: "col-span-2 row-span-2",
    highlight: true,
    backgroundImage: "/lovable-uploads/a0aa8846-9b65-429e-8825-76c0574bf5b8.png"
  },
  {
    title: "COMPLAINT TRACKING",
    icon: <AlertTriangle className="h-8 w-8 text-white" />,
    path: "/complaint-tracking",
    color: "from-red-600 to-red-800",
    borderColor: "border-red-500",
    delay: 0.7,
    size: "col-span-1 row-span-1"
  },
  {
    title: "WHEEL REFURB ORDER",
    icon: <Wrench className="h-8 w-8 text-white" />,
    path: "/wheel-order",
    color: "from-gray-600 to-gray-800",
    borderColor: "border-gray-500",
    delay: 0.8,
    size: "col-span-1 row-span-1",
    backgroundImage: "/lovable-uploads/52ff146d-0e5f-4a8c-80f2-b26621c00cce.png"
  },
  {
    title: "ORDER MANAGEMENT",
    icon: <Truck className="h-12 w-12 text-white" />,
    path: "/order-management",
    color: "from-red-700 to-red-900",
    borderColor: "border-red-600",
    delay: 0.9,
    size: "col-span-2 row-span-2",
    highlight: true,
    backgroundImage: "/lovable-uploads/61bc791-3377-4911-8269-c0fed6642b6a.png",
    fullSizeImage: true,
    hideTitle: true
  }
];

export const OptimizedDashboardMenu = memo(({ loaded }: { loaded: boolean }) => {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();

  // Filter menu items based on user permissions
  const filteredMenuItems = menuItems.filter(item => {
    if (!user) return false;
    
    // Admin users see all items
    if (user.isAdmin) return true;
    
    // Regular users see limited items
    const allowedPaths = [
      "/pending-orders",
      "/mto", 
      "/cross-dock",
      "/complaint-tracking",
      "/wheel-order"
    ];
    
    return allowedPaths.includes(item.path);
  });

  return (
    <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
      {filteredMenuItems.map((item, index) => (
        <OptimizedMenuCard 
          key={`${item.title}-${selectedPlant}`} 
          item={item} 
          loaded={loaded}
        />
      ))}
    </div>
  );
});

OptimizedDashboardMenu.displayName = 'OptimizedDashboardMenu';

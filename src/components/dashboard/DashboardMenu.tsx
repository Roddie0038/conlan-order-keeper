
import { Mail, TrendingUp, History } from "lucide-react";
import { DashboardTile, DashboardTileProps } from "./DashboardTile";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { OptimizedApprovedTreadsCard } from "./OptimizedApprovedTreadsCard";
import { useAuth } from "@/contexts/AuthContext";
import { DeploymentControls } from "@/components/admin/DeploymentControls";
import { useMemo } from "react";

interface DashboardMenuProps {
  loaded: boolean;
}

export function DashboardMenu({ loaded }: DashboardMenuProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Memoize menu items to prevent unnecessary re-calculations
  const menuItems: DashboardTileProps[] = useMemo(() => {
    const baseItems: DashboardTileProps[] = [
      {
        title: "NEW ORDER",
        icon: null,
        path: "/new-order",
        color: "",
        borderColor: "border-yellow-500",
        delay: 0.1,
        size: "col-span-1",
        hideTitle: true,
        fullSizeImage: true,
        backgroundImage: "/lovable-uploads/a0aa8846-9b65-429e-8825-76c0574bf5b8.png",
        loaded
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
        backgroundImage: "/lovable-uploads/9f69d8f3-d46e-4cb7-9aa4-c71919921d67.png",
        loaded
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
        backgroundImage: "/lovable-uploads/7f6dce61-94af-46e1-9797-99bc1808efa9.png",
        loaded
      },
      {
        title: "CROSS DOCK FORM",
        icon: null,
        path: "/cross-dock",
        color: "",
        borderColor: "border-green-400",
        delay: 0.4,
        size: "col-span-1",
        hideTitle: true,
        fullSizeImage: true,
        backgroundImage: "/lovable-uploads/621af873-8fbf-44ed-8587-a590c85a7b53.png",
        loaded
      },
      {
        title: "CROSS DOCK REQUEST",
        icon: null,
        path: "/cross-dock-request",
        color: "",
        borderColor: "border-teal-400",
        delay: 0.45,
        size: "col-span-1",
        hideTitle: true,
        fullSizeImage: true,
        backgroundImage: "/lovable-uploads/6ddbd3d3-6d33-4a42-97a8-746ec6d6767e.png",
        loaded
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
        backgroundImage: "/lovable-uploads/8d829cab-7b94-46fc-9281-84ee33a52d3c.png",
        loaded
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
        backgroundImage: "/lovable-uploads/d9828434-70c4-4af6-9e0a-0b609fdf1264.png",
        loaded
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
        backgroundImage: "/lovable-uploads/79d57732-9949-4d90-812e-8581ada7c116.png",
        loaded
      }
    ];
    
    // Only add admin items if user is admin (memoized check)
    if (user?.isAdmin) {
      baseItems.push({
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
        backgroundImage: "/lovable-uploads/d105eb33-3189-4f02-995f-dfd6eaf2b08a.png",
        loaded
      });

      // Add Email Testing Suite for admins
      baseItems.push({
        title: "📧 EMAIL TESTING SUITE",
        icon: <Mail className="h-6 w-6" />,
        path: "/email-testing",
        color: "bg-gradient-to-br from-purple-500 to-pink-500",
        borderColor: "border-purple-400",
        delay: 1.0,
        size: "col-span-1",
        highlight: true,
        hideTitle: false,
        fullSizeImage: false,
        loaded
      });
    }

    return baseItems;
  }, [user?.isAdmin, loaded]);

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {menuItems.map((item) => (
          <DashboardTile key={item.title} {...item} />
        ))}
        
        {/* Regional Transfer Cards */}
        <Card 
          className="p-6 hover:bg-accent/50 transition-colors cursor-pointer group"
          onClick={() => navigate("/regional-transfer")}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">REGIONAL TRANSFER</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Create new cross-plant orders
              </p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 hover:bg-accent/50 transition-colors cursor-pointer group"
          onClick={() => navigate("/regional-transfer-history")}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <History className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">TRANSFER HISTORY</h3>
              <p className="text-sm text-muted-foreground mt-1">
                View all regional transfers
              </p>
            </div>
          </div>
        </Card>
        
        {/* Approved Treads Card */}
        <OptimizedApprovedTreadsCard loaded={loaded} delay={0.7} />
      </div>
      
      {user?.username === 'Conlan97' && (
        <div className="mt-10 max-w-md mx-auto">
          <DeploymentControls />
        </div>
      )}
    </>
  );
}

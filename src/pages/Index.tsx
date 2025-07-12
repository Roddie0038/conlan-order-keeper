
import { OrderForm } from "@/components/order-form/OrderForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePlant } from "@/contexts/PlantContext";
import { Building } from "lucide-react";
import { RecentPortalOrders } from "@/components/orders/RecentPortalOrders";

const Index = () => {
  const navigate = useNavigate();
  const { selectedPlant } = usePlant();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-8 mb-8 shadow-md">
        <div className="container flex flex-col items-center gap-6">
          <img 
            src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" 
            alt="Conlan Tire Logo" 
            className="h-24 object-contain"
          />
          <h1 className="text-3xl md:text-4xl font-bold text-center">Conlan Tire GP Orders</h1>
          <div className="flex items-center gap-2 py-2 px-4 bg-blue-800/60 rounded-full border border-blue-500 shadow-inner">
            <Building className="h-5 w-5 text-amber-400" />
            <span className="font-bold text-amber-400">{selectedPlant}</span>
          </div>
          <div className="flex gap-4 mt-2">
            <Button 
              variant="secondary"
              onClick={() => navigate("/mto-order")}
              className="rounded-full px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm transition-all"
            >
              Place MTO Order
            </Button>
            <Button 
              variant="secondary"
              onClick={() => navigate("/dashboard")}
              className="rounded-full px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/30 backdrop-blur-sm transition-all"
            >
              Dashboard
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <RecentPortalOrders />
        <OrderForm />
      </main>
      
      <footer className="mt-16 py-6 text-center text-gray-600 dark:text-gray-400 bg-white/50 dark:bg-black/20 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto">
          <p>© {new Date().getFullYear()} Conlan Tire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

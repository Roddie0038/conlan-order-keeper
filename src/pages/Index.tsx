
import { OrderForm } from "@/components/OrderForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { usePlant } from "@/contexts/PlantContext";
import { Building } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { selectedPlant } = usePlant();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-primary text-primary-foreground py-6 mb-8">
        <div className="container flex flex-col items-center gap-4">
          <img 
            src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" 
            alt="Conlan Tire Logo" 
            className="h-24 object-contain"
          />
          <h1 className="text-3xl font-bold text-center">Conlan Tire GP Orders</h1>
          <div className="flex items-center text-gray-200 mb-2">
            <Building className="h-5 w-5 mr-2" />
            <span className="font-medium">{selectedPlant}</span>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="secondary"
              onClick={() => navigate("/mto-order")}
            >
              Place MTO Order
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container">
        <OrderForm />
      </main>
      
      <footer className="mt-16 py-6 text-center text-gray-600">
        <p>© {new Date().getFullYear()} Conlan Tire. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;

import { OrderForm } from "@/components/OrderForm";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

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
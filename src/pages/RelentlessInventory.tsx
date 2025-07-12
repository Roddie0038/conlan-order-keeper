
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { useToast } from "@/hooks/use-toast";
import { Database, Package2, ArrowLeft, LogOut } from "lucide-react";

export default function RelentlessInventory() {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }

    // Show welcome toast when the page loads
    toast({
      title: "Warehouse Inventory",
      description: "Check and manage your inventory in real-time"
    });
  }, [user, navigate, toast]);

  const handleLogout = () => {
    logout();
    navigate('/dashboard');
  };

  const handleDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-900">
      <header className="bg-gradient-to-r from-purple-700 to-purple-900 text-primary-foreground py-8 shadow-lg">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" alt="Conlan Tire Logo" className="h-16 object-contain" />
          </div>
          
          <div className="flex items-center gap-3">
            <Database className="h-8 w-8 text-white" />
            <h1 className="font-extrabold text-3xl md:text-4xl text-center text-white">
              Warehouse Inventory
            </h1>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              onClick={handleDashboard} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-all duration-200 flex items-center gap-2"
            >
              <ArrowLeft size={16} />
              Dashboard
            </Button>
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="bg-white hover:bg-gray-100 text-gray-800 font-semibold rounded-md transition-all duration-200 flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <InventoryProvider>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0 border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Package2 className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Real-Time Inventory</h2>
                  <p className="text-gray-500 dark:text-gray-400">
                    Monitor and manage your inventory levels
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleDashboard} 
                variant="outline" 
                className="text-sm flex items-center gap-2 hover:bg-blue-50 border-blue-200 text-blue-700"
              >
                <ArrowLeft size={14} />
                Return to Dashboard
              </Button>
            </div>
            
            <InventoryTable />
          </div>
        </InventoryProvider>
      </main>
      
      <footer className="py-6 bg-gray-100 dark:bg-gray-800 mt-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Conlan Tire. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

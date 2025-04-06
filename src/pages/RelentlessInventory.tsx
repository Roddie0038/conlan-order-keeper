import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { useToast } from "@/hooks/use-toast";
import { Database } from "lucide-react";
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
    navigate('/');
  };
  const handleDashboard = () => {
    navigate('/dashboard');
  };
  return <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="bg-gradient-to-r from-purple-600 to-purple-900 text-primary-foreground py-6 mb-8">
        <div className="container flex justify-center items-center">
          <div className="flex flex-col items-center gap-4">
            <img src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" alt="Conlan Tire Logo" className="h-16 object-contain" />
            <div className="flex items-center gap-3">
              <Database className="h-8 w-8 text-white" />
              <h1 className="font-extrabold text-3xl md:text-4xl text-center text-white">
                Warehouse Inventory
              </h1>
            </div>
          </div>
          <div className="flex gap-4 absolute right-6">
            <Button variant="secondary" onClick={handleDashboard} className="bg-blue-600 hover:bg-blue-700 text-white">
              Dashboard
            </Button>
            
          </div>
        </div>
      </header>

      <main className="container pb-12">
        <InventoryProvider>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
              <div>
                <h2 className="text-2xl font-bold">Real-Time Inventory</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Monitor and manage your inventory levels
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleDashboard} variant="outline" className="text-sm">
                  Return to Dashboard
                </Button>
              </div>
            </div>
            
            <InventoryTable />
          </div>
        </InventoryProvider>
      </main>
      
      <footer className="py-6 bg-gray-100 dark:bg-gray-800">
        <div className="container text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Conlan Tire. All rights reserved.</p>
        </div>
      </footer>
    </div>;
}
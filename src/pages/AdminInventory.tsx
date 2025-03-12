import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { OrdersOverview } from "@/components/inventory/OrdersOverview";
import { DocumentUpload } from "@/components/inventory/DocumentUpload";
import { useToast } from "@/hooks/use-toast";
import { FileText, ClipboardList, Upload } from "lucide-react";
import { InventoryProvider } from "@/contexts/InventoryContext";

export default function AdminInventory() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("inventory");

  useEffect(() => {
    if (!user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page.",
        variant: "destructive"
      });
      navigate("/pending-orders");
    }
  }, [user, navigate, toast]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen" style={{
      backgroundImage: "url('/lovable-uploads/310fc0d8-29ad-4965-98d1-a236b46f73e8.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}>
      <header className="bg-primary/90 text-primary-foreground py-6 mb-8 backdrop-blur-sm rounded-full">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img 
              src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" 
              alt="Conlan Tire Logo" 
              className="h-16 object-contain" 
            />
            <h1 className="font-extrabold text-4xl text-center">
              Admin Inventory Management
            </h1>
          </div>
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              onClick={handleLogout} 
              className="bg-black border-orange-500 text-black font-bold hover:bg-orange-500 hover:text-white"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container pb-10">
        <InventoryProvider>
          <Tabs 
            defaultValue="inventory" 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-800/50 backdrop-blur-sm">
              <TabsTrigger value="inventory" className="flex gap-2 items-center">
                <ClipboardList size={18} />
                <span>Inventory</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex gap-2 items-center">
                <FileText size={18} />
                <span>All Orders</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex gap-2 items-center">
                <Upload size={18} />
                <span>Documents</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="inventory" className="rounded-lg shadow p-6 backdrop-blur-sm bg-gray-100/90">
              <InventoryTable />
            </TabsContent>
            
            <TabsContent value="orders" className="rounded-lg shadow p-6 backdrop-blur-sm bg-gray-100/90">
              <OrdersOverview />
            </TabsContent>
            
            <TabsContent value="documents" className="rounded-lg shadow p-6 backdrop-blur-sm bg-gray-100/90">
              <DocumentUpload />
            </TabsContent>
          </Tabs>
        </InventoryProvider>
      </main>
    </div>
  );
}

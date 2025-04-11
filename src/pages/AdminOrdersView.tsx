
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportButton } from "@/components/ExportButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Clock, Package, ShoppingCart, Disc } from "lucide-react";

// Types for our orders
interface MTOOrder {
  id: string;
  timestamp: string;
  store: string;
  name: string;
  productNumber: string;
  casingGrade: string;
  tireSize: string;
  tireTreadNeeded: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
}

interface WheelOrder {
  id: string;
  timestamp: string;
  store: string;
  name: string;
  contactNumber: string;
  wheelMaterial: string;
  wheelSize: string;
  wheelColor: string;
  quantity: string;
  notes: string;
}

export default function AdminOrdersView() {
  const [mtoOrders, setMtoOrders] = useState<MTOOrder[]>([]);
  const [wheelOrders, setWheelOrders] = useState<WheelOrder[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if not admin
    if (!user?.isAdmin) {
      navigate("/dashboard");
      return;
    }

    // Load orders from localStorage
    const loadOrders = () => {
      const savedMtoOrders = JSON.parse(localStorage.getItem("mtoOrders") || "[]");
      const savedWheelOrders = JSON.parse(localStorage.getItem("wheelOrders") || "[]");
      
      // Sort by timestamp descending (most recent first) and limit to 5
      setMtoOrders(
        savedMtoOrders
          .sort((a: MTOOrder, b: MTOOrder) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .slice(0, 5)
      );
      
      setWheelOrders(
        savedWheelOrders
          .sort((a: WheelOrder, b: WheelOrder) => 
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          )
          .slice(0, 5)
      );
    };
    
    loadOrders();
    window.addEventListener("storage", loadOrders);
    return () => window.removeEventListener("storage", loadOrders);
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <Clock className="h-7 w-7 text-blue-500" />
            Recent Order Summary
          </h1>
          <p className="text-slate-500 mt-2">
            View the 5 most recent MTO and Wheel orders
          </p>
        </header>
        
        {!user?.isAdmin && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Access Denied</AlertTitle>
            <AlertDescription>
              You don't have permission to view this page. Only admin users can access this information.
            </AlertDescription>
          </Alert>
        )}
        
        {user?.isAdmin && (
          <Tabs defaultValue="mto" className="w-full">
            <TabsList className="mb-6 bg-blue-50 p-1">
              <TabsTrigger 
                value="mto" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Package className="h-4 w-4" />
                MTO Orders
              </TabsTrigger>
              <TabsTrigger 
                value="wheel" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-500 data-[state=active]:text-white"
              >
                <Disc className="h-4 w-4" />
                Wheel Orders
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="mto" className="border rounded-lg shadow-sm bg-white p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-500" />
                  Last 5 MTO Orders
                </h2>
                <ExportButton 
                  data={mtoOrders} 
                  filename="recent-mto-orders" 
                  variant="outline"
                />
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-slate-100">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Arrival</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mtoOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-slate-500 italic">
                          No MTO orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      mtoOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.timestamp}</TableCell>
                          <TableCell>{order.store}</TableCell>
                          <TableCell>{order.productNumber}</TableCell>
                          <TableCell>{order.tireSize}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.scheduleArrival}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="wheel" className="border rounded-lg shadow-sm bg-white p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-slate-700 flex items-center gap-2">
                  <Disc className="h-5 w-5 text-blue-500" />
                  Last 5 Wheel Orders
                </h2>
                <ExportButton 
                  data={wheelOrders} 
                  filename="recent-wheel-orders" 
                  variant="outline"
                />
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader className="bg-slate-100">
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Store</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Wheel Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Color</TableHead>
                      <TableHead>Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wheelOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-slate-500 italic">
                          No wheel orders found
                        </TableCell>
                      </TableRow>
                    ) : (
                      wheelOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>{order.timestamp}</TableCell>
                          <TableCell>{order.store}</TableCell>
                          <TableCell>{order.name}</TableCell>
                          <TableCell>{order.wheelMaterial}</TableCell>
                          <TableCell>{order.wheelSize}</TableCell>
                          <TableCell>{order.wheelColor}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}


import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { OrderForm } from "@/components/order-form/OrderForm";
import { getManagerEmail } from "@/components/order-form/formConfig";
import { Calendar, PackageOpen, FileText, Hash, Mail, CheckCircle, Building } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";

interface Order {
  id: string;
  timestamp: string;
  yourName: string;
  store: string;
  dateReceived: string;
  productNumber: string;
  description: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
  crossDock: string;
  managerEmail?: string;
  plant?: string;
}

export default function PendingOrders() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const [orders, setOrders] = useState<Order[]>([]);
  
  useEffect(() => {
    const savedOrders = localStorage.getItem('pendingOrders');
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      // Filter by both store and plant
      const filteredOrders = allOrders
        .filter((order: Order) => 
          order.store === user?.store && 
          (!order.plant || order.plant === selectedPlant)
        )
        .map((order: Order) => ({
          ...order,
          managerEmail: getManagerEmail(order.store)
        }));
      setOrders(filteredOrders);
    }
  }, [user?.store, selectedPlant]);
  
  const handleComplete = (orderId: string) => {
    const allPendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    const orderToComplete = allPendingOrders.find((o: Order) => o.id === orderId);
    if (orderToComplete) {
      const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
      completedOrders.push({
        ...orderToComplete,
        managerEmail: getManagerEmail(orderToComplete.store),
        plant: selectedPlant
      });
      localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
      const updatedPendingOrders = allPendingOrders.filter((o: Order) => o.id !== orderId);
      localStorage.setItem('pendingOrders', JSON.stringify(updatedPendingOrders));
      
      // Update local state
      setOrders(updatedPendingOrders
        .filter((order: Order) => 
          order.store === user?.store && 
          (!order.plant || order.plant === selectedPlant)
        )
        .map((order: Order) => ({
          ...order,
          managerEmail: getManagerEmail(order.store)
        }))
      );
    }
  };
  
  return <div className="min-h-screen bg-cover bg-center bg-fixed relative" style={{
    backgroundImage: 'url("/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png")',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backgroundBlendMode: 'overlay'
  }}>
      <LogoutButton />

      <header className="bg-primary/90 text-primary-foreground py-6 mb-8 backdrop-blur-sm rounded-full">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img alt="Conlan Tire Logo" className="h-16 object-contain rounded-full" src="/lovable-uploads/1691138e-da6c-4910-8901-00cd0ab21fa8.png" />
            <div>
              <h1 className="font-extrabold text-4xl text-justify px-[29px]">New Order Form - {user?.store}</h1>
              <div className="flex items-center text-gray-200 px-[29px] mt-1">
                <Building className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">{selectedPlant}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container space-y-8">
        <OrderForm />
        
        <div className="backdrop-blur-sm p-8 shadow-xl rounded-2xl bg-slate-800/90 border border-slate-700">
          <h2 className="font-bold mb-6 text-slate-50 text-center text-2xl flex items-center justify-center gap-2">
            <PackageOpen className="h-6 w-6 text-blue-400" />
            Current Pending Orders
          </h2>
          
          <div className="overflow-hidden rounded-xl border border-slate-700 shadow-md">
            <Table className="w-full">
              <TableHeader className="bg-slate-700">
                <TableRow>
                  <TableHead className="text-slate-200 py-3 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-blue-400" />
                      <span>Date</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-slate-200 py-3 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <PackageOpen className="h-4 w-4 text-blue-400" />
                      <span>Product</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-slate-200 py-3 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span>Description</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-slate-200 py-3 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Hash className="h-4 w-4 text-blue-400" />
                      <span>Quantity</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-slate-200 py-3 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-blue-400" />
                      <span>Plant</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-slate-200 py-3 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-blue-400" />
                      <span>Manager Email</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-right text-slate-200 py-3 font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-slate-700">
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-400">
                      No pending orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order, index) => (
                    <TableRow 
                      key={order.id}
                      className={`hover:bg-slate-700/50 transition-colors ${index % 2 === 0 ? 'bg-slate-800/70' : 'bg-slate-800/40'}`}
                    >
                      <TableCell className="py-3 text-slate-200">
                        {new Date(order.dateReceived).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="py-3 text-slate-200">
                        {order.productNumber}
                      </TableCell>
                      <TableCell className="py-3 text-slate-200 max-w-[200px] truncate">
                        {order.description}
                      </TableCell>
                      <TableCell className="py-3 text-slate-200">
                        {order.quantity}
                      </TableCell>
                      <TableCell className="py-3 text-slate-200">
                        {order.plant || selectedPlant}
                      </TableCell>
                      <TableCell className="py-3 text-slate-200">
                        {order.managerEmail || 'N/A'}
                      </TableCell>
                      <TableCell className="py-3 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleComplete(order.id)}
                          className="bg-green-600/20 text-green-400 border-green-700 hover:bg-green-500/30 hover:text-green-300 transition-all flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Complete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>;
}

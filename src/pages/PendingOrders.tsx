import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { OrderForm } from "@/components/OrderForm";
import { storeManagerEmails } from "@/components/order-form/formConfig";
import { FileSpreadsheet, FileText } from "lucide-react";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import type { OrderSummary } from "@/components/order-form/types";
import { Navigation } from "@/components/Navigation";
interface Order extends Omit<OrderSummary, 'timestamp'> {
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
  crossDockDestination?: string;
  managerEmail?: string;
  priority: string;
}
export default function PendingOrders() {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const getManagerEmail = (store: string) => {
    if (store === "Admin") return storeManagerEmails["Admin"];
    const storeId = store.split(' ')[1];
    return storeManagerEmails[storeId] || '';
  };
  useEffect(() => {
    const savedOrders = localStorage.getItem('pendingOrders');
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      const filteredOrders = allOrders.filter((order: Order) => order.store === user?.store).map((order: Order) => ({
        ...order,
        managerEmail: getManagerEmail(order.store),
        priority: order.priority || 'normal' // Ensure priority is always set
      }));
      setOrders(filteredOrders);
    }
  }, [user?.store]);
  const handleComplete = (orderId: string) => {
    // Move order to completed
    const allPendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
    const orderToComplete = allPendingOrders.find((o: Order) => o.id === orderId);
    if (orderToComplete) {
      // Add to completed orders
      const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
      completedOrders.push({
        ...orderToComplete,
        managerEmail: getManagerEmail(orderToComplete.store)
      });
      localStorage.setItem('completedOrders', JSON.stringify(completedOrders));

      // Remove from pending
      const updatedPendingOrders = allPendingOrders.filter((o: Order) => o.id !== orderId);
      localStorage.setItem('pendingOrders', JSON.stringify(updatedPendingOrders));

      // Update state
      setOrders(updatedPendingOrders.filter((order: Order) => order.store === user?.store).map((order: Order) => ({
        ...order,
        managerEmail: getManagerEmail(order.store)
      })));
    }
  };
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  const handleExportExcel = () => {
    const formattedOrders = orders.map(order => ({
      'Order ID': order.id,
      'Date': order.dateReceived,
      'Store': order.store,
      'Product Number': order.productNumber,
      'Description': order.description,
      'Quantity': order.quantity,
      'Schedule': order.scheduleArrival,
      'Priority': order.priority,
      'Notes': order.notes,
      'Cross Dock': order.crossDock,
      'Cross Dock Destination': order.crossDockDestination || 'N/A',
      "Manager's Email": order.managerEmail || 'N/A'
    }));
    exportToExcel(formattedOrders, 'pending-orders');
  };
  const handleExportPDF = () => {
    const formattedOrders = orders.map(order => ({
      'Order ID': order.id,
      'Date': order.dateReceived,
      'Store': order.store,
      'Product Number': order.productNumber,
      'Description': order.description,
      'Quantity': order.quantity,
      'Schedule': order.scheduleArrival,
      'Priority': order.priority,
      'Notes': order.notes,
      'Cross Dock': order.crossDock,
      'Cross Dock Destination': order.crossDockDestination || 'N/A',
      "Manager's Email": order.managerEmail || 'N/A'
    }));
    const headers = ['Order ID', 'Date', 'Store', 'Product Number', 'Description', 'Quantity', 'Schedule', 'Priority', 'Notes', 'Cross Dock', 'Cross Dock Destination', "Manager's Email"];
    exportToPDF(formattedOrders, 'pending-orders', headers);
  };
  return <div className="min-h-screen bg-cover bg-center bg-fixed relative" style={{
    backgroundImage: 'url("/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png")',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backgroundBlendMode: 'overlay'
  }}>
      <Button variant="outline" onClick={handleLogout} className="fixed top-4 right-4 z-50 border-[#F97316] border-2 font-bold rounded-3xl py-[22px] px-[52px] text-zinc-50 my-0 bg-black mx-0">
        LOGOUT
      </Button>

      <Navigation />

      <header className="bg-primary/90 text-primary-foreground py-6 mb-8 backdrop-blur-sm rounded-full">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" alt="Conlan Tire Logo" className="h-16 object-contain rounded-full" />
            <h1 className="mx-[240px] font-extrabold px-[150px] py-0 my-0 text-slate-50 text-4xl">New Order Form - {user?.store}</h1>
          </div>
          
          <div className="flex gap-2">
            
            
          </div>
        </div>
      </header>

      <main className="container space-y-8">
        <OrderForm />
        
        <div className="backdrop-blur-sm p-6 shadow bg-sky-500 hover:bg-sky-400 rounded-3xl">
          <h2 className="text-xl font-semibold mb-4">Current Pending Orders</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Manager Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => <TableRow key={order.id}>
                  <TableCell>{new Date(order.dateReceived).toLocaleDateString()}</TableCell>
                  <TableCell>{order.productNumber}</TableCell>
                  <TableCell>{order.description}</TableCell>
                  <TableCell>{order.quantity}</TableCell>
                  <TableCell>{order.priority}</TableCell>
                  <TableCell>{order.managerEmail}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm" onClick={() => handleComplete(order.id)}>
                      Mark Complete
                    </Button>
                  </TableCell>
                </TableRow>)}
            </TableBody>
          </Table>
        </div>
      </main>
    </div>;
}
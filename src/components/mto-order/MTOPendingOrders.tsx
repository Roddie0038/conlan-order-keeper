
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FileText } from "lucide-react";
import { exportToExcel, exportToPDF, formatMTOOrdersForExport } from "@/utils/exportUtils";
import { useToast } from "@/components/ui/use-toast";

interface MTOOrder {
  id: string;
  timestamp: string;
  store: string;
  name: string;
  productNumber: string;
  tireSize: string;
  customTireSize?: string;
  casingGrade: string[];
  tireTreadNeeded: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
  priority: string;
  managerEmail?: string;
}

export const MTOPendingOrders = () => {
  const [orders, setOrders] = useState<MTOOrder[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const savedOrders = localStorage.getItem('mtoOrders');
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      const filteredOrders = user?.store === "Admin" 
        ? allOrders 
        : allOrders.filter((order: MTOOrder) => order.store === user?.store);
      setOrders(filteredOrders);
    }
  }, [user]);

  const handleComplete = (orderId: string) => {
    const updatedOrders = orders.filter(order => order.id !== orderId);
    setOrders(updatedOrders);
    localStorage.setItem('mtoOrders', JSON.stringify(updatedOrders));
    
    const completedOrders = JSON.parse(localStorage.getItem('completedMtoOrders') || '[]');
    const completedOrder = orders.find(order => order.id === orderId);
    if (completedOrder) {
      completedOrders.push(completedOrder);
      localStorage.setItem('completedMtoOrders', JSON.stringify(completedOrders));
    }

    toast({
      title: "Order Completed",
      description: "The order has been marked as complete.",
    });
  };

  const handleExportExcel = () => {
    if (orders.length === 0) {
      toast({
        title: "No Orders to Export",
        description: "There are currently no MTO orders to export.",
        variant: "destructive"
      });
      return;
    }
    
    const formattedOrders = formatMTOOrdersForExport(orders);
    exportToExcel(formattedOrders, 'mto-orders');
    
    toast({
      title: "Export Successful",
      description: "MTO orders have been exported to Excel.",
    });
  };

  const handleExportPDF = () => {
    if (orders.length === 0) {
      toast({
        title: "No Orders to Export",
        description: "There are currently no MTO orders to export.",
        variant: "destructive"
      });
      return;
    }

    const formattedOrders = formatMTOOrdersForExport(orders);
    const headers = [
      'Date', 'Store', 'Name', 'Product Number', 'Tire Size', 'Custom Tire Size',
      'Casing Grade', 'Tire Tread', 'Quantity', 'Schedule', 'Priority', 'Notes', "Manager's Email"
    ];
    exportToPDF(formattedOrders, 'mto-orders', headers);
    
    toast({
      title: "Export Successful",
      description: "MTO orders have been exported to PDF.",
    });
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 backdrop-blur-sm bg-sky-500 hover:bg-sky-400 rounded-3xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Current MTO Orders</h2>
        <div className="flex gap-2">
          <Button
            onClick={handleExportExcel}
            variant="outline"
            className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </Button>
          <Button
            onClick={handleExportPDF}
            variant="outline"
            className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white"
          >
            <FileText className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Product Number</TableHead>
            <TableHead>Tire Size</TableHead>
            <TableHead>Tire Tread</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id}>
              <TableCell>{new Date(order.timestamp).toLocaleDateString()}</TableCell>
              <TableCell>{order.productNumber}</TableCell>
              <TableCell>{order.customTireSize || order.tireSize}</TableCell>
              <TableCell>{order.tireTreadNeeded}</TableCell>
              <TableCell>{order.quantity}</TableCell>
              <TableCell>{order.priority}</TableCell>
              <TableCell>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleComplete(order.id)}
                >
                  Mark Complete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

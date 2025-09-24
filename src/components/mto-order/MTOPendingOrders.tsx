
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ExportButton } from "@/components/ExportButton";
import { Calendar, Package, Ruler, Hash, Clock, Trash } from "lucide-react";
import { useFetchMTOOrders } from "@/hooks/useFetchMTOOrders";

interface MTOOrder {
  id: string;
  timestamp: string;
  store: string;
  name: string;
  product_number: string; // Updated to match Supabase schema
  casing_grade: string;   // Updated to match Supabase schema
  tire_size: string;      // Updated to match Supabase schema
  tread: string;          // Updated to match Supabase schema
  quantity: number;       // Updated to match Supabase schema
  notes: string;
  plant: string;
  status: string;
}

export const MTOPendingOrders = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Use Supabase hook instead of localStorage
  const { orders: mtoOrders, loading, error, refreshOrders } = useFetchMTOOrders();
  
  // Filter only open orders for this component
  const orders = mtoOrders.filter(order => order.status === 'open');

  const handleDelete = (orderId: string) => {
    if (!user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admin users can delete orders.",
        variant: "destructive"
      });
      return;
    }
    
    // TODO: Implement Supabase delete when needed
    // For now, just show message that this would delete from database
    toast({
      title: "Delete Functionality",
      description: "Delete functionality requires database implementation. Order will remain visible.",
      variant: "destructive"
    });
  };

  return (
    <div className="mt-8 bg-white shadow-md rounded-lg border border-slate-200">
      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-slate-800 font-bold text-2xl flex items-center">
            Pending MTO Orders
          </h2>
          
          <ExportButton 
            data={orders} 
            filename="mto-orders" 
            variant="outline"
            className="bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition-colors duration-200"
          />
        </div>
        
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <Table>
            <TableHeader className="bg-cyan-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700 text-center py-3">
                  <span className="flex items-center justify-center gap-1.5">
                    <Calendar className="h-4 w-4 text-cyan-600" />
                    <span>Date</span>
                  </span>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-center py-3">
                  <span className="flex items-center justify-center gap-1.5">
                    <Package className="h-4 w-4 text-cyan-600" />
                    <span>Store</span>
                  </span>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-center py-3">
                  <span className="flex items-center justify-center gap-1.5">
                    <Package className="h-4 w-4 text-cyan-600" />
                    <span>Product</span>
                  </span>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-center py-3">
                  <span className="flex items-center justify-center gap-1.5">
                    <Ruler className="h-4 w-4 text-cyan-600" />
                    <span>Size</span>
                  </span>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-center py-3">
                  <span className="flex items-center justify-center gap-1.5">
                    <Hash className="h-4 w-4 text-cyan-600" />
                    <span>Quantity</span>
                  </span>
                </TableHead>
                <TableHead className="font-semibold text-slate-700 text-center py-3">
                  <span className="flex items-center justify-center gap-1.5">
                    <Clock className="h-4 w-4 text-cyan-600" />
                    <span>Plant (Status)</span>
                  </span>
                </TableHead>
                {user?.isAdmin && (
                  <TableHead className="font-semibold text-slate-700 text-center py-3">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell 
                    colSpan={user?.isAdmin ? 7 : 6} 
                    className="text-center py-8 text-slate-500 italic"
                  >
                    Loading MTO orders...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell 
                    colSpan={user?.isAdmin ? 7 : 6} 
                    className="text-center py-8 text-red-500 italic"
                  >
                    Error loading orders: {error.message}
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={user?.isAdmin ? 7 : 6} 
                    className="text-center py-8 text-slate-500 italic"
                  >
                    No open MTO orders found for your plant
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order, index) => (
                  <TableRow 
                    key={order.id}
                    className={`hover:bg-blue-50 transition-colors ${
                      index % 2 === 0 ? 'bg-slate-50' : 'bg-white'
                    }`}
                  >
                    <TableCell className="text-center text-slate-700">
                      {new Date(order.timestamp).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-center text-slate-700">{order.store}</TableCell>
                    <TableCell className="text-center text-slate-700">{order.product_number}</TableCell>
                    <TableCell className="text-center text-slate-700">{order.tire_size}</TableCell>
                    <TableCell className="text-center text-slate-700">{order.quantity}</TableCell>
                    <TableCell className="text-center text-slate-700">
                      {order.plant} ({order.status})
                    </TableCell>
                    {user?.isAdmin && (
                      <TableCell className="text-center">
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={() => handleDelete(order.id)}
                          className="px-3 py-1 h-auto font-medium flex items-center gap-1.5 bg-red-500 hover:bg-red-600 transition-colors"
                        >
                          <Trash className="h-4 w-4" />
                          Delete
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>  
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

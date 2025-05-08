
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar, PackageOpen, FileText, Hash, Mail, CheckCircle, Building } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";

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

interface PendingOrdersTableProps {
  orders: Order[];
  onComplete: (orderId: string) => void;
}

export function PendingOrdersTable({ orders, onComplete }: PendingOrdersTableProps) {
  const { user } = useAuth();
  const { selectedPlant, PLANT_WEBHOOKS } = usePlant();

  // Debug log to see if webhook URLs are available
  console.log("🔍 TABLE DEBUG - Selected Plant:", selectedPlant);
  console.log("🔍 TABLE DEBUG - Plant Webhooks:", PLANT_WEBHOOKS[selectedPlant]?.transferRequests);
  
  return (
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
                      onClick={() => onComplete(order.id)}
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
  );
}

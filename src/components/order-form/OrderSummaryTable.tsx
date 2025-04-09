
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OrderSummary } from "./types";
import { ExportButton } from "@/components/ExportButton";

export interface OrderSummaryTableProps {
  orderSummaries: OrderSummary[];
  onToggleSelection: (orderId: string) => void;
}

export const OrderSummaryTable = ({
  orderSummaries,
  onToggleSelection
}: OrderSummaryTableProps) => {
  if (orderSummaries.length === 0) return null;
  
  return (
    <div className="max-w-full mx-auto bg-white p-6 rounded-lg shadow-lg border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Order Summary</h2>
        <ExportButton 
          data={orderSummaries} 
          filename="pending-orders" 
          variant="outline"
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Select</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Cross Dock</TableHead>
              <TableHead>Cross Dock Destination</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderSummaries.map(order => (
              <TableRow key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <TableCell>
                  <Checkbox 
                    checked={order.selected} 
                    onCheckedChange={() => onToggleSelection(order.id)} 
                  />
                </TableCell>
                <TableCell className="font-medium">{order.productNumber}</TableCell>
                <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>{order.scheduleArrival}</TableCell>
                <TableCell>{order.crossDock}</TableCell>
                <TableCell>{order.crossDockDestination || '-'}</TableCell>
                <TableCell className="max-w-xs truncate">{order.notes || '-'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

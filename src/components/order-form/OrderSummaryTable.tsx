
import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { OrderSummary } from "./types";
import { ExportButton } from "@/components/ExportButton";
import { AlertTriangle } from "lucide-react";

export interface OrderSummaryTableProps {
  orderSummaries: OrderSummary[];
  onToggleSelection: (orderId: string) => void;
  inventoryWarnings?: Record<string, { isOutOfStock: boolean; availableQty: number; requestedQty: number }>;
}

export const OrderSummaryTable = ({
  orderSummaries,
  onToggleSelection,
  inventoryWarnings = {}
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
              <TableHead>Status</TableHead>
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
            {orderSummaries.map(order => {
              const warning = inventoryWarnings[order.id];
              const hasWarning = warning && (warning.isOutOfStock || warning.requestedQty > warning.availableQty);
              
              return (
                <TableRow 
                  key={order.id} 
                  className={`border-b border-gray-100 hover:bg-gray-50 ${
                    hasWarning ? 'bg-destructive/5' : ''
                  }`}
                >
                  <TableCell>
                    <Checkbox 
                      checked={order.selected} 
                      onCheckedChange={() => onToggleSelection(order.id)} 
                    />
                  </TableCell>
                  <TableCell>
                    {hasWarning ? (
                      warning.isOutOfStock ? (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <AlertTriangle className="h-3 w-3" />
                          OUT OF STOCK
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1 w-fit bg-yellow-50 text-yellow-700 border-yellow-300">
                          <AlertTriangle className="h-3 w-3" />
                          LOW STOCK
                        </Badge>
                      )
                    ) : (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                        IN STOCK
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{order.productNumber}</TableCell>
                  <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                  <TableCell>
                    {order.quantity}
                    {warning && !warning.isOutOfStock && (
                      <span className="text-xs text-muted-foreground ml-1">
                        ({warning.availableQty} avail)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{order.scheduleArrival}</TableCell>
                  <TableCell>{order.crossDock}</TableCell>
                  <TableCell>{order.crossDockDestination || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">{order.notes || '-'}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

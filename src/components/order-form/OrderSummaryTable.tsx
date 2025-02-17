import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { OrderSummary } from "./types";
export interface OrderSummaryTableProps {
  orderSummaries: OrderSummary[];
  onToggleSelection: (orderId: string) => void;
}
export const OrderSummaryTable = ({
  orderSummaries,
  onToggleSelection
}: OrderSummaryTableProps) => {
  if (orderSummaries.length === 0) return null;
  return <div className="max-w-3xl mx-auto p-4 bg-white/90 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-3 text-primary">Order Summary</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Select</TableHead>
              <TableHead>Order ID</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Manager Email</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orderSummaries.map(order => <TableRow key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <TableCell className="bg-red-600 hover:bg-red-500 mx-0 px-[30px] rounded-3xl">
                  <Checkbox checked={order.selected} onCheckedChange={() => onToggleSelection(order.id)} />
                </TableCell>
                <TableCell className="max-w-[150px] truncate">{order.id}</TableCell>
                <TableCell className="bg-lime-300 hover:bg-lime-200 rounded-3xl px-[25px] py-[10px] my-0 mx-0">{order.store}</TableCell>
                <TableCell>{order.productNumber}</TableCell>
                <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>{order.scheduleArrival}</TableCell>
                <TableCell className="max-w-xs truncate whitespace-normal break-words bg-yellow-300 hover:bg-yellow-200 rounded-3xl">
                  {order.managersEmail || 'No email set'}
                </TableCell>
                <TableCell>Pending</TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </div>
    </div>;
};
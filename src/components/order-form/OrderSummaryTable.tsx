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
  return <div className="max-w-3xl mx-auto p-4 rounded-lg shadow-lg border border-gray-200 bg-sky-500 hover:bg-sky-400 px-0 py-[16px]">
      <h2 className="mb-3 text-4xl mx-[240px] text-inherit font-extrabold">Order Summary</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Select</TableHead>
              <TableHead className="px-0">Order ID</TableHead>
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
                <TableCell className="mx-0 px-[30px] rounded-3xl bg-teal-400 hover:bg-teal-300">
                  <Checkbox checked={order.selected} onCheckedChange={() => onToggleSelection(order.id)} className="text-gray-950 bg-rose-600 hover:bg-rose-500" />
                </TableCell>
                <TableCell className="max-w-[150px] truncate rounded-3xl bg-teal-400 hover:bg-teal-300">{order.id}</TableCell>
                <TableCell className="rounded-3xl px-[25px] py-[10px] my-0 mx-0 bg-teal-400 hover:bg-teal-300">{order.store}</TableCell>
                <TableCell className="px-0 py-0 mx-[240px] bg-teal-400 hover:bg-teal-300 rounded-full">{order.productNumber}</TableCell>
                <TableCell className="max-w-xs truncate bg-teal-400 hover:bg-teal-300 rounded-full">{order.description}</TableCell>
                <TableCell className="bg-teal-400 hover:bg-teal-300 rounded-full">{order.quantity}</TableCell>
                <TableCell className="bg-teal-400 hover:bg-teal-300 my-0 rounded-full">{order.scheduleArrival}</TableCell>
                <TableCell className="max-w-xs truncate whitespace-normal break-words bg-yellow-300 hover:bg-yellow-200 rounded-3xl">
                  {order.managersEmail || 'No email set'}
                </TableCell>
                <TableCell className="bg-teal-400 hover:bg-teal-300 rounded-full">Pending</TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
      </div>
    </div>;
};
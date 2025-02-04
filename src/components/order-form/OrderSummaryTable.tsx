import { Checkbox } from "@/components/ui/checkbox";
import { type FormData } from "./formConfig";

interface OrderSummary extends FormData {
  id: string;
  timestamp: string;
  store: string;
  selected?: boolean;
}

export interface OrderSummaryTableProps {
  orderSummaries: OrderSummary[];
  onToggleSelection: (orderId: string) => void;
}

export const OrderSummaryTable = ({
  orderSummaries,
  onToggleSelection,
}: OrderSummaryTableProps) => {
  if (orderSummaries.length === 0) return null;

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white/90 rounded-lg shadow-lg border border-gray-200">
      <h2 className="text-lg font-semibold mb-3 text-primary">Order Summary</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-3 py-2 text-left">Select</th>
              <th className="px-3 py-2 text-left">Product</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Qty</th>
              <th className="px-3 py-2 text-left">Schedule</th>
            </tr>
          </thead>
          <tbody>
            {orderSummaries.map((order) => (
              <tr key={order.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2">
                  <Checkbox
                    checked={order.selected}
                    onCheckedChange={() => onToggleSelection(order.id)}
                  />
                </td>
                <td className="px-3 py-2">{order.productNumber}</td>
                <td className="px-3 py-2 max-w-xs truncate">{order.description}</td>
                <td className="px-3 py-2">{order.quantity}</td>
                <td className="px-3 py-2">{order.scheduleArrival}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { type FormData } from "./formConfig";

interface OrderSummary extends FormData {
  id: string;
  timestamp: string;
  store: string;
  selected?: boolean;
}

export interface OrderSummaryTableProps {
  orderSummaries: OrderSummary[];
  isSubmitting: boolean;
  onToggleSelection: (orderId: string) => void;
  onSubmitSelected: () => void;
}

export const OrderSummaryTable = ({
  orderSummaries,
  isSubmitting,
  onToggleSelection,
  onSubmitSelected,
}: OrderSummaryTableProps) => {
  if (orderSummaries.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-2">Select</th>
              <th className="px-4 py-2">Product</th>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Quantity</th>
              <th className="px-4 py-2">Schedule</th>
            </tr>
          </thead>
          <tbody>
            {orderSummaries.map((order) => (
              <tr key={order.id} className="border-b">
                <td className="px-4 py-2">
                  <Checkbox
                    checked={order.selected}
                    onCheckedChange={() => onToggleSelection(order.id)}
                  />
                </td>
                <td className="px-4 py-2">{order.productNumber}</td>
                <td className="px-4 py-2">{order.description}</td>
                <td className="px-4 py-2">{order.quantity}</td>
                <td className="px-4 py-2">{order.scheduleArrival}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex justify-end">
        <Button
          onClick={onSubmitSelected}
          disabled={isSubmitting || !orderSummaries.some(order => order.selected)}
        >
          {isSubmitting ? "Submitting..." : "Submit Selected Orders"}
        </Button>
      </div>
    </div>
  );
};
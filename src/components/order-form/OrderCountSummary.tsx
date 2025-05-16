
import React from "react";
import { OrderSummary } from "@/hooks/useOrderSubmission";

interface OrderCountSummaryProps {
  selectedOrders: OrderSummary[];
  totalOrders: number;
}

export function OrderCountSummary({ selectedOrders, totalOrders }: OrderCountSummaryProps) {
  return (
    <div>
      <h3 className="font-medium mb-1">Submit Selected Orders</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {selectedOrders.length} of {totalOrders} orders selected
      </p>
    </div>
  );
}

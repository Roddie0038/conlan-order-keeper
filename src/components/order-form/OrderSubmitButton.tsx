
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { OrderSummary } from "@/hooks/useOrderSubmission";

interface OrderSubmitButtonProps {
  isSubmitting: boolean;
  selectedOrders: OrderSummary[];
  testMode: boolean;
  isAdmin: boolean;
  onSubmit: () => void;
  recipientCount?: number;
}

export function OrderSubmitButton({ 
  isSubmitting, 
  selectedOrders, 
  testMode, 
  isAdmin, 
  onSubmit,
  recipientCount = 1
}: OrderSubmitButtonProps) {
  return (
    <Button
      onClick={onSubmit}
      disabled={isSubmitting || selectedOrders.length === 0 || recipientCount === 0}
      className="bg-green-600 hover:bg-green-700"
    >
      {isSubmitting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Check className="h-4 w-4 mr-2" />
      )}
      {recipientCount === 0 ? "Add Recipients to Submit" : `Submit ${selectedOrders.length} Order${selectedOrders.length !== 1 ? 's' : ''}`}
      {isAdmin && !testMode && " (Test Mode)"}
    </Button>
  );
}

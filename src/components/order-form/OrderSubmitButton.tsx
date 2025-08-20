
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
  isRecipientsLoading?: boolean;
  recipientsReady?: boolean;
  recipientError?: Error;
}

export function OrderSubmitButton({ 
  isSubmitting, 
  selectedOrders, 
  testMode, 
  isAdmin, 
  onSubmit,
  recipientCount = 1,
  isRecipientsLoading = false,
  recipientsReady = true,
  recipientError
}: OrderSubmitButtonProps) {
  
  // Clear submission logic with detailed reasons
  const canSubmit = 
    !isSubmitting &&
    selectedOrders.length > 0 &&
    !isRecipientsLoading &&
    recipientsReady &&
    recipientCount > 0;

  const getDisabledReason = (): string | null => {
    if (isSubmitting) return "Submitting...";
    if (selectedOrders.length === 0) return "Select at least one order";
    if (isRecipientsLoading) return "Loading recipients";
    if (!recipientsReady) return "Preparing recipients";
    if (recipientError) return "Recipients error (check logs)";
    if (recipientCount === 0) return "No recipients resolved";
    return null;
  };

  const disabledReason = getDisabledReason();
  
  return (
    <Button
      onClick={onSubmit}
      disabled={!canSubmit}
      className="bg-green-600 hover:bg-green-700"
      title={disabledReason || undefined}
    >
      {isSubmitting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Check className="h-4 w-4 mr-2" />
      )}
      {disabledReason || `Submit ${selectedOrders.length} Order${selectedOrders.length !== 1 ? 's' : ''}`}
      {isAdmin && !testMode && " (Test Mode)"}
    </Button>
  );
}

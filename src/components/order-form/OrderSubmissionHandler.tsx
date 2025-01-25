import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import type { OrderSummary } from "./types";
import { LoadingOverlay } from "./LoadingOverlay";

interface OrderSubmissionHandlerProps {
  orderSummaries: OrderSummary[];
  setOrderSummaries: React.Dispatch<React.SetStateAction<OrderSummary[]>>;
}

export const OrderSubmissionHandler = ({
  orderSummaries,
  setOrderSummaries,
}: OrderSubmissionHandlerProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitSelected = async () => {
    setIsSubmitting(true);
    const selectedOrders = orderSummaries.filter(order => order.selected);
    
    try {
      for (const order of selectedOrders) {
        await submitToGoogleSheets(order);
        
        const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        existingOrders.push(order);
        localStorage.setItem('pendingOrders', JSON.stringify(existingOrders));
      }
      
      setOrderSummaries(prev => prev.filter(order => !order.selected));
      
      toast({
        title: "Orders Submitted",
        description: `Successfully submitted ${selectedOrders.length} orders.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <LoadingOverlay isVisible={isSubmitting} />
      {orderSummaries.length > 0 && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmitSelected}
            disabled={isSubmitting || !orderSummaries.some(order => order.selected)}
            className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
          >
            Submit Selected Orders
          </button>
        </div>
      )}
    </>
  );
};
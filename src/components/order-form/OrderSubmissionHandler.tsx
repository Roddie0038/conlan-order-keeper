
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import type { OrderSummary } from "./types";
import { LoadingOverlay } from "./LoadingOverlay";
import { useAuth } from "@/contexts/AuthContext";
import { storeManagerEmails } from "./formConfig";

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
  const { user } = useAuth();

  const getManagerEmail = (store: string) => {
    if (store === "Admin") return storeManagerEmails["Admin"];
    const storeId = store.split(' ')[1];
    return storeManagerEmails[storeId] || '';
  };

  const handleSubmitSelected = async () => {
    setIsSubmitting(true);
    const selectedOrders = orderSummaries.filter(order => order.selected);
    
    try {
      for (const order of selectedOrders) {
        const managerEmail = getManagerEmail(user?.store || '');
        await submitToGoogleSheets({
          ...order,
          managerEmail
        });
        
        const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        existingOrders.push({
          ...order,
          managerEmail
        });
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

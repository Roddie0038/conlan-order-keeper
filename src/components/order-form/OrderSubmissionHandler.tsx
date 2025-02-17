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
  setOrderSummaries
}: OrderSubmissionHandlerProps) => {
  const {
    toast
  } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    user
  } = useAuth();
  const getManagerEmail = (store: string) => {
    // Extract store number from store name (e.g., "Fort Worth 22" -> "22")
    const storeNumber = store.split(' ').pop();
    if (!storeNumber) return '';
    return storeManagerEmails[storeNumber] || '';
  };
  const handleSubmitSelected = async () => {
    setIsSubmitting(true);
    const selectedOrders = orderSummaries.filter(order => order.selected);
    try {
      for (const order of selectedOrders) {
        const managersEmail = getManagerEmail(order.store);
        console.log(`Submitting order for store ${order.store} with manager email: ${managersEmail}`);
        await submitToGoogleSheets({
          ...order,
          managersEmail: managersEmail
        });
        const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        existingOrders.push({
          ...order,
          managersEmail: managersEmail
        });
        localStorage.setItem('pendingOrders', JSON.stringify(existingOrders));
      }
      setOrderSummaries(prev => prev.filter(order => !order.selected));
      toast({
        title: "Orders Submitted",
        description: `Successfully submitted ${selectedOrders.length} orders.`
      });
    } catch (error) {
      console.error("Error submitting orders:", error);
      toast({
        title: "Error",
        description: "Failed to submit orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <>
      <LoadingOverlay isVisible={isSubmitting} />
      {orderSummaries.length > 0 && <div className="flex justify-end mt-4">
          <button onClick={handleSubmitSelected} disabled={isSubmitting || !orderSummaries.some(order => order.selected)} className="text-white rounded disabled:opacity-50 my-0 mx-0 px-[240px] py-[50px] bg-red-600 hover:bg-red-500">
            Submit Selected Orders
          </button>
        </div>}
    </>;
};
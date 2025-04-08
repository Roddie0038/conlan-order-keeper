import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { decreaseInventoryQuantity } from "@/services/inventoryService";
import type { OrderSummary } from "./types";
import { LoadingOverlay } from "./LoadingOverlay";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { storeManagerEmails } from "./formConfig";

interface OrderSubmissionHandlerProps {
  orderSummaries: OrderSummary[];
  setOrderSummaries: React.Dispatch<React.SetStateAction<OrderSummary[]>>;
}

export const OrderSubmissionHandler = ({
  orderSummaries,
  setOrderSummaries
}: OrderSubmissionHandlerProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { selectedPlant } = usePlant();

  const getManagerEmail = (store: string) => {
    const storeNumber = store.split(' ').pop();
    if (!storeNumber) return '';
    return storeManagerEmails[storeNumber] || '';
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const handleSubmitSelected = async () => {
    setIsSubmitting(true);
    const selectedOrders = orderSummaries.filter(order => order.selected);
    
    try {
      for (let i = 0; i < selectedOrders.length; i++) {
        const order = selectedOrders[i];
        const managersEmail = getManagerEmail(order.store);
        
        console.log(`Submitting order ${i + 1} of ${selectedOrders.length} for store ${order.store} with manager email: ${managersEmail}`);
        
        await submitToGoogleSheets({
          ...order,
          managersEmail: managersEmail,
          plant: selectedPlant
        });

        try {
          const quantity = parseInt(order.quantity, 10);
          if (!isNaN(quantity) && order.productNumber) {
            console.log(`Decreasing inventory for product: ${order.productNumber}, quantity: ${quantity}`);
            const result = await decreaseInventoryQuantity(order.productNumber, quantity);
            console.log('Inventory update result:', result);
            
            if (result.status === 'error') {
              toast({
                title: "Inventory Warning",
                description: `${result.message} for ${order.productNumber}`,
                variant: "destructive"
              });
            } else if (result.status === 'success') {
              toast({
                title: "Inventory Updated",
                description: `Reduced inventory for ${result.productNumber} from ${result.previous} to ${result.current}`,
              });
            }
          }
        } catch (inventoryError) {
          console.error("Error updating inventory:", inventoryError);
          toast({
            title: "Inventory Error",
            description: `Failed to update inventory for ${order.productNumber}. Please check admin console.`,
            variant: "destructive"
          });
        }

        const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        existingOrders.push({
          ...order,
          managersEmail: managersEmail,
          plant: selectedPlant
        });
        localStorage.setItem('pendingOrders', JSON.stringify(existingOrders));

        toast({
          title: `Order ${i + 1} Submitted`,
          description: `Successfully submitted order ${i + 1} of ${selectedOrders.length}.`
        });

        if (i < selectedOrders.length - 1) {
          await delay(60000);
        }
      }

      setOrderSummaries(prev => prev.filter(order => !order.selected));
      
      toast({
        title: "All Orders Submitted",
        description: `Successfully submitted all ${selectedOrders.length} orders.`
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

  return (
    <>
      <LoadingOverlay isVisible={isSubmitting} />
      {orderSummaries.length > 0 && (
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmitSelected}
            disabled={isSubmitting || !orderSummaries.some(order => order.selected)}
            className="text-white disabled:opacity-50 bg-red-600 hover:bg-red-500 py-[20px] rounded-3xl px-[240px] mx-[240px] my-0"
          >
            Submit Selected Orders
          </button>
        </div>
      )}
    </>
  );
};


import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { usePlant } from "@/contexts/PlantContext";
import { getManagerEmail } from "@/components/order-form/formConfig";
import type { OrderSummary } from "./types";

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
  const { selectedPlant } = usePlant();

  const handleSubmitSelected = async () => {
    const selectedOrders = orderSummaries.filter(order => order.selected);
    
    if (selectedOrders.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select at least one order to submit.",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      for (const order of selectedOrders) {
        const managersEmail = getManagerEmail(order.store);
        
        await submitToGoogleSheets({
          ...order,
          managersEmail,
          plant: selectedPlant,
          timestamp: new Date().toISOString(),
        });

        // Store in localStorage for persistence
        const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        existingOrders.push({
          ...order,
          managersEmail,
          plant: selectedPlant
        });
        localStorage.setItem('pendingOrders', JSON.stringify(existingOrders));
      }

      // Remove submitted orders from the list
      setOrderSummaries(prev => prev.filter(order => !order.selected));
      
      toast({
        title: "Orders Submitted",
        description: `Successfully submitted ${selectedOrders.length} order(s).`
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
    orderSummaries.length > 0 ? (
      <div className="mt-6 flex justify-end">
        <Button
          onClick={handleSubmitSelected}
          disabled={isSubmitting || !orderSummaries.some(order => order.selected)}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center gap-2"
        >
          {isSubmitting ? (
            "Submitting..."
          ) : (
            <>
              <Send className="h-4 w-4" /> Submit Selected Orders
            </>
          )}
        </Button>
      </div>
    ) : null
  );
};

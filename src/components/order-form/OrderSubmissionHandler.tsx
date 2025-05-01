
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { usePlant } from "@/contexts/PlantContext";
import { getManagerEmail } from "@/components/order-form/formConfig";
import { saveOrderToSupabase } from "@/services/orderService";
import type { OrderSummary } from "./types";
import { OrderType } from "@/services/webhook/config";

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
        
        // Get destination manager email if crossDock is "Yes"
        let destinationManagerEmail = "";
        if (order.crossDock === "Yes" && order.crossDockDestination) {
          destinationManagerEmail = getManagerEmail(order.crossDockDestination);
        }
        
        // Create the submission data with proper typing
        const submissionData = {
          ...order,
          managersEmail,
          plant: selectedPlant,
          timestamp: new Date().toISOString(),
          type: order.type || "TRANSFER" as OrderType, 
        };
        
        // Add cross dock specific fields only when crossDock is "Yes"
        if (order.crossDock === "Yes") {
          submissionData.destinationManagerEmail = destinationManagerEmail;
        }

        await submitToGoogleSheets(submissionData);

        await saveOrderToSupabase({
          name: order.yourName,
          store: order.store,
          productNumber: order.productNumber,
          description: order.description,
          quantity: order.quantity,
          scheduleArrival: order.scheduleArrival,
          notes: order.notes,
          crossDock: order.crossDock,
          crossDockDestination: order.crossDockDestination,
          receiverNo: order.receiverNo,
          etaDate: order.etaDate,
          destinationManagerEmail: order.crossDock === "Yes" ? destinationManagerEmail : undefined,
          email: managersEmail,
          timestamp: new Date().toISOString(),
          type: order.type || "TRANSFER"
        });

        const existingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        existingOrders.push({
          ...order,
          managersEmail,
          destinationManagerEmail: order.crossDock === "Yes" ? destinationManagerEmail : undefined,
          plant: selectedPlant,
          type: order.type || "TRANSFER"
        });
        localStorage.setItem('pendingOrders', JSON.stringify(existingOrders));
      }

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

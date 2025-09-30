import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { simpleTransferSubmission } from "@/services/orderSubmission/simpleTransferSubmission";
import { OrderCountSummary } from "../order-form/OrderCountSummary";
import { OrderSubmitButton } from "../order-form/OrderSubmitButton";
import { useToast } from "@/hooks/use-toast";
import { TransferOrderSummary } from "./TransferRequestForm";

interface TransferSubmissionHandlerProps {
  orderSummaries: TransferOrderSummary[];
  setOrderSummaries: React.Dispatch<React.SetStateAction<TransferOrderSummary[]>>;
}

export function TransferSubmissionHandler({ 
  orderSummaries, 
  setOrderSummaries 
}: TransferSubmissionHandlerProps) {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const { toast } = useToast();
  const isAdmin = user?.isAdmin || false;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testMode] = useState(true); // Always enable notifications

  const selectedOrders = orderSummaries.filter(order => order.selected);

  // Submit orders handler using SIMPLE transfer submission (NO regional logic)
  const submitOrders = async () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No orders selected",
        description: "Please select at least one order to submit",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    console.log("[SUBMIT] Transfer Request - Starting SIMPLE submission");
    console.log(`[SUBMIT] Transfer Request - Processing ${selectedOrders.length} orders to plant: ${selectedPlant}`);
    console.log("[SUBMIT] Transfer Request - NO regional logic, NO plant mapping");
    
    try {
      // Use SIMPLE transfer submission utility (NO getPlantForStore or regional logic)
      const result = await simpleTransferSubmission(
        selectedOrders,
        selectedPlant
      );
      
      // Only clear orders after ALL are processed
      if (result.successes > 0) {
        // Remove only the successfully processed orders
        setOrderSummaries(prev => prev.filter(order => !order.selected));
        
        toast({
          title: "🚚 Transfer requests submitted! 🚚",
          description: `${result.successes} transfer request(s) submitted successfully${result.failures > 0 ? `, ${result.failures} failed` : ''}.`
        });
      }
      
      if (result.failures > 0 && result.successes === 0) {
        toast({
          title: "Submission failed",
          description: `${result.failures} transfer request(s) failed to submit. Please try again.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("[SUBMIT] Transfer Request - Error submitting orders:", error);
      toast({
        title: "Error submitting transfer requests",
        description: "There was an error submitting the requests. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (orderSummaries.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <OrderCountSummary 
          selectedOrders={selectedOrders} 
          totalOrders={orderSummaries.length} 
        />
        
        <div className="flex items-center gap-4">
          <OrderSubmitButton 
            isSubmitting={isSubmitting}
            selectedOrders={selectedOrders}
            testMode={testMode}
            isAdmin={isAdmin}
            onSubmit={submitOrders}
          />
        </div>
      </div>
    </div>
  );
}
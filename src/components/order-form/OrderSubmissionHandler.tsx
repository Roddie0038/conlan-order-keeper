
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useOrderSubmission, OrderSummary } from "@/hooks/useOrderSubmission";
import { unifiedOrderSubmission } from "@/services/orderSubmission/unifiedOrderSubmission";
import { OrderCountSummary } from "./OrderCountSummary";
import { OrderSubmitButton } from "./OrderSubmitButton";
import { useToast } from "@/hooks/use-toast";

interface OrderSubmissionHandlerProps {
  orderSummaries: OrderSummary[];
  setOrderSummaries: React.Dispatch<React.SetStateAction<OrderSummary[]>>;
}

export function OrderSubmissionHandler({ 
  orderSummaries, 
  setOrderSummaries 
}: OrderSubmissionHandlerProps) {
  const { user } = useAuth();
  const { selectedPlant, PLANT_WEBHOOKS } = usePlant();
  const { toast } = useToast();
  const isAdmin = user?.isAdmin || false;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testMode] = useState(true); // Always enable notifications

  const selectedOrders = orderSummaries.filter(order => order.selected);

  // Submit orders handler using unified submission
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
    console.log("[SUBMIT] Regional Orders - Starting submission");
    console.log(`[SUBMIT] Regional Orders - Processing ${selectedOrders.length} orders with complex routing`);
    
    try {
      // Use unified submission utility with all regional logic intact
      const result = await unifiedOrderSubmission(
        selectedOrders,
        selectedPlant,
        PLANT_WEBHOOKS,
        isAdmin
      );
      
      // Only clear orders after ALL are processed
      if (result.successes > 0) {
        // Remove only the successfully processed orders
        const successIds = new Set(
          result.results.filter(r => r.status === 'success').map(r => r.orderId)
        );
        setOrderSummaries(prev => prev.filter(order => !successIds.has(order.id)));
        
        toast({
          title: "🚚 Regional orders submitted! 🚚",
          description: `${result.successes} order(s) submitted successfully${result.failures > 0 ? `, ${result.failures} failed` : ''}.`
        });
      }
      
      if (result.failures > 0 && result.successes === 0) {
        toast({
          title: "Submission failed",
          description: `${result.failures} order(s) failed to submit. Please try again.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("[SUBMIT] Regional Orders - Error submitting orders:", error);
      toast({
        title: "Error submitting orders",
        description: "There was an error submitting the orders. Please try again.",
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
    <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <OrderCountSummary 
          selectedOrders={selectedOrders} 
          totalOrders={orderSummaries.length} 
        />
        
        <div className="flex items-center gap-4">
          {/* Notifications are always enabled - AdminTestModeToggle removed */}
          
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

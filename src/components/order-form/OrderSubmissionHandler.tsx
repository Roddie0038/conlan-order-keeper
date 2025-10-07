
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { OrderCountSummary } from "./OrderCountSummary";
import { OrderSubmitButton } from "./OrderSubmitButton";
import { useToast } from "@/hooks/use-toast";
import { submitOtOrder, type OtOrderPayload } from "@/lib/ingestOtOrder";
import { getPlantForStore } from "@/utils/plantMapping";

interface OrderSubmissionHandlerProps {
  orderSummaries: any[];
  setOrderSummaries: React.Dispatch<React.SetStateAction<any[]>>;
}

export function OrderSubmissionHandler({ 
  orderSummaries, 
  setOrderSummaries 
}: OrderSubmissionHandlerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.isAdmin || false;
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedOrders = orderSummaries.filter(order => order.selected === true);

  // Submit orders handler - NEW FLOW: Direct to ingest-ot-order edge function only
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
    console.log("[SUBMIT] Starting new OT order submission flow (NO webhooks)");
    console.log(`[SUBMIT] Processing ${selectedOrders.length} orders`);
    
    try {
      let successCount = 0;
      let failCount = 0;
      const successIds: string[] = [];

      // Process each order via ingest-ot-order edge function
      for (const order of selectedOrders) {
        const plant = getPlantForStore(order.store);
        
        const payload: OtOrderPayload = {
          order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          product_number: order.productNumber, // Pass exactly as typed
          quantity: parseInt(order.quantity?.toString() || "0") || 0,
          store: order.store,
          plant: plant,
          submitted_by_email: user?.email || "",
          submitted_by_name: order.yourName || user?.name || "",
        };

        console.log("[SUBMIT] Sending to ingest-ot-order:", payload);
        const result = await submitOtOrder(payload);

        if (result.ok === true) {
          successCount++;
          successIds.push(order.id);
          console.log("✅ Order submitted:", result.id);
        } else {
          failCount++;
          console.error("❌ Order failed:", result.status, result.message);
        }
      }
      
      // Remove only successfully submitted orders
      if (successCount > 0) {
        const successIdsSet = new Set(successIds);
        setOrderSummaries(prev => prev.filter(order => !successIdsSet.has(order.id)));
        
        toast({
          title: "Orders submitted",
          description: `${successCount} order(s) submitted successfully${failCount > 0 ? `, ${failCount} failed` : ''}.`
        });
      }
      
      if (failCount > 0 && successCount === 0) {
        toast({
          title: "Submission failed",
          description: `${failCount} order(s) failed to submit. Please try again.`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("[SUBMIT] Error submitting orders:", error);
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
          <OrderSubmitButton 
            isSubmitting={isSubmitting}
            selectedOrders={selectedOrders}
            testMode={true}
            isAdmin={isAdmin}
            onSubmit={submitOrders}
          />
        </div>
      </div>
    </div>
  );
}

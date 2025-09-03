
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrderFormSubmitV4, OrderSummary } from "./hooks/useOrderFormSubmitV4";
import { OrderCountSummary } from "./OrderCountSummary";
import { StickyBar } from "@/components/ui/StickyBar";
import { NeoButton } from "@/components/ui/NeoButton";
import { toast } from "@/components/ui/use-toast";

interface OrderSubmissionHandlerProps {
  orderSummaries: OrderSummary[];
  setOrderSummaries: React.Dispatch<React.SetStateAction<OrderSummary[]>>;
  destinationPlant: string;
  recipientCount?: number;
  markSubmitting?: () => void;
  clearSubmitting?: () => void;
}

export function OrderSubmissionHandler({ 
  orderSummaries, 
  setOrderSummaries,
  destinationPlant,
  recipientCount = 1,
  markSubmitting,
  clearSubmitting
}: OrderSubmissionHandlerProps) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  
  // Always enable notifications - testMode is always true
  const [testMode] = useState(true);

  // Generate correlation ID for debugging
  const corr = (window as any).__corrId ??= crypto.randomUUID();
  const tag = (stage: string, extra: any = {}) =>
    console.info(`[ORDER_SUBMIT][${corr}] ${stage}`, extra);

  // Use new V4 submission hook for proper Supabase integration
  const { isSubmitting, handleSubmitOrders } = useOrderFormSubmitV4();

  const selectedOrders = orderSummaries.filter(order => order.selected);
  
  // Handler for successful submission
  const handleSubmissionSuccess = () => {
    // Remove submitted orders from summary
    setOrderSummaries(prev => prev.filter(order => !order.selected));
  };
  
  // Submit orders handler
  const submitOrders = async () => {
    tag('CLICK');
    
    // Guard: Check if any orders are selected
    if (selectedOrders.length === 0) {
      tag('GUARD_BLOCK', { reason: 'no_selected_orders' });
      toast({
        title: "No Orders Selected",
        description: `Select at least one order to submit [${corr}]`,
        variant: "destructive"
      });
      return;
    }

    tag('HANDLE_SUBMIT_ENTER', { selectedOrderCount: selectedOrders.length });
    markSubmitting?.();
    
    try {
      await handleSubmitOrders(selectedOrders, handleSubmissionSuccess, corr);
    } finally {
      clearSubmitting?.();
      tag('ONSUBMIT_EXIT');
    }
  };
  
  if (orderSummaries.length === 0) {
    return null;
  }
  
  return (
    <StickyBar>
      <div className="flex items-center gap-4">
        <OrderCountSummary 
          selectedOrders={selectedOrders} 
          totalOrders={orderSummaries.length} 
        />
        
        <NeoButton 
          variant="primary"
          size="lg"
          onClick={submitOrders}
          disabled={isSubmitting || selectedOrders.length === 0}
        >
          {isSubmitting ? "Submitting..." : `Submit ${selectedOrders.length} Order${selectedOrders.length !== 1 ? 's' : ''}`}
        </NeoButton>
      </div>
    </StickyBar>
  );
}

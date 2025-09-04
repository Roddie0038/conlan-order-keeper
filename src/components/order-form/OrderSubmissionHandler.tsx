import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrderFormSubmitV4, OrderSummary } from "./hooks/useOrderFormSubmitV4";
import { OrderCountSummary } from "./OrderCountSummary";
import { NeoButton } from "@/components/ui/NeoButton";
import { toast } from "@/components/ui/use-toast";

interface OrderSubmissionHandlerProps {
  orderSummaries: OrderSummary[];
  setOrderSummaries: React.Dispatch<React.SetStateAction<OrderSummary[]>>;
  destinationPlant: string;
  recipientCount?: number;
  markSubmitting?: () => void;
  clearSubmitting?: () => void;
  formHandleSubmit?: (callback: () => Promise<void>) => (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export function OrderSubmissionHandler({ 
  orderSummaries, 
  setOrderSummaries,
  destinationPlant,
  recipientCount = 1,
  markSubmitting,
  clearSubmitting,
  formHandleSubmit
}: OrderSubmissionHandlerProps) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  
  // Always enable notifications - testMode is always true
  const [testMode] = useState(true);

  // Generate correlation ID for debugging
  const corr = (window as any).__corrId ??= crypto.randomUUID();
  const tag = (stage: string, extra: any = {}) =>
    console.info(`[ORDER_SUBMIT][${corr}] ${stage}`, extra);

  // Add build info on component mount
  useEffect(() => {
    const buildInfo = { 
      branch: 'main', 
      sha: 'latest-fix-v1.0.0' // Build stamp for verification
    };
    console.info('[BUILD]', buildInfo);
    console.info('[ORDER_SUBMIT][proof-of-life] OrderSubmissionHandler mounted', Date.now());
  }, []);

  // Use new V4 submission hook for proper Supabase integration
  const { isSubmitting, handleSubmitOrders } = useOrderFormSubmitV4();
  
  // Handler for successful submission
  const handleSubmissionSuccess = () => {
    // Remove submitted orders from summary
    setOrderSummaries(prev => prev.filter(order => !order.selected));
  };
  
  // Submit orders handler
  const submitOrders = async () => {
    // Recompute selection at click time (no stale capture)
    const selectedOrders = orderSummaries.filter(order => order.selected);
    tag('ONSUBMIT_ENTER', { selectedOrderCount: selectedOrders.length });
    
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

    markSubmitting?.();
    
    try {
      await handleSubmitOrders(selectedOrders, handleSubmissionSuccess, corr);
    } finally {
      clearSubmitting?.();
      tag('ONSUBMIT_EXIT');
    }
  };

  // Create the properly wired submit handler
  const handleSubmitClick = () => {
    console.info('[ORDER_SUBMIT][proof-of-life] raw click fired', Date.now());
    tag('CLICK');
    
    if (formHandleSubmit) {
      // Wire through React Hook Form validation
      const wrappedSubmit = formHandleSubmit(async () => {
        tag('HANDLE_SUBMIT_ENTER');
        await submitOrders();
      });
      wrappedSubmit();
    } else {
      // Fallback to direct submission
      submitOrders();
    }
  };
  
  if (orderSummaries.length === 0) {
    return null;
  }
  
  const selectedCount = orderSummaries.filter(order => order.selected).length;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-4">
        <div className="flex items-center gap-4">
          <OrderCountSummary 
            selectedOrders={orderSummaries.filter(order => order.selected)} 
            totalOrders={orderSummaries.length} 
          />
        </div>
        
        <div className="flex flex-col items-center gap-1">
          <NeoButton 
            variant="primary"
            size="lg"
            onClick={handleSubmitClick}
            disabled={isSubmitting || selectedCount === 0}
            data-testid="submit-order-btn"
            className="w-full max-w-md"
          >
            {isSubmitting ? "Submitting..." : `Submit ${selectedCount} Order${selectedCount !== 1 ? 's' : ''}`}
          </NeoButton>
          <div className="text-slate-300 text-xs">
            BUILD: main@latest-fix-v1.0.0 | Plant: {destinationPlant || 'Select Plant'}
          </div>
        </div>
      </div>
    </div>
  );
}
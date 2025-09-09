import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStandardOrderSubmit, OrderSummary } from "./hooks/useStandardOrderSubmit";
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
  onAddToOrder?: () => void;
}

export function OrderSubmissionHandler({ 
  orderSummaries, 
  setOrderSummaries,
  destinationPlant,
  recipientCount = 1,
  markSubmitting,
  clearSubmitting,
  formHandleSubmit,
  onAddToOrder
}: OrderSubmissionHandlerProps) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  
  // Always enable notifications - testMode is always true
  const [testMode] = useState(true);

  // Generate correlation ID for debugging
  const corr = (window as any).__corrId ??= crypto.randomUUID();
  const tag = (stage: string, extra: any = {}) =>
    console.info(`[ORDER_SUBMIT][${corr}] ${stage}`, extra);

  // Add stable build info on component mount
  useEffect(() => {
    const buildInfo = { 
      branch: 'main', 
      sha: 'standard-regional-separation-v1', // Stable build stamp
      timestamp: new Date().toISOString(),
      flow: 'standard'
    };
    console.info('[BUILD]', buildInfo);
    tag('MOUNT', { sha: buildInfo.sha, ts: buildInfo.timestamp, flow: buildInfo.flow });
  }, []);

  // Use standard submission hook for classic transfer orders
  const { isSubmitting, handleSubmitOrders } = useStandardOrderSubmit();
  
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

    // Log dispatch readiness with order IDs
    tag('DISPATCH_READY', { 
      selectedOrderIds: selectedOrders.map(o => o.id),
      count: selectedOrders.length 
    });

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
    tag('CLICK');
    
    // Recompute selected orders at click time (no stale captures)
    const selectedOrders = orderSummaries.filter(order => order.selected);
    
    // For order summary submission, use direct path (bypass RHF validation)
    if (selectedOrders.length > 0) {
      tag('DIRECT_SUBMIT_PATH', { summaryCount: orderSummaries.length, selectedCount: selectedOrders.length });
      submitOrders();
      return;
    }
    
    // For new item submission when no summaries selected, use form validation
    if (formHandleSubmit) {
      tag('FORM_VALIDATION_PATH');
      const wrappedSubmit = formHandleSubmit(async () => {
        tag('HANDLE_SUBMIT_ENTER');
        await submitOrders();
      });
      
      // Add timeout detection for silent validation failures
      setTimeout(() => {
        tag('VALIDATION_TIMEOUT_CHECK', { 
          formState: 'checking if validation silently failed'
        });
      }, 100);
      
      wrappedSubmit();
    } else {
      tag('FALLBACK_PATH');
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
        
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            {onAddToOrder && (
              <NeoButton 
                variant="ghost"
                size="lg"
                onClick={onAddToOrder}
                disabled={isSubmitting}
                data-testid="add-to-order-btn"
              >
                Add To Order
              </NeoButton>
            )}
            <NeoButton 
              variant="primary"
              size="lg"
              onClick={handleSubmitClick}
              disabled={isSubmitting || selectedCount === 0}
              data-testid="submit-order-btn"
            >
              {isSubmitting ? "Submitting..." : `Submit ${selectedCount} Order${selectedCount !== 1 ? 's' : ''}`}
            </NeoButton>
          </div>
          <div className="text-slate-300 text-xs">
            BUILD: standard-regional-separation-v1 | Plant: {destinationPlant || 'Select Plant'}
          </div>
        </div>
      </div>
    </div>
  );
}
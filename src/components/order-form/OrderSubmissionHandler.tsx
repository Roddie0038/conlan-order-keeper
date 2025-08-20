
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrderSubmission, OrderSummary } from "@/hooks/useOrderSubmission";
import { OrderCountSummary } from "./OrderCountSummary";
import { OrderSubmitButton } from "./OrderSubmitButton";

interface OrderSubmissionHandlerProps {
  orderSummaries: OrderSummary[];
  setOrderSummaries: React.Dispatch<React.SetStateAction<OrderSummary[]>>;
  destinationPlant: string;
  recipientCount?: number;
  isRecipientsLoading?: boolean;
  recipientsReady?: boolean;
  recipientError?: Error;
}

export function OrderSubmissionHandler({ 
  orderSummaries, 
  setOrderSummaries,
  destinationPlant,
  recipientCount = 1,
  isRecipientsLoading = false,
  recipientsReady = true,
  recipientError
}: OrderSubmissionHandlerProps) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  
  // Always enable notifications - testMode is always true
  const [testMode] = useState(true);

  // Use our custom submission hook
  const { isSubmitting, handleSubmitOrders } = useOrderSubmission();

  const selectedOrders = orderSummaries.filter(order => order.selected);
  
  // Handler for successful submission
  const handleSubmissionSuccess = (submittedOrders: OrderSummary[]) => {
    // Remove submitted orders from summary
    setOrderSummaries(prev => prev.filter(order => !order.selected));
  };
  
  // Submit orders handler
  const submitOrders = () => {
    console.log("✅ Order submitted to plant:", destinationPlant);
    handleSubmitOrders(selectedOrders, testMode, destinationPlant, handleSubmissionSuccess);
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
            recipientCount={recipientCount}
            isRecipientsLoading={isRecipientsLoading}
            recipientsReady={recipientsReady}
            recipientError={recipientError}
          />
        </div>
      </div>
    </div>
  );
}

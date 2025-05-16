
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useOrderSubmission, OrderSummary } from "@/hooks/useOrderSubmission";
import { OrderCountSummary } from "./OrderCountSummary";
import { AdminTestModeToggle } from "./AdminTestModeToggle";
import { OrderSubmitButton } from "./OrderSubmitButton";

interface OrderSubmissionHandlerProps {
  orderSummaries: OrderSummary[];
  setOrderSummaries: React.Dispatch<React.SetStateAction<OrderSummary[]>>;
}

export function OrderSubmissionHandler({ 
  orderSummaries, 
  setOrderSummaries 
}: OrderSubmissionHandlerProps) {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const isAdmin = user?.isAdmin || false;
  const [testMode, setTestMode] = useState(false);

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
    handleSubmitOrders(selectedOrders, testMode, handleSubmissionSuccess);
  };
  
  // Toggle test mode handler
  const handleToggleTestMode = (checked: boolean) => {
    setTestMode(checked);
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
          {isAdmin && (
            <AdminTestModeToggle 
              testMode={testMode} 
              onToggleTestMode={handleToggleTestMode} 
            />
          )}
          
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

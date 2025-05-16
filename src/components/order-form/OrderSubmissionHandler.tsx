
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { useOrderSubmission, OrderSummary } from "@/hooks/useOrderSubmission";

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
  
  if (orderSummaries.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="font-medium mb-1">Submit Selected Orders</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {selectedOrders.length} of {orderSummaries.length} orders selected
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && (
            <div className="flex items-center">
              <Checkbox
                id="testMode"
                checked={testMode}
                onCheckedChange={(checked) => setTestMode(checked as boolean)}
                className="mr-2"
              />
              <Label htmlFor="testMode" className="text-sm">
                Enable notifications (live mode)
              </Label>
            </div>
          )}
          
          <Button
            onClick={submitOrders}
            disabled={isSubmitting || selectedOrders.length === 0}
            className="bg-green-600 hover:bg-green-700"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Check className="h-4 w-4 mr-2" />
            )}
            Submit {selectedOrders.length} Order{selectedOrders.length !== 1 ? 's' : ''}
            {isAdmin && !testMode && " (Test Mode)"}
          </Button>
        </div>
      </div>
    </div>
  );
}

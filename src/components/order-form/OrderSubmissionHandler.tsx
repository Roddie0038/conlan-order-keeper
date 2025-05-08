
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { submitToOrdersWebhook } from "@/services/webhook/orderWebhook";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { submitToWebhook } from "@/services/webhook/utils";

interface OrderSubmissionHandlerProps {
  orderSummaries: any[];
  setOrderSummaries: React.Dispatch<React.SetStateAction<any[]>>;
}

export function OrderSubmissionHandler({ 
  orderSummaries, 
  setOrderSummaries 
}: OrderSubmissionHandlerProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { selectedPlant, PLANT_WEBHOOKS } = usePlant();
  const isAdmin = user?.isAdmin || false;
  const [testMode, setTestMode] = useState(false);

  const selectedOrders = orderSummaries.filter(order => order.selected);
  
  const handleSubmitOrders = async () => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No orders selected",
        description: "Please select at least one order to submit",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Admin test mode notification
      if (isAdmin && !testMode) {
        toast({
          title: "Admin Test Mode",
          description: "Order submission processed in test mode - no notifications will be sent."
        });
        
        // Store in local storage but don't trigger webhooks
        const timestamp = new Date().toLocaleString();
        const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        
        const adminTestOrders = selectedOrders.map(order => ({
          ...order,
          id: order.id,
          timestamp: timestamp,
          testMode: true
        }));
        
        localStorage.setItem('completedOrders', JSON.stringify([...completedOrders, ...adminTestOrders]));
        
        // Remove submitted orders from summary
        setOrderSummaries(prev => prev.filter(order => !order.selected));
        
        setIsSubmitting(false);
        return;
      }

      // Normal submission process for store users or admins with test mode enabled
      for (const order of selectedOrders) {
        // Ensure proper plant information is included
        const orderWithPlant = {
          ...order,
          plant: selectedPlant
        };
        
        await submitToOrdersWebhook(orderWithPlant);
        
        // For admin users with test mode enabled, also send to the plant-specific webhook
        if (isAdmin && testMode) {
          console.log("Admin user submitting with live mode to plant:", selectedPlant);
          const plantUrl = PLANT_WEBHOOKS[selectedPlant]?.transferRequests;
          if (plantUrl) {
            console.log("Sending to plant-specific webhook:", plantUrl);
            await submitToWebhook(plantUrl, orderWithPlant);
          }
        }
      }
      
      // Store in local storage
      const timestamp = new Date().toLocaleString();
      const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
      
      const newCompletedOrders = selectedOrders.map(order => ({
        ...order,
        id: order.id,
        timestamp: timestamp,
        plant: selectedPlant
      }));
      
      localStorage.setItem('completedOrders', JSON.stringify([...completedOrders, ...newCompletedOrders]));
      
      // Remove submitted orders from summary
      setOrderSummaries(prev => prev.filter(order => !order.selected));
      
      toast({
        title: "Orders submitted successfully",
        description: `${selectedOrders.length} order(s) have been submitted successfully.`
      });
    } catch (error) {
      console.error("Error submitting orders:", error);
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
            onClick={handleSubmitOrders}
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

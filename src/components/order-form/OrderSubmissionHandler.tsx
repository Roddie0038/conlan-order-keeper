
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { submitToWebhook } from "@/services/webhook/utils";
import { saveOrderToSupabase } from "@/services/orderService"; 
import { storeData } from "@/config/storeData";

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
  
  console.log("🔍 ORDERS - Selected Plant:", selectedPlant);
  console.log("🔍 ORDERS - Plant Webhooks for selected plant:", PLANT_WEBHOOKS[selectedPlant]);
  console.log("🔍 ORDERS - Transfer Requests Webhook:", PLANT_WEBHOOKS[selectedPlant]?.transferRequests);
  console.log("🔍 ORDERS - Admin Orders Webhook:", PLANT_WEBHOOKS[selectedPlant]?.adminOrders);
  
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
    console.log("🔍 SUBMIT - Starting order submission process");
    console.log("🔍 SUBMIT - Admin user:", isAdmin);
    console.log("🔍 SUBMIT - Test mode:", testMode);
    console.log("🔍 SUBMIT - Selected plant:", selectedPlant);
    
    try {
      // Admin test mode notification
      if (isAdmin && !testMode) {
        toast({
          title: "Admin Test Mode",
          description: "Order submission processed in test mode - no notifications will be sent."
        });
        
        console.log("🔍 SUBMIT - Admin test mode active, not sending notifications");
        
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

      console.log("🔍 SUBMIT - Processing orders with notifications");
      // Normal submission process for store users or admins with test mode enabled
      for (const order of selectedOrders) {
        console.log("🔍 SUBMIT - Processing order:", order.id);
        
        // Find the store manager email from storeData
        const storeNumber = order.store.match(/\d+$/)?.[0] || "";
        const matchedStore = storeData.find(s => s.storeNumber === storeNumber);
        const storeManagerEmail = order.managersEmail || matchedStore?.managerEmails || "";
        
        // Ensure proper plant information is included
        const orderWithPlant = {
          ...order,
          plant: selectedPlant,
          type: 'TRANSFER', // Explicitly set the order type
          name: order.yourName || user?.username || "Unknown", // Ensure name is set
          email: storeManagerEmail // Ensure email is set with the manager's email
        };
        
        console.log("🔍 SUBMIT - Using sheets service with order:", orderWithPlant);
        const result = await submitToGoogleSheets(orderWithPlant);
        console.log("🔍 SUBMIT - submitToGoogleSheets result:", result);
        
        // CRITICAL FIX: Save the order to Supabase
        console.log("🔍 SUBMIT - Saving order to Supabase:", orderWithPlant);
        const { data, error } = await saveOrderToSupabase(orderWithPlant);
        
        if (error) {
          console.error("❌ SUBMIT - Error saving to Supabase:", error);
        } else {
          console.log("✅ SUBMIT - Successfully saved to Supabase:", data);
        }
        
        // For admin users with test mode enabled or in production mode
        if (isAdmin) {
          console.log("🔍 SUBMIT - Admin user submitting order to plant:", selectedPlant);
          
          let webhookUrl;
          if (testMode) {
            // Use the plant-specific webhook for test mode
            webhookUrl = PLANT_WEBHOOKS[selectedPlant]?.transferRequests;
            console.log("🔍 SUBMIT - Admin in test mode, using plant-specific webhook:", webhookUrl);
          } else {
            // Use the admin-specific webhook for production mode
            webhookUrl = PLANT_WEBHOOKS[selectedPlant]?.adminOrders;
            console.log("🔍 SUBMIT - Admin in production mode, using admin webhook:", webhookUrl);
          }
          
          if (webhookUrl) {
            console.log("🔍 SUBMIT - Sending to webhook:", webhookUrl);
            await submitToWebhook(webhookUrl, orderWithPlant);
          } else {
            console.error("❌ SUBMIT - No webhook URL found for this configuration");
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
      console.error("❌ SUBMIT - Error submitting orders:", error);
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

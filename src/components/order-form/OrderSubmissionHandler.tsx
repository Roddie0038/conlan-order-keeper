
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { generateAndEmailCrossDockPDF } from "./utils/pdfGenerator";
import { OrderFormValues } from "./order-form-schema";
import { OrderSummary } from "./types";

interface OrderSubmissionHandlerProps {
  orderSummaries: OrderSummary[];
  setOrderSummaries: (orders: OrderSummary[]) => void;
}

export function OrderSubmissionHandler({ 
  orderSummaries, 
  setOrderSummaries 
}: OrderSubmissionHandlerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Count selected orders
  const selectedCount = orderSummaries.filter(order => order.selected).length;
  
  const handleSubmitOrders = async () => {
    setIsSubmitting(true);
    
    try {
      const selectedOrders = orderSummaries.filter(order => order.selected);
      
      if (selectedOrders.length === 0) {
        toast({
          title: "No Orders Selected",
          description: "Please select at least one order to submit.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Process Cross Dock PDFs and emails for orders that have Cross Dock = "yes"
      const crossDockOrders = selectedOrders.filter(order => order.crossDock === "yes");
      
      for (const order of crossDockOrders) {
        try {
          // Generate and email Cross Dock PDF
          const pdfResult = await generateAndEmailCrossDockPDF({
            yourName: order.yourName || "",
            store: order.store || "",
            dateReceived: order.dateReceived || "",
            productNumber: order.productNumber || "",
            description: order.description || "",
            quantity: order.quantity || "",
            scheduleArrival: order.scheduleArrival || "",
            notes: order.notes || "",
            crossDock: order.crossDock || "",
            crossDockDestination: order.crossDockDestination || "",
            managersEmail: order.managersEmail || "",
            transferWorkOrderNumber: order.transferWorkOrderNumber || "",
            trailerNumber: order.trailerNumber || "",
            eta: order.eta || "",
            crossDockFile: order.crossDockFile || "",
            crossDockConfirmation: order.crossDockConfirmation || false
          });
          
          if (!pdfResult.success) {
            console.error("Failed to process Cross Dock PDF for order:", order.id);
          }
        } catch (pdfError) {
          console.error("Error processing PDF for order:", order.id, pdfError);
        }
      }
      
      // Here would be the actual submission logic to backend API
      // For now, we'll simulate success after a delay
      setTimeout(() => {
        toast({
          title: "Orders Submitted Successfully",
          description: `${selectedOrders.length} order(s) have been submitted.`,
        });
        
        // Remove submitted orders
        const remainingOrders = orderSummaries.filter(order => !order.selected);
        setOrderSummaries(remainingOrders);
        
        setIsSubmitting(false);
      }, 1500);
    } catch (error) {
      console.error("Error submitting orders:", error);
      toast({
        title: "Error",
        description: "Failed to submit orders. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };
  
  if (orderSummaries.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-6 flex justify-end">
      <Button
        onClick={handleSubmitOrders}
        disabled={isSubmitting || selectedCount === 0}
        className="bg-green-600 hover:bg-green-700"
      >
        {isSubmitting ? "Submitting..." : `Submit Selected Orders (${selectedCount})`}
      </Button>
    </div>
  );
}

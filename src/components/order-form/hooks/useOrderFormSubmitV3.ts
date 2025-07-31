/**
 * Phase 4: Modernized Order Form Submit Hook
 * Delegates all business logic to OrderFormService
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { OrderFormService, OrderSummary } from "@/services/orderService/OrderFormService";
import { logger } from '@/utils/logger';

export function useOrderFormSubmitV3() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmitOrders = async (
    selectedOrders: OrderSummary[],
    onSuccess?: () => void
  ) => {
    if (selectedOrders.length === 0) {
      toast({
        title: "No Orders Selected",
        description: "Please select at least one order to submit.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      logger.info('Order submission initiated', {
        service: 'useOrderFormSubmitV3',
        orderCount: selectedOrders.length,
        userEmail: user?.email
      });

      // Delegate to service layer
      const result = await OrderFormService.submitOrders(selectedOrders, user);

      if (result.success) {
        toast({
          title: "Orders Submitted Successfully",
          description: `${selectedOrders.length} order(s) have been submitted.`,
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: "Error Submitting Orders",
          description: result.error || "There was an error submitting your orders. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Order submission error in hook', {
        service: 'useOrderFormSubmitV3',
        error: errorMessage
      });

      toast({
        title: "Error Submitting Orders",
        description: "There was an unexpected error. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmitOrders,
  };
}
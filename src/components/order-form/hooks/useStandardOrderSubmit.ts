/**
 * Standard Transfer Order Submission Hook
 * Handles classic intra-region transfer orders with standard recipients
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { normalizeOrderStoreFields } from "@/utils/storeNormalization";
import { getPlantForStore } from "@/utils/plantMapping";
import { logger } from '@/utils/logger';
import { submitOrder } from "@/services/orderSubmit";

export interface OrderSummary {
  id: string;
  store: string;
  productNumber: string;
  description?: string;
  quantity: string;
  notes?: string;
  yourName?: string;
  managersEmail?: string;
  scheduleArrival?: string;
  crossDock?: 'Yes' | 'No';
  crossDockDestination?: string;
  receiverNo?: string;
  etaDate?: string;
  crossDockConfirmation?: boolean;
  destinationPlant?: string;
  timestamp?: string;
  selected: boolean;
}

export function useStandardOrderSubmit() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmitOrders = async (
    selectedOrders: OrderSummary[],
    onSuccess?: () => void,
    correlationId?: string
  ) => {
    const corr = correlationId || crypto.randomUUID();
    const tag = (stage: string, extra: any = {}) =>
      console.info(`[ORDER_SUBMIT][${corr}] ${stage}`, extra);

    if (selectedOrders.length === 0) {
      toast({
        title: "No Orders Selected",
        description: `Please select at least one order to submit [${corr}]`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      logger.info('Standard order submission initiated', {
        service: 'useStandardOrderSubmit',
        orderCount: selectedOrders.length,
        userEmail: user?.email
      });

      const processedOrders: OrderSummary[] = [];
      const failedOrders: { order: OrderSummary; error: string }[] = [];

      tag('RPC_DISPATCH');

      for (const order of selectedOrders) {
        try {
          tag('BUILD_PAYLOAD_ENTER', { orderId: order.id });
          
          // Normalize store fields for submission
          const normalizedOrder = normalizeOrderStoreFields(order, true);
          
          // Convert OrderSummary to formValues for Phase B submitOrder
          const formValues = {
            store: normalizedOrder.store,
            productNumber: normalizedOrder.productNumber,
            description: normalizedOrder.description || normalizedOrder.productNumber,
            quantity: normalizedOrder.quantity,
            notes: normalizedOrder.notes,
            yourName: normalizedOrder.yourName,
            managersEmail: normalizedOrder.managersEmail,
            scheduleArrival: normalizedOrder.scheduleArrival,
            crossDock: normalizedOrder.crossDock,
            crossDockDestination: normalizedOrder.crossDock === 'Yes' ? normalizedOrder.crossDockDestination : null,
            receiverNo: normalizedOrder.crossDock === 'Yes' ? normalizedOrder.receiverNo : null,
            etaDate: normalizedOrder.crossDock === 'Yes' ? normalizedOrder.etaDate : null,
            order_type: 'standard',
            status: 'pending'
          };

          // Get plant for the normalized store
          const selectedPlant = normalizedOrder.destinationPlant || getPlantForStore(normalizedOrder.store);

          tag('BUILD_PAYLOAD_EXIT', {
            orderId: order.id,
            destinationPlant: selectedPlant,
            store: formValues.store,
            _corr: corr
          });

          if (!formValues.productNumber || !formValues.quantity) {
            tag('VALIDATION_FAIL', { orderId: order.id, reason: 'missing_required_fields' });
            toast({
              title: "Validation Error",
              description: `Order ${order.id} missing required fields [${corr}]`,
              variant: "destructive"
            });
            continue;
          }

          logger.info('Submitting standard order via Phase B submitOrder', {
            service: 'useStandardOrderSubmit',
            orderId: order.id,
            destinationPlant: selectedPlant,
            store: formValues.store,
            corr
          });

          tag('SUBMIT_CALL', { orderId: order.id, endpoint: 'submitOrder' });

          // Submit via Phase B submitOrder with 30s timeout  
          const result = await Promise.race([
            submitOrder({
              formValues,
              user: user ? {
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email,
                assignedPlant: undefined // Will be resolved from store mapping
              } : undefined,
              selectedStore: formValues.store,
              selectedPlant
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Submission timeout after 30s')), 30000)
            )
          ]);

          tag('SUBMIT_OK', { orderId: order.id, result });
          processedOrders.push(order);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          tag('RPC_FAIL', { orderId: order.id, error: errorMessage });
          failedOrders.push({ order, error: errorMessage });
          
          logger.error('Standard order submission failed', {
            service: 'useStandardOrderSubmit',
            orderId: order.id,
            error: errorMessage,
            corr
          });
        }
      }

      tag('RPC_DISPATCH_DONE');

      // Show results
      if (processedOrders.length > 0) {
        toast({
          title: "Orders Submitted",
          description: `${processedOrders.length} order(s) submitted successfully [${corr}]`,
        });
        onSuccess?.();
      }

      if (failedOrders.length > 0) {
        toast({
          title: "Some Orders Failed",
          description: `${failedOrders.length} order(s) failed to submit [${corr}]`,
          variant: "destructive",
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      tag('SUBMIT_ERROR', { error: errorMessage });
      
      toast({
        title: "Submission Failed",
        description: `Error submitting orders: ${errorMessage} [${corr}]`,
        variant: "destructive",
      });
      
      logger.error('Standard order submission error', {
        service: 'useStandardOrderSubmit',
        error: errorMessage,
        corr
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmitOrders
  };
}
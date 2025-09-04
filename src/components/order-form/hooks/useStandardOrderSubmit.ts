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
import { supabase } from "@/integrations/supabase/client";
import type { StandardOrderPayload } from "@/types/orderPayloads";

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
          
          // Build standard payload (no regional fields)
          const payload: StandardOrderPayload = {
            type: 'standard',
            order_type: 'transfer',
            store: normalizedOrder.store,
            destination_plant: normalizedOrder.destinationPlant || '',
            product_number: normalizedOrder.productNumber,
            quantity: normalizedOrder.quantity,
            description: normalizedOrder.description,
            notes: normalizedOrder.notes,
            your_name: normalizedOrder.yourName,
            managers_email: normalizedOrder.managersEmail,
            schedule_arrival: normalizedOrder.scheduleArrival,
            cross_dock: normalizedOrder.crossDock,
            cross_dock_destination: normalizedOrder.crossDock === 'Yes' ? normalizedOrder.crossDockDestination : null,
            cross_dock_receiver_number: normalizedOrder.crossDock === 'Yes' ? normalizedOrder.receiverNo : null,
            cross_dock_eta_date: normalizedOrder.crossDock === 'Yes' ? normalizedOrder.etaDate : null,
            timestamp: normalizedOrder.timestamp || new Date().toISOString(),
            _corr: corr
          };

          tag('BUILD_PAYLOAD_EXIT', {
            orderId: order.id,
            destinationPlant: payload.destination_plant,
            store: payload.store,
            _corr: corr
          });

          if (!payload.product_number || !payload.quantity) {
            tag('VALIDATION_FAIL', { orderId: order.id, reason: 'missing_required_fields' });
            toast({
              title: "Validation Error",
              description: `Order ${order.id} missing required fields [${corr}]`,
              variant: "destructive"
            });
            continue;
          }

          logger.info('Submitting standard order to handleOrdersPost', {
            service: 'useStandardOrderSubmit',
            orderId: order.id,
            destinationPlant: payload.destination_plant,
            corr
          });

          tag('RPC_CALL', { orderId: order.id, endpoint: 'handleOrdersPost' });

          // Submit to handleOrdersPost with 30s timeout
          const result = await Promise.race([
            supabase.functions.invoke("handleOrdersPost", { 
              body: payload // _corr already included in payload
            }),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Submission timeout after 30s')), 30000)
            )
          ]);

          const { data, error } = result as any;

          if (error) {
            tag('RPC_FAIL', { orderId: order.id, error: error.message });
            throw new Error(error.message || 'Submission failed');
          }

          tag('RPC_OK', { orderId: order.id, result: data });
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
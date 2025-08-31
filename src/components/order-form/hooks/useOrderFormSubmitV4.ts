/**
 * Phase 5: Regional Transfer Order Submission Hook
 * Connects to Supabase handleOrdersPost edge function for proper backend processing
 */

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { submitRegionalOrder } from "@/services/submitRegionalOrder";
import { normalizeOrderStoreFields } from "@/utils/storeNormalization";
import { getPlantForStore } from "@/utils/plantMapping";
import { logger } from '@/utils/logger';

export interface OrderSummary {
  id: string;
  selected: boolean;
  store: string;
  yourName?: string;
  productNumber?: string;
  description?: string;
  quantity?: string | number;
  scheduleArrival?: string;
  notes?: string;
  crossDock?: string;
  crossDockDestination?: string;
  receiverNo?: string;
  etaDate?: string;
  dateReceived?: string;
  destinationPlant?: string;
  managersEmail?: string;
  timestamp?: string;
  [key: string]: any;
}

export function useOrderFormSubmitV4() {
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
      logger.info('Regional order submission initiated', {
        service: 'useOrderFormSubmitV4',
        orderCount: selectedOrders.length,
        userEmail: user?.email
      });

      const processedOrders: OrderSummary[] = [];
      const failedOrders: { order: OrderSummary; error: string }[] = [];

      for (const order of selectedOrders) {
        try {
          // Normalize store fields for Supabase submission
          const normalizedOrder = normalizeOrderStoreFields(order, true);
          
          // Ensure plant mapping is correct
          const plant = getPlantForStore(normalizedOrder.store);
          
          // Prepare payload for handleOrdersPost edge function
          const payload = {
            order_type: 'transfer' as const,
            regional_enabled: true as const,
            source_mode: 'STORE_TO_PLANT' as const,
            source_plant: plant.match(/\d+/)?.[0] as any, // Extract plant code
            fulfilled_by_plant: plant,
            destination_store_id: null,
            destination_plant: plant,
            transport: {
              carrier: null,
              requested_pickup_at: normalizedOrder.scheduleArrival,
              cross_dock_required: normalizedOrder.crossDock === 'Yes',
              notes: normalizedOrder.notes,
            },
            idempotency_key: `transfer-${order.id}-${Date.now()}`,
            // Additional fields for orders table
            name: normalizedOrder.yourName || user?.name,
            store: normalizedOrder.store,
            product_number: normalizedOrder.productNumber,
            description: normalizedOrder.description,
            quantity: parseInt(normalizedOrder.quantity?.toString() || '0'),
            schedule_arrival: normalizedOrder.scheduleArrival,
            notes: normalizedOrder.notes,
            email: normalizedOrder.managersEmail || user?.email,
            plant: plant,
            cross_dock_destination: normalizedOrder.crossDock === 'Yes' ? normalizedOrder.crossDockDestination : null,
            cross_dock_receiver_number: normalizedOrder.crossDock === 'Yes' ? normalizedOrder.receiverNo : null,
            cross_dock_eta_date: normalizedOrder.crossDock === 'Yes' ? normalizedOrder.etaDate : null,
            timestamp: normalizedOrder.timestamp || new Date().toISOString()
          };

          logger.info('Submitting order to handleOrdersPost', {
            service: 'useOrderFormSubmitV4',
            orderId: order.id,
            payload
          });

          const result = await submitRegionalOrder(payload);
          
          logger.info('Order successfully submitted', {
            service: 'useOrderFormSubmitV4',
            orderId: order.id,
            result
          });

          processedOrders.push(order);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          logger.error('Order submission failed', {
            service: 'useOrderFormSubmitV4',
            orderId: order.id,
            error: errorMessage
          });

          failedOrders.push({ order, error: errorMessage });
        }
      }

      // Handle results
      if (processedOrders.length === selectedOrders.length) {
        toast({
          title: "Orders Submitted Successfully",
          description: `${processedOrders.length} order(s) have been submitted and are being processed.`,
        });

        if (onSuccess) {
          onSuccess();
        }
      } else if (processedOrders.length > 0) {
        toast({
          title: "Partial Success",
          description: `${processedOrders.length} of ${selectedOrders.length} orders submitted successfully.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: "No orders could be submitted. Please try again.",
          variant: "destructive",
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      logger.error('Critical error in order submission', {
        service: 'useOrderFormSubmitV4',
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
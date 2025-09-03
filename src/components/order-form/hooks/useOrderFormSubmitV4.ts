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
import { sendConfirmationEmail } from '@/lib/email/sendConfirmationEmail';
import { formatLocalTs } from '@/lib/time/formatLocalTs';
import { supabase } from "@/integrations/supabase/client";

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
    onSuccess?: () => void,
    corrId?: string
  ) => {
    const corr = corrId || crypto.randomUUID();
    const tag = (stage: string, extra: any = {}) =>
      console.info(`[ORDER_SUBMIT][${corr}] ${stage}`, extra);
    
    tag('ONSUBMIT_ENTER', { orderCount: selectedOrders.length });
    if (selectedOrders.length === 0) {
      tag('GUARD_BLOCK', { reason: 'no_selected_orders' });
      toast({
        title: "No Orders Selected",
        description: `Please select at least one order to submit [${corr}]`,
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

          tag('RPC_CALL', { endpoint: 'submitRegionalOrder', orderId: order.id });
          
          // Add 30s timeout wrapper
          const result = await Promise.race([
            submitRegionalOrder(payload),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Submission timeout after 30s')), 30000)
            )
          ]);
          
          tag('RPC_OK', { orderId: order.id, result });
          logger.info('Order successfully submitted', {
            service: 'useOrderFormSubmitV4',
            orderId: order.id,
            result
          });

          // Avoid duplicate confirmations on server-detected retries
          const isConflict = (result && (result as any).conflict) === true;

          // Build single-recipient confirmation payload
          if (!isConflict) {
            const storeName = normalizedOrder.store;
            const storeNumber = String(storeName?.match(/(\d{2,3})/)?.[1] || '').padStart(3, '0');
            const plantCode = String(plant?.match(/(\d{2,3})/)?.[1] || '').padStart(3, '0');

            // Try to extract a meaningful server order id; fall back to UI id
            const serverOrderId =
              (result && ((result as any).order_id || (result as any).id || (result as any).order?.id || (result as any).data?.id))
              || order.id;

            // Prefer explicit yourName/managersEmail; fall back to auth
            const submitterName = normalizedOrder.yourName || (user as any)?.user_metadata?.full_name || user?.email || 'Unknown';
            const submitterEmail = normalizedOrder.managersEmail || user?.email || '';

            const timestamp = formatLocalTs(new Date());

            // Fire-and-forget; do not block UX
            sendConfirmationEmail({
              order_id: serverOrderId,
              store_number: storeNumber,
              store_name: storeName,
              plant: plantCode,
              submitted_by_name: submitterName,
              submitted_by_email: submitterEmail,
              timestamp,
              product_number: normalizedOrder.productNumber,
              quantity: normalizedOrder.quantity ? parseInt(String(normalizedOrder.quantity)) : undefined,
              description: normalizedOrder.description,
              notes: normalizedOrder.notes,
            });

            // Send warehouse/plant notifications after successful confirmation
            // Fire-and-forget; do not block UX
            (async () => {
              try {
                logger.info('Sending warehouse/plant notifications', {
                  service: 'useOrderFormSubmitV4',
                  orderId: order.id,
                  store_number: storeNumber
                });

                const warehousePayload = {
                  order_type: 'transfer' as const, // Default to transfer, adjust based on order type if needed
                  store_number: storeNumber,
                  plant: plantCode,
                  payload: {
                    order_id: serverOrderId,
                    store_name: storeName,
                    submitted_by_name: submitterName,
                    submitted_by_email: submitterEmail,
                    product_number: normalizedOrder.productNumber,
                    quantity: normalizedOrder.quantity ? parseInt(String(normalizedOrder.quantity)) : undefined,
                    description: normalizedOrder.description,
                    notes: normalizedOrder.notes,
                    timestamp
                  },
                  idempotency_key: `ordering_v4:${serverOrderId}:transfer`,
                  source: 'ordering_v4' as const
                };

                // Call notification-controller using supabase.functions.invoke for proper auth
                const { data: notificationResult, error: notificationError } = await supabase.functions.invoke(
                  'notification-controller',
                  {
                    body: warehousePayload,
                    headers: {
                      'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MDMzNzA2MSwiZXhwIjoyMDU1OTEzMDYxfQ.A2aA7KGKBFPdYKDxnK8TFSvJx-6LGzgNXLVOlGF5S7Y`
                    }
                  }
                );

                if (notificationError) {
                  logger.error('Warehouse notification failed', {
                    service: 'useOrderFormSubmitV4',
                    orderId: order.id,
                    error: notificationError.message
                  });
                } else {
                  logger.info('Warehouse notifications sent successfully', {
                    service: 'useOrderFormSubmitV4',
                    orderId: order.id,
                    result: notificationResult
                  });
                }
              } catch (warehouseError) {
                logger.error('Error sending warehouse notifications', {
                  service: 'useOrderFormSubmitV4',
                  orderId: order.id,
                  error: warehouseError instanceof Error ? warehouseError.message : 'Unknown error'
                });
                // Don't fail the main flow for warehouse notification errors
              }
            })();
          }

          processedOrders.push(order);

        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          tag('RPC_FAIL', { orderId: order.id, error: errorMessage });
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
          description: `${processedOrders.length} order(s) have been submitted and are being processed [${corr}]`,
        });

        if (onSuccess) {
          onSuccess();
        }
      } else if (processedOrders.length > 0) {
        toast({
          title: "Partial Success",
          description: `${processedOrders.length} of ${selectedOrders.length} orders submitted successfully [${corr}]`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submission Failed",
          description: `No orders could be submitted. Please try again [${corr}]`,
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
        description: `There was an unexpected error. Please try again [${corr}]`,
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
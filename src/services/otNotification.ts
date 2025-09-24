/**
 * OT Notification Service - Phase 2 Implementation
 * Routes all notifications through ot-notify → OT controller pipeline
 * Enforces strict scoping, preferences, templates, and observability
 */

import { supabase } from "@/integrations/supabase/client";

export interface OTNotificationRequest {
  email_type: string;
  store_number?: string;
  plant_code?: string;
  idempotency_key: string;
  admin_override?: boolean;
  payload: Record<string, any>;
  dry_run?: boolean;
}

export interface OTNotificationResponse {
  success: boolean;
  message?: string;
  error?: string;
  recipient_count?: number;
  template_name?: string;
  filtered_by_prefs?: number;
  source?: string;
}

class OTNotificationService {
  private readonly MAX_RETRIES = 2;
  private readonly RETRY_DELAY_MS = 1000;

  /**
   * Send notification through OT controller pipeline
   */
  async sendNotification(request: OTNotificationRequest): Promise<OTNotificationResponse> {
    // Validate required fields
    this.validateRequest(request);

    // Normalize store/plant codes
    const normalizedRequest = this.normalizeRequest(request);

    console.log("📧 OT-NOTIFY CLIENT - Sending notification:", {
      email_type: normalizedRequest.email_type,
      store_number: normalizedRequest.store_number,
      plant_code: normalizedRequest.plant_code,
      idempotency_key: normalizedRequest.idempotency_key,
      admin_override: normalizedRequest.admin_override,
      dry_run: normalizedRequest.dry_run
    });

    // Send with bounded retries
    return this.sendWithRetry(normalizedRequest);
  }

  /**
   * Create standardized request for different notification types
   */
  createTransferOrderRequest(
    orderId: string,
    storeNumber: string,
    plantCode: string,
    orderData: Record<string, any>,
    options: { admin_override?: boolean; dry_run?: boolean } = {}
  ): OTNotificationRequest {
    return {
      email_type: "transfer_order",
      store_number: storeNumber,
      plant_code: plantCode,
      idempotency_key: `transfer_${orderId}_${Date.now()}`,
      admin_override: options.admin_override || false,
      dry_run: options.dry_run || false,
      payload: {
        order_id: orderId,
        ...orderData
      }
    };
  }

  createCrossDockRequest(
    orderId: string,
    originStore: string,
    destinationStore: string,
    plantCode: string,
    orderData: Record<string, any>,
    options: { admin_override?: boolean; dry_run?: boolean } = {}
  ): OTNotificationRequest {
    return {
      email_type: "cross_dock",
      store_number: originStore,
      plant_code: plantCode,
      idempotency_key: `crossdock_${orderId}_${Date.now()}`,
      admin_override: options.admin_override || false,
      dry_run: options.dry_run || false,
      payload: {
        order_id: orderId,
        origin_store: originStore,
        destination_store: destinationStore,
        ...orderData
      }
    };
  }

  createMTORequest(
    orderId: string,
    storeNumber: string,
    plantCode: string,
    orderData: Record<string, any>,
    options: { admin_override?: boolean; dry_run?: boolean } = {}
  ): OTNotificationRequest {
    return {
      email_type: "mto_casings_needed",
      store_number: storeNumber,
      plant_code: plantCode,
      idempotency_key: `mto_${orderId}_${Date.now()}`,
      admin_override: options.admin_override || false,
      dry_run: options.dry_run || false,
      payload: {
        order_id: orderId,
        // Ensure MTO-specific fields are included
        casing_grade: orderData.casing_grade || orderData.casingGrade,
        tire_size: orderData.tire_size || orderData.tireSize,
        tread: orderData.tread || orderData.tireTreadNeeded,
        product_number: orderData.product_number || orderData.productNumber,
        ...orderData
      }
    };
  }

  createWarrantyRequest(
    orderId: string,
    storeNumber: string,
    plantCode: string,
    orderData: Record<string, any>,
    options: { admin_override?: boolean; dry_run?: boolean } = {}
  ): OTNotificationRequest {
    return {
      email_type: "warranty",
      store_number: storeNumber,
      plant_code: plantCode,
      idempotency_key: `warranty_${orderId}_${Date.now()}`,
      admin_override: options.admin_override || false,
      dry_run: options.dry_run || false,
      payload: {
        order_id: orderId,
        ...orderData
      }
    };
  }

  createMessageRequest(
    orderId: string,
    storeNumber: string,
    plantCode: string,
    messageData: Record<string, any>,
    options: { admin_override?: boolean; dry_run?: boolean } = {}
  ): OTNotificationRequest {
    return {
      email_type: "message",
      store_number: storeNumber,
      plant_code: plantCode,
      idempotency_key: `message_${orderId}_${Date.now()}`,
      admin_override: options.admin_override || false,
      dry_run: options.dry_run || false,
      payload: {
        order_id: orderId,
        ...messageData
      }
    };
  }

  /**
   * Preview notification recipients (dry run)
   */
  async previewNotification(request: Omit<OTNotificationRequest, 'dry_run'>): Promise<OTNotificationResponse> {
    return this.sendNotification({
      ...request,
      dry_run: true
    });
  }

  /**
   * Validate notification request
   */
  private validateRequest(request: OTNotificationRequest): void {
    if (!request.email_type) {
      throw new Error("email_type is required");
    }

    if (!request.idempotency_key) {
      throw new Error("idempotency_key is required");
    }

    if (!request.store_number && !request.plant_code) {
      throw new Error("Either store_number or plant_code must be provided");
    }

    if (!request.payload) {
      throw new Error("payload is required");
    }
  }

  /**
   * Normalize store numbers and plant codes (LPAD 3)
   */
  private normalizeRequest(request: OTNotificationRequest): OTNotificationRequest {
    return {
      ...request,
      store_number: request.store_number ? request.store_number.padStart(3, '0') : undefined,
      plant_code: request.plant_code ? request.plant_code.padStart(3, '0') : undefined
    };
  }

  /**
   * Send notification with bounded retry logic
   */
  private async sendWithRetry(request: OTNotificationRequest): Promise<OTNotificationResponse> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`📧 OT-NOTIFY CLIENT - Attempt ${attempt}/${this.MAX_RETRIES}`);
        
        const { data, error } = await supabase.functions.invoke('ot-notify', {
          body: request
        });

        if (error) {
          throw new Error(`Edge function error: ${error.message}`);
        }

        console.log(`✅ OT-NOTIFY CLIENT - Success on attempt ${attempt}:`, {
          success: data?.success,
          recipient_count: data?.recipient_count,
          template_name: data?.template_name
        });

        return data;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        console.warn(`⚠️ OT-NOTIFY CLIENT - Attempt ${attempt} failed:`, lastError.message);

        // Don't retry on client errors (4xx)
        if (lastError.message.includes('400') || lastError.message.includes('401') || 
            lastError.message.includes('403') || lastError.message.includes('404')) {
          break;
        }

        // Wait before retry (except on last attempt)
        if (attempt < this.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY_MS * attempt));
        }
      }
    }

    console.error(`❌ OT-NOTIFY CLIENT - All ${this.MAX_RETRIES} attempts failed:`, lastError?.message);

    return {
      success: false,
      error: lastError?.message || "Unknown error after all retry attempts",
      source: "ot-notify-client"
    };
  }
}

// Export singleton instance
export const otNotificationService = new OTNotificationService();

// Convenience functions for common notification types
export async function sendTransferOrderNotification(
  orderId: string,
  storeNumber: string,
  plantCode: string,
  orderData: Record<string, any>,
  options: { admin_override?: boolean; dry_run?: boolean } = {}
): Promise<OTNotificationResponse> {
  const request = otNotificationService.createTransferOrderRequest(
    orderId, storeNumber, plantCode, orderData, options
  );
  return otNotificationService.sendNotification(request);
}

export async function sendCrossDockNotification(
  orderId: string,
  originStore: string,
  destinationStore: string,
  plantCode: string,
  orderData: Record<string, any>,
  options: { admin_override?: boolean; dry_run?: boolean } = {}
): Promise<OTNotificationResponse> {
  const request = otNotificationService.createCrossDockRequest(
    orderId, originStore, destinationStore, plantCode, orderData, options
  );
  return otNotificationService.sendNotification(request);
}

export async function sendMTONotification(
  orderId: string,
  storeNumber: string,
  plantCode: string,
  orderData: Record<string, any>,
  options: { admin_override?: boolean; dry_run?: boolean } = {}
): Promise<OTNotificationResponse> {
  const request = otNotificationService.createMTORequest(
    orderId, storeNumber, plantCode, orderData, options
  );
  return otNotificationService.sendNotification(request);
}

export async function sendWarrantyNotification(
  orderId: string,
  storeNumber: string,
  plantCode: string,
  orderData: Record<string, any>,
  options: { admin_override?: boolean; dry_run?: boolean } = {}
): Promise<OTNotificationResponse> {
  const request = otNotificationService.createWarrantyRequest(
    orderId, storeNumber, plantCode, orderData, options
  );
  return otNotificationService.sendNotification(request);
}

export async function sendMessageNotification(
  orderId: string,
  storeNumber: string,
  plantCode: string,
  messageData: Record<string, any>,
  options: { admin_override?: boolean; dry_run?: boolean } = {}
): Promise<OTNotificationResponse> {
  const request = otNotificationService.createMessageRequest(
    orderId, storeNumber, plantCode, messageData, options
  );
  return otNotificationService.sendNotification(request);
}
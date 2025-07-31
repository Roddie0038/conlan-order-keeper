/**
 * Phase 3: Unified Notification Service
 * Integrates the new email recipient resolution system with notification triggers
 */

import { supabase } from "@/integrations/supabase/client";
import { resolveEmailRecipients, logEmailResolution, type EmailType, type OrderDataInput } from "@/services/emailRecipientResolver";
import { sendOrderConfirmationEmail } from "@/services/orderingEmailService";

export interface NotificationPayload {
  store_number: string;
  store_name: string;
  order_type: string;
  order_id: string;
  timestamp: string;
  name: string;
  email: string;
  quantity?: number;
  product_number?: string;
  description?: string;
  plant?: string;
}

export interface NotificationResult {
  success: boolean;
  message: string;
  recipients_count: number;
  resolution_source: string;
  resolution_log: string[];
}

/**
 * Send notification using the new three-tier recipient resolution system
 */
export async function sendUnifiedNotification(
  orderData: OrderDataInput,
  emailType: EmailType,
  orderId: string,
  additionalPayload?: Partial<NotificationPayload>
): Promise<NotificationResult> {
  
  console.log(`📧 UNIFIED NOTIFICATION - Processing ${emailType} notification for order ${orderId}`);
  
  try {
    // Phase 3: Use new email recipient resolution system
    const resolutionResult = await resolveEmailRecipients(orderData, emailType, orderId);
    
    // Log the resolution result
    await logEmailResolution(resolutionResult);
    
    if (resolutionResult.recipients.length === 0) {
      console.log(`⚠️ UNIFIED NOTIFICATION - No recipients found for ${emailType} notification`);
      return {
        success: true,
        message: 'No recipients configured for this notification type',
        recipients_count: 0,
        resolution_source: resolutionResult.source,
        resolution_log: resolutionResult.resolutionLog
      };
    }
    
    console.log(`📧 UNIFIED NOTIFICATION - Found ${resolutionResult.recipients.length} recipients via ${resolutionResult.source}`);
    
    // Extract store number for legacy email service compatibility
    const storeNumber = extractStoreNumber(resolutionResult.store || orderData.store);
    
    // Create notification payload with proper recipient injection
    const notificationPayload: NotificationPayload = {
      store_number: storeNumber,
      store_name: resolutionResult.store || orderData.store,
      order_type: emailType,
      order_id: orderId,
      timestamp: new Date().toISOString(),
      name: orderData.name || 'Unknown',
      email: orderData.email || '',
      plant: resolutionResult.plant || orderData.plant || 'Unknown',
      ...additionalPayload
    };
    
    // Send notification via existing email service
    const emailResult = await sendOrderConfirmationEmail(notificationPayload);
    
    // Log notification attempt to database with recipient details
    await logNotificationAttempt(resolutionResult, notificationPayload, emailResult.success);
    
    return {
      success: emailResult.success,
      message: emailResult.message,
      recipients_count: resolutionResult.recipients.length,
      resolution_source: resolutionResult.source,
      resolution_log: resolutionResult.resolutionLog
    };
    
  } catch (error) {
    console.error(`❌ UNIFIED NOTIFICATION - Error sending ${emailType} notification:`, error);
    
    return {
      success: false,
      message: `Notification failed: ${error.message}`,
      recipients_count: 0,
      resolution_source: 'error',
      resolution_log: [`Error: ${error.message}`]
    };
  }
}

/**
 * Log notification attempt with recipient role, plant, store, and order_id details
 */
async function logNotificationAttempt(
  resolutionResult: any,
  payload: NotificationPayload,
  success: boolean
): Promise<void> {
  try {
    for (const recipient of resolutionResult.recipients) {
      const logData = {
        order_id: payload.order_id,
        order_type: payload.order_type,
        notification_type: `${payload.order_type}_notification`,
        recipient_email: recipient.email,
        recipient_role: recipient.role,
        store: resolutionResult.store,
        plant: resolutionResult.plant,
        status: success ? 'sent' : 'failed',
        email_provider: 'resend',
        metadata: {
          service: 'unified_notification_service',
          resolution_source: resolutionResult.source,
          recipient_name: recipient.name,
          store_number: payload.store_number,
          order_data: {
            product_number: payload.product_number,
            description: payload.description,
            quantity: payload.quantity
          },
          resolution_log: resolutionResult.resolutionLog,
          timestamp: new Date().toISOString()
        }
      };

      const { error } = await supabase
        .from('notification_logs')
        .insert(logData);

      if (error) {
        console.error(`❌ UNIFIED NOTIFICATION - Failed to log for ${recipient.email}:`, error);
      }
    }
    
    console.log(`📝 UNIFIED NOTIFICATION - Logged notification attempt for ${resolutionResult.recipients.length} recipients`);
    
  } catch (error) {
    console.error('❌ UNIFIED NOTIFICATION - Error logging notification attempt:', error);
  }
}

/**
 * Extract store number from store name for legacy compatibility
 */
function extractStoreNumber(storeName: string): string {
  const match = storeName.match(/(\d+)/);
  return match ? match[1] : '';
}

// Convenience functions for specific order types

export async function sendTransferNotification(
  orderData: OrderDataInput,
  orderId: string,
  additionalPayload?: Partial<NotificationPayload>
): Promise<NotificationResult> {
  return sendUnifiedNotification(orderData, 'transfer', orderId, additionalPayload);
}

export async function sendMTONotification(
  orderData: OrderDataInput,
  orderId: string,
  additionalPayload?: Partial<NotificationPayload>
): Promise<NotificationResult> {
  return sendUnifiedNotification(orderData, 'mto', orderId, additionalPayload);
}

export async function sendWheelNotification(
  orderData: OrderDataInput,
  orderId: string,
  additionalPayload?: Partial<NotificationPayload>
): Promise<NotificationResult> {
  return sendUnifiedNotification(orderData, 'wheel', orderId, additionalPayload);
}

export async function sendWarrantyNotification(
  orderData: OrderDataInput,
  orderId: string,
  additionalPayload?: Partial<NotificationPayload>
): Promise<NotificationResult> {
  return sendUnifiedNotification(orderData, 'warranty', orderId, additionalPayload);
}

export async function sendCrossDockNotification(
  orderData: OrderDataInput,
  orderId: string,
  additionalPayload?: Partial<NotificationPayload>
): Promise<NotificationResult> {
  return sendUnifiedNotification(orderData, 'cross_dock', orderId, additionalPayload);
}
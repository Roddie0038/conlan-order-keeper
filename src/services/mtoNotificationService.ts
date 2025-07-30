import { supabase } from "@/integrations/supabase/client";
import { getStoreEmailRecipients } from "@/services/emailRouting";
import { extractStoreNumber } from "@/utils/storeNormalization";

export interface MTONotificationPayload {
  order_id: string;
  store_number: string;
  plant: string;
  notification_type: "mto_casings_needed" | "mto_completion";
}

/**
 * Send MTO notification email using the OT Platform's mto-notification-email function
 */
export async function sendMTONotificationEmail(
  orderData: {
    id: string;
    store: string;
    plant: string;
  },
  notificationType: "mto_casings_needed" | "mto_completion" = "mto_casings_needed"
): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`📧 MTO NOTIFICATION - Starting notification for order ${orderData.id}`);
    
    // Extract store number from the normalized store name
    const storeNumber = extractStoreNumber(orderData.store);
    
    // Get role-based email recipients for MTO notifications
    const recipientsResult = await getStoreEmailRecipients(storeNumber, 'mto', orderData.plant);
    
    console.log(`📧 MTO NOTIFICATION - Found ${recipientsResult.recipients.length} recipients from ${recipientsResult.source}`);
    
    // Prepare payload matching the edge function's expected structure
    const payload = {
      mtoData: {
        id: orderData.id,
        store: orderData.store,
        plant: orderData.plant,
        order_type: 'MTO',
        notification_type: notificationType
      },
      orderId: orderData.id,
      recipients: recipientsResult.recipients
    };
    
    console.log(`📧 MTO NOTIFICATION - Calling OT Platform function with payload:`, payload);
    
    // Call the OT Platform mto-notification-email function
    const response = await fetch('https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/mto-notification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log(`✅ MTO NOTIFICATION - Function response:`, result);
    
    // Log to notification_logs for monitoring
    await logMTONotification(orderData.id, storeNumber, orderData.plant, notificationType, 'success', recipientsResult.recipients);
    
    return {
      success: true,
      message: `MTO notification sent successfully to ${recipientsResult.recipients.length} recipients`
    };
    
  } catch (error) {
    console.error(`❌ MTO NOTIFICATION - Error sending notification:`, error);
    
    // Log the error
    await logMTONotification(
      orderData.id, 
      extractStoreNumber(orderData.store), 
      orderData.plant, 
      notificationType, 
      'failed', 
      [], 
      error.message
    );
    
    return {
      success: false,
      message: `Failed to send MTO notification: ${error.message}`
    };
  }
}

/**
 * Log MTO notification attempt to notification_logs
 */
async function logMTONotification(
  orderId: string,
  storeNumber: string,
  plant: string,
  notificationType: string,
  status: 'success' | 'failed',
  recipients: string[] = [],
  errorMessage?: string
): Promise<void> {
  try {
    // FIXED: Use order_id for notification_logs (which expects UUID in order_id column)
    // but ensure we're getting the UUID string, not trying to insert into mto_orders
    const logData = {
      order_id: orderId, // This goes to notification_logs.order_id (UUID column)
      order_number: orderId, // Also set order_number for compatibility
      notification_type: 'mto_notification_trigger',
      recipient_email: recipients.join(', ') || 'none',
      store: storeNumber,
      plant: plant,
      order_type: 'mto',
      status: status,
      platform: 'ordering_platform',
      email_provider: 'ot_platform_function',
      metadata: {
        notification_type: notificationType,
        recipient_count: recipients.length,
        recipients: recipients,
        timestamp: new Date().toISOString(),
        mto_order_id: orderId, // Store MTO order ID in metadata for reference
        ...(errorMessage && { error_message: errorMessage })
      }
    };

    console.log(`📝 MTO NOTIFICATION - Logging to notification_logs:`, {
      orderId,
      logDataKeys: Object.keys(logData),
      hasOrderId: 'order_id' in logData,
      orderIdValue: logData.order_id
    });

    await supabase
      .from('notification_logs')
      .insert(logData);
      
    console.log(`📝 MTO NOTIFICATION - Logged notification attempt: ${status}`);
  } catch (error) {
    console.error(`❌ MTO NOTIFICATION - Failed to log notification:`, error);
    // Don't throw - logging failures shouldn't block the process
  }
}
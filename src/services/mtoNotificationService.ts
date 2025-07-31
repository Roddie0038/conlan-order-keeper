import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { extractStoreNumber } from '@/utils/storeNormalization';

// Temporary email routing replacement
async function getStoreEmailRecipients(storeNumber: string, orderType: string) {
  return {
    recipients: [`store${storeNumber}@conlantire.com`],
    source: 'fallback'
  };
}

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
    logger.info(`Starting MTO notification for order ${orderData.id}`, { 
      orderId: orderData.id, 
      notificationType 
    });
    
    // Extract store number from the normalized store name
    const storeNumber = extractStoreNumber(orderData.store);
    
    // Get role-based email recipients for MTO notifications
    const recipientsResult = await getStoreEmailRecipients(storeNumber, 'mto');
    
    if (!recipientsResult.recipients || recipientsResult.recipients.length === 0) {
      const errorMsg = `No email recipients found for store ${storeNumber} (${orderData.store})`;
      logger.error(errorMsg, { storeNumber, store: orderData.store });
      return { success: false, message: errorMsg };
    }
    
    // Prepare notification payload
    const notificationPayload: MTONotificationPayload = {
      order_id: orderData.id,
      store_number: storeNumber,
      plant: orderData.plant,
      notification_type: notificationType
    };
    
    logger.info(`Sending MTO notification to ${recipientsResult.recipients.length} recipients via OT Platform`, {
      recipients: recipientsResult.recipients,
      payload: notificationPayload
    });
    
    // Send notification via OT Platform's mto-notification-email function
    const response = await fetch('https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/mto-notification-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkYml4dGFxanBwdmRreWZiaGt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzcwNjEsImV4cCI6MjA1NTkxMzA2MX0.mkeq7GvLjzw8om8t9mnlLLozHimoYy-HsRgJ65RRc10`
      },
      body: JSON.stringify({
        notificationPayload,
        recipients: recipientsResult.recipients,
        source: 'ordering_platform_mto_service'
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      const errorMsg = `Failed to send MTO notification (${response.status}): ${errorText}`;
      logger.error(errorMsg, { 
        status: response.status, 
        statusText: response.statusText,
        error: errorText 
      });
      return { success: false, message: errorMsg };
    }
    
    const result = await response.json();
    
    logger.info(`MTO notification sent successfully`, {
      result,
      recipients: recipientsResult.recipients.length
    });
    
    return { 
      success: true, 
      message: `MTO notification sent to ${recipientsResult.recipients.length} recipients` 
    };
    
  } catch (error) {
    const errorMsg = `Error sending MTO notification: ${error.message}`;
    logger.error(errorMsg, {}, error instanceof Error ? error : new Error(String(error)));
    return { success: false, message: errorMsg };
  }
}
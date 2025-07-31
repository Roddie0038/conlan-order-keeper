/**
 * Phase 2: Centralized Email Notification Controller
 * Consolidates all email notifications through a single, secure service
 * Aligned with OT Platform Phase 2 implementation standards
 */

import { supabase } from "@/integrations/supabase/client";
import { resolveEmailRecipients, type EmailType, type OrderDataInput } from "@/services/emailRecipientResolver";

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
  deduplication_key?: string;
  sent_to?: string[];
}

export interface DeduplicationEntry {
  key: string;
  order_id: string;
  email_type: EmailType;
  timestamp: string;
  recipients: string[];
}

class NotificationController {
  private readonly ALLOWED_DOMAINS = ['@conlantire.com', '@aol.com'];
  private readonly deduplicationCache = new Map<string, DeduplicationEntry>();
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Send order confirmation email with deduplication and domain filtering
   */
  async sendOrderConfirmation(
    orderData: OrderDataInput,
    emailType: EmailType,
    orderId: string,
    additionalPayload?: Partial<NotificationPayload>
  ): Promise<NotificationResult> {
    
    console.log(`📧 NOTIFICATION CONTROLLER - Processing ${emailType} confirmation for order ${orderId}`);
    
    try {
      // Generate deduplication key
      const deduplicationKey = this.generateDeduplicationKey(orderId, emailType, orderData.store);
      
      // Check for duplicate
      if (this.isDuplicateNotification(deduplicationKey)) {
        console.log(`🚫 NOTIFICATION CONTROLLER - Duplicate notification blocked: ${deduplicationKey}`);
        return {
          success: true,
          message: 'Duplicate notification blocked by deduplication',
          recipients_count: 0,
          resolution_source: 'deduplication',
          deduplication_key: deduplicationKey
        };
      }

      // Resolve recipients using the three-tier system
      const resolutionResult = await resolveEmailRecipients(orderData, emailType, orderId);
      
      if (resolutionResult.recipients.length === 0) {
        console.log(`⚠️ NOTIFICATION CONTROLLER - No recipients found for ${emailType} notification`);
        return {
          success: true,
          message: 'No recipients configured for this notification type',
          recipients_count: 0,
          resolution_source: resolutionResult.source
        };
      }

      // Filter recipients by allowed domains
      const filteredRecipients = this.filterRecipientsByDomain(resolutionResult.recipients);
      
      if (filteredRecipients.length === 0) {
        console.log(`🚫 NOTIFICATION CONTROLLER - All recipients filtered out by domain policy`);
        await this.logNotificationAttempt(orderId, emailType, [], 'blocked_domain_policy', orderData);
        return {
          success: false,
          message: 'All recipients blocked by domain policy',
          recipients_count: 0,
          resolution_source: resolutionResult.source
        };
      }

      console.log(`📧 NOTIFICATION CONTROLLER - Sending to ${filteredRecipients.length} allowed recipients`);

      // Create notification payload
      const notificationPayload: NotificationPayload = {
        store_number: this.extractStoreNumber(resolutionResult.store || orderData.store),
        store_name: resolutionResult.store || orderData.store,
        order_type: emailType,
        order_id: orderId,
        timestamp: new Date().toISOString(),
        name: orderData.name || 'Unknown',
        email: orderData.email || '',
        plant: resolutionResult.plant || orderData.plant || 'Unknown',
        ...additionalPayload
      };

      // Send notification via edge function
      const emailResult = await this.invokeEmailFunction(notificationPayload, filteredRecipients);
      
      // Add to deduplication cache
      if (emailResult.success) {
        this.addToDeduplicationCache(deduplicationKey, orderId, emailType, filteredRecipients.map(r => r.email));
      }

      // Log notification attempt
      await this.logNotificationAttempt(
        orderId, 
        emailType, 
        filteredRecipients, 
        emailResult.success ? 'sent' : 'failed', 
        orderData,
        emailResult.success ? undefined : emailResult.message
      );

      return {
        success: emailResult.success,
        message: emailResult.message,
        recipients_count: filteredRecipients.length,
        resolution_source: resolutionResult.source,
        deduplication_key: deduplicationKey,
        sent_to: filteredRecipients.map(r => r.email)
      };

    } catch (error) {
      console.error(`❌ NOTIFICATION CONTROLLER - Error sending ${emailType} notification:`, error);
      
      await this.logNotificationAttempt(orderId, emailType, [], 'failed', orderData, error.message);
      
      return {
        success: false,
        message: `Notification failed: ${error.message}`,
        recipients_count: 0,
        resolution_source: 'error'
      };
    }
  }

  /**
   * Generate unique deduplication key for notification
   */
  private generateDeduplicationKey(orderId: string, emailType: EmailType, store: string): string {
    const storeNumber = this.extractStoreNumber(store);
    return `${emailType}-${orderId}-${storeNumber}-${new Date().toDateString()}`;
  }

  /**
   * Check if notification is a duplicate
   */
  private isDuplicateNotification(deduplicationKey: string): boolean {
    const cached = this.deduplicationCache.get(deduplicationKey);
    if (!cached) return false;

    // Check if cache entry is still valid
    const age = Date.now() - new Date(cached.timestamp).getTime();
    if (age > this.CACHE_TTL_MS) {
      this.deduplicationCache.delete(deduplicationKey);
      return false;
    }

    return true;
  }

  /**
   * Add notification to deduplication cache
   */
  private addToDeduplicationCache(
    key: string, 
    orderId: string, 
    emailType: EmailType, 
    recipients: string[]
  ): void {
    this.deduplicationCache.set(key, {
      key,
      order_id: orderId,
      email_type: emailType,
      timestamp: new Date().toISOString(),
      recipients
    });

    // Cleanup old entries
    this.cleanupDeduplicationCache();
  }

  /**
   * Clean up expired deduplication cache entries
   */
  private cleanupDeduplicationCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.deduplicationCache.entries()) {
      const age = now - new Date(entry.timestamp).getTime();
      if (age > this.CACHE_TTL_MS) {
        this.deduplicationCache.delete(key);
      }
    }
  }

  /**
   * Filter recipients by allowed email domains
   */
  private filterRecipientsByDomain(recipients: any[]): any[] {
    return recipients.filter(recipient => {
      const domain = recipient.email.split('@')[1];
      const isDomainAllowed = this.ALLOWED_DOMAINS.some(allowedDomain => 
        domain === allowedDomain.replace('@', '')
      );
      
      if (!isDomainAllowed) {
        console.log(`🚫 NOTIFICATION CONTROLLER - Blocked ${recipient.email} (domain: ${domain})`);
      }
      
      return isDomainAllowed;
    });
  }

  /**
   * Invoke the centralized email edge function
   */
  private async invokeEmailFunction(
    payload: NotificationPayload, 
    recipients: any[]
  ): Promise<{ success: boolean; message: string }> {
    
    try {
      const { data, error } = await supabase.functions.invoke('ordering-confirmation-email', {
        body: {
          ...payload,
          recipients: recipients.map(r => r.email)
        }
      });

      if (error) {
        console.error('❌ NOTIFICATION CONTROLLER - Edge function error:', error);
        throw error;
      }

      console.log('✅ NOTIFICATION CONTROLLER - Email function invoked successfully:', data);
      return data || { success: true, message: 'Email sent successfully' };
      
    } catch (error) {
      console.error('❌ NOTIFICATION CONTROLLER - Failed to invoke email function:', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * Log notification attempt to database
   */
  private async logNotificationAttempt(
    orderId: string,
    emailType: EmailType,
    recipients: any[],
    status: 'sent' | 'failed' | 'blocked_domain_policy',
    orderData: OrderDataInput,
    errorMessage?: string
  ): Promise<void> {
    
    try {
      for (const recipient of recipients) {
        const logData = {
          order_id: orderId,
          order_type: emailType,
          email_type: 'order_confirmation',
          store_number: this.extractStoreNumber(orderData.store),
          recipient_email: recipient.email,
          status: status,
          response: status === 'sent' ? 'Notification sent via controller' : null,
          error_details: errorMessage
        };

        const { error } = await supabase
          .from('ordering_email_logs')
          .insert(logData);

        if (error) {
          console.error(`❌ NOTIFICATION CONTROLLER - Failed to log for ${recipient.email}:`, error);
        }
      }

      // Log summary entry
      if (recipients.length > 0 || status !== 'sent') {
        const summaryData = {
          order_id: orderId,
          order_type: emailType,
          email_type: 'order_confirmation_summary',
          store_number: this.extractStoreNumber(orderData.store),
          recipient_email: `summary_${recipients.length}_recipients`,
          status: status,
          response: `Processed ${recipients.length} recipients`,
          error_details: errorMessage
        };

        await supabase
          .from('ordering_email_logs')
          .insert(summaryData);
      }

    } catch (error) {
      console.error('❌ NOTIFICATION CONTROLLER - Error logging notification attempt:', error);
    }
  }

  /**
   * Extract store number from store name for legacy compatibility
   */
  private extractStoreNumber(storeName: string): string {
    const match = storeName.match(/(\d+)/);
    return match ? match[1] : '';
  }

  /**
   * Get deduplication statistics
   */
  getDuplicationStats(): {
    total_cached: number;
    oldest_entry: string | null;
    newest_entry: string | null;
  } {
    const entries = Array.from(this.deduplicationCache.values());
    
    return {
      total_cached: entries.length,
      oldest_entry: entries.length > 0 
        ? entries.reduce((oldest, entry) => 
            new Date(entry.timestamp) < new Date(oldest.timestamp) ? entry : oldest
          ).timestamp 
        : null,
      newest_entry: entries.length > 0 
        ? entries.reduce((newest, entry) => 
            new Date(entry.timestamp) > new Date(newest.timestamp) ? entry : newest
          ).timestamp 
        : null
    };
  }
}

// Export singleton instance
export const notificationController = new NotificationController();

// Convenience functions for different order types
export async function sendTransferOrderConfirmation(
  orderData: OrderDataInput,
  orderId: string,
  additionalPayload?: Partial<NotificationPayload>
): Promise<NotificationResult> {
  return notificationController.sendOrderConfirmation(orderData, 'transfer', orderId, additionalPayload);
}

export async function sendMTOOrderConfirmation(
  orderData: OrderDataInput,
  orderId: string,
  additionalPayload?: Partial<NotificationPayload>
): Promise<NotificationResult> {
  return notificationController.sendOrderConfirmation(orderData, 'mto', orderId, additionalPayload);
}

export async function sendWheelOrderConfirmation(
  orderData: OrderDataInput,
  orderId: string,
  additionalPayload?: Partial<NotificationPayload>
): Promise<NotificationResult> {
  return notificationController.sendOrderConfirmation(orderData, 'wheel', orderId, additionalPayload);
}

export async function sendWarrantyOrderConfirmation(
  orderData: OrderDataInput,
  orderId: string,
  additionalPayload?: Partial<NotificationPayload>
): Promise<NotificationResult> {
  return notificationController.sendOrderConfirmation(orderData, 'warranty', orderId, additionalPayload);
}

export async function sendCrossDockOrderConfirmation(
  orderData: OrderDataInput,
  orderId: string,
  additionalPayload?: Partial<NotificationPayload>
): Promise<NotificationResult> {
  return notificationController.sendOrderConfirmation(orderData, 'cross_dock', orderId, additionalPayload);
}
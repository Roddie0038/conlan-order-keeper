import { supabase } from "@/integrations/supabase/client";
import { getStoreNumberVariants } from "@/utils/storeSanitization";
import { normalizeStoreForSubmission, extractStoreNumber } from "@/utils/storeNormalization";

export interface EmailRoutingAlert {
  id: string;
  alertType: 'missing_recipients' | 'invalid_order_id' | 'routing_failure' | 'uuid_conversion_error';
  severity: 'critical' | 'warning' | 'info';
  orderType: string;
  storeNumber: string;
  orderid: string | null;
  message: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface EmailRoutingHealth {
  isHealthy: boolean;
  lastCheckTime: string;
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  recentRoutingResults: {
    orderType: string;
    storeNumber: string;
    recipientCount: number;
    source: 'database' | 'fallback';
    timestamp: string;
  }[];
}

/**
 * Email Routing Monitor Service
 * Monitors and alerts on email routing health, especially UUID order ID compliance
 */
export class EmailRoutingMonitor {
  
  /**
   * Check if an order ID is a valid UUID format
   */
  private isValidUUID(orderid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(orderid);
  }

  /**
   * Log email routing attempt with UUID validation
   */
  async logEmailRoutingAttempt(
    orderType: string,
    emailType: string,
    storeNumber: string,
    orderid: string | null,
    recipients: string[],
    source: 'database' | 'fallback',
    fallbackReason?: string
  ): Promise<void> {
    try {
      // Validate UUID format if order ID is provided
      if (orderid && !this.isValidUUID(orderid)) {
        await this.createAlert({
          alertType: 'invalid_order_id',
          severity: 'warning',
          orderType,
          storeNumber,
          orderid,
          message: `Order ID is not in valid UUID format: ${orderid}`,
          metadata: {
            emailType,
            recipientCount: recipients.length,
            source,
            fallbackReason
          }
        });
      }

      // Alert if no recipients found
      if (recipients.length === 0) {
        await this.createAlert({
          alertType: 'missing_recipients',
          severity: 'critical',
          orderType,
          storeNumber,
          orderid,
          message: `No email recipients found for ${orderType} order in store ${storeNumber}`,
          metadata: {
            emailType,
            source,
            fallbackReason
          }
        });
      }

      // Log the routing attempt
      await supabase
        .from('notification_logs')
        .insert({
          notification_type: 'email_routing_attempt',
          order_id: orderid ? orderid : null,
          order_number: orderid || `${storeNumber}-${orderType}-${Date.now()}`,
          order_type: orderType,
          recipient_email: recipients.join(', ') || 'none',
          status: recipients.length > 0 ? 'success' : 'failed',
          platform: 'ordering_platform',
          store: storeNumber,
          email_provider: 'monitoring',
          metadata: {
            routing_source: source,
            email_type: emailType,
            recipient_count: recipients.length,
            uuid_compliant: orderid ? this.isValidUUID(orderid) : null,
            ...(fallbackReason && { fallback_reason: fallbackReason })
          }
        });

      console.log(`📧 EMAIL ROUTING MONITOR - Logged attempt: ${orderType}/${emailType} for store ${storeNumber}, ${recipients.length} recipients, source: ${source}`);

    } catch (error) {
      console.error('📧 EMAIL ROUTING MONITOR - Failed to log routing attempt:', error);
      // Don't throw - monitoring failures shouldn't block email sending
    }
  }

  /**
   * Create an alert for email routing issues
   */
  private async createAlert(alert: Omit<EmailRoutingAlert, 'id' | 'createdAt'>): Promise<void> {
    try {
      // Store alerts in notification_logs with special type
      await supabase
        .from('notification_logs')
        .insert({
          notification_type: `email_routing_alert_${alert.alertType}`,
          order_id: alert.orderid || null,
          order_number: alert.orderid || `alert-${Date.now()}`,
          order_type: alert.orderType,
          recipient_email: 'system-alert',
          status: alert.severity,
          platform: 'email_routing_monitor',
          store: alert.storeNumber,
          email_provider: 'monitoring',
          metadata: {
            alert_type: alert.alertType,
            severity: alert.severity,
            message: alert.message,
            alert_metadata: alert.metadata
          }
        });

      console.log(`🚨 EMAIL ROUTING ALERT - ${alert.severity.toUpperCase()}: ${alert.message}`);

    } catch (error) {
      console.error('📧 EMAIL ROUTING MONITOR - Failed to create alert:', error);
    }
  }

  /**
   * Get current email routing health status
   */
  async getRoutingHealth(): Promise<EmailRoutingHealth> {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      // Get recent alerts
      const { data: alertLogs } = await supabase
        .from('notification_logs')
        .select('*')
        .like('notification_type', 'email_routing_alert_%')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false });

      // Get recent routing attempts
      const { data: routingLogs } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('notification_type', 'email_routing_attempt')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(50);

      const alerts = alertLogs || [];
      const criticalAlerts = alerts.filter(a => a.status === 'critical').length;
      const warningAlerts = alerts.filter(a => a.status === 'warning').length;

      const recentRoutingResults = (routingLogs || []).map(log => {
        const metadata = log.metadata as any;
        return {
          orderType: log.order_type || 'unknown',
          storeNumber: log.store || 'unknown',
          recipientCount: metadata?.recipient_count || 0,
          source: metadata?.routing_source || 'unknown',
          timestamp: log.created_at || ''
        };
      });

      return {
        isHealthy: criticalAlerts === 0,
        lastCheckTime: new Date().toISOString(),
        totalAlerts: alerts.length,
        criticalAlerts,
        warningAlerts,
        recentRoutingResults
      };

    } catch (error) {
      console.error('📧 EMAIL ROUTING MONITOR - Failed to get health status:', error);
      return {
        isHealthy: false,
        lastCheckTime: new Date().toISOString(),
        totalAlerts: 0,
        criticalAlerts: 0,
        warningAlerts: 0,
        recentRoutingResults: []
      };
    }
  }

  /**
   * Validate all email routing configurations
   */
  async validateRoutingConfiguration(): Promise<{
    isValid: boolean;
    issues: string[];
    storesCovered: string[];
    storesMissingCoverage: string[];
  }> {
    try {
      const allStores = ['022', '027', '028', '029', '030', '032', '033', '035', '036', '039'];
      const allNotificationTypes = ['transfer', 'cross_dock', 'mto', 'wheel', 'warranty', 'complaint'];
      
      const issues: string[] = [];
      const storesCovered: string[] = [];
      const storesMissingCoverage: string[] = [];

      // Check each store for email routing coverage
      for (const store of allStores) {
        let hasAnyCoverage = false;
        
        // Get all possible store format variants for this store
        const storeVariants = getStoreNumberVariants(store);
        const normalizedStoreName = normalizeStoreForSubmission(store);
        
        // Add more comprehensive store variants
        const allStoreVariants = [
          store, // raw number like "022"
          `Store ${store}`, // "Store 022"
          `Store ${parseInt(store)}`, // "Store 22"
          normalizedStoreName, // "Fort Worth 022" etc.
          ...storeVariants
        ];
        
        // Check if store has any email recipients configured using any variant
        for (const variant of allStoreVariants) {
          const { data: recipients } = await supabase
            .from('ordering_email_recipients')
            .select('*')
            .eq('store_number', variant)
            .eq('is_active', true);

          if (recipients && recipients.length > 0) {
            hasAnyCoverage = true;
            break;
          }
        }

        if (hasAnyCoverage && !storesCovered.includes(store)) {
          storesCovered.push(store);
        }

        // Check fallback coverage through ot_platform_users using variants
        if (!hasAnyCoverage) {
          for (const variant of allStoreVariants) {
            const { data: platformUsers } = await supabase
              .from('ot_platform_users')
              .select('*')
              .eq('store', variant)
              .eq('status', 'active');

            if (platformUsers && platformUsers.length > 0) {
              hasAnyCoverage = true;
              break;
            }
          }
        }

        if (hasAnyCoverage && !storesCovered.includes(store)) {
          storesCovered.push(store);
        }

        if (!hasAnyCoverage) {
          storesMissingCoverage.push(store);
          issues.push(`Store ${store} has no email routing coverage (checked variants: ${allStoreVariants.join(', ')})`);
        }
      }

      // Check for UUID compliance in recent orders
      const { data: recentLogs } = await supabase
        .from('notification_logs')
        .select('order_id, order_type, store')
        .not('order_id', 'is', null)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .limit(100);

      if (recentLogs) {
        const nonUuidOrders = recentLogs.filter(log => 
          log.order_id && !this.isValidUUID(log.order_id)
        );

        if (nonUuidOrders.length > 0) {
          issues.push(`Found ${nonUuidOrders.length} recent notification logs with non-UUID order IDs`);
        }
      }

      return {
        isValid: issues.length === 0,
        issues,
        storesCovered,
        storesMissingCoverage
      };

    } catch (error) {
      console.error('📧 EMAIL ROUTING MONITOR - Failed to validate configuration:', error);
      return {
        isValid: false,
        issues: ['Failed to validate routing configuration due to error'],
        storesCovered: [],
        storesMissingCoverage: []
      };
    }
  }
}

// Export singleton instance
export const emailRoutingMonitor = new EmailRoutingMonitor();
/**
 * Phase 4: Notification & Logging Hardening Service
 * Implements comprehensive retry, fallback, and error tracking for all notifications
 */

import { supabase } from "@/integrations/supabase/client";
import { emailRoutingMonitor } from "@/services/emailRoutingMonitor";
import { sendUnifiedNotification, type NotificationResult, type NotificationPayload } from "@/services/unifiedNotificationService";
import { resolveEmailRecipients, type EmailType, type OrderDataInput, type EmailResolutionResult } from "@/services/emailRecipientResolver";

export interface HardenedNotificationConfig {
  maxRetries: number;
  retryDelayMs: number;
  enableFallbackRouting: boolean;
  enableComprehensiveLogging: boolean;
  timeoutMs: number;
}

export interface NotificationAttempt {
  attemptId: string;
  orderId: string;
  emailType: EmailType;
  attempt: number;
  status: 'pending' | 'success' | 'failed' | 'timeout' | 'retry_scheduled';
  startTime: string;
  endTime?: string;
  duration?: number;
  recipients: string[];
  resolutionSource: string;
  errorDetails?: string;
  metadata: Record<string, any>;
}

export interface HardenedNotificationResult extends NotificationResult {
  attempts: NotificationAttempt[];
  totalAttempts: number;
  finalStatus: 'success' | 'failed' | 'timeout' | 'max_retries_exceeded';
  totalDuration: number;
  fallbacksUsed: string[];
  criticalErrors: string[];
}

export class NotificationHardeningService {
  private readonly config: HardenedNotificationConfig;
  private readonly attemptLog: Map<string, NotificationAttempt[]> = new Map();

  constructor(config: Partial<HardenedNotificationConfig> = {}) {
    this.config = {
      maxRetries: 3,
      retryDelayMs: 2000,
      enableFallbackRouting: true,
      enableComprehensiveLogging: true,
      timeoutMs: 30000,
      ...config
    };
  }

  /**
   * Send hardened notification with comprehensive retry and fallback logic
   */
  async sendHardenedNotification(
    orderData: OrderDataInput,
    emailType: EmailType,
    orderId: string,
    additionalPayload?: Partial<NotificationPayload>
  ): Promise<HardenedNotificationResult> {
    
    const sessionId = `${orderId}-${emailType}-${Date.now()}`;
    const startTime = new Date();
    
    console.log(`🛡️ HARDENED NOTIFICATION - Starting session ${sessionId}`);
    
    let attempts: NotificationAttempt[] = [];
    let lastResult: NotificationResult | null = null;
    let fallbacksUsed: string[] = [];
    let criticalErrors: string[] = [];

    try {
      // Log initial routing health check
      await this.logRoutingHealthCheck(orderId, emailType, orderData.store);

      // Attempt notification with retry logic
      for (let attempt = 1; attempt <= this.config.maxRetries + 1; attempt++) {
        const attemptStart = new Date();
        const attemptId = `${sessionId}-attempt-${attempt}`;
        
        console.log(`🛡️ HARDENED NOTIFICATION - Attempt ${attempt}/${this.config.maxRetries + 1} for ${sessionId}`);

        // Create attempt record
        const attemptRecord: NotificationAttempt = {
          attemptId,
          orderId,
          emailType,
          attempt,
          status: 'pending',
          startTime: attemptStart.toISOString(),
          recipients: [],
          resolutionSource: 'unknown',
          metadata: {
            sessionId,
            orderData: this.sanitizeOrderData(orderData),
            additionalPayload
          }
        };

        attempts.push(attemptRecord);

        try {
          // Attempt notification with timeout
          const notificationPromise = this.attemptNotificationWithTimeout(
            orderData, 
            emailType, 
            orderId, 
            additionalPayload
          );

          lastResult = await Promise.race([
            notificationPromise,
            this.createTimeoutPromise(this.config.timeoutMs)
          ]);

          // Update attempt record with success
          const attemptEnd = new Date();
          attemptRecord.status = lastResult.success ? 'success' : 'failed';
          attemptRecord.endTime = attemptEnd.toISOString();
          attemptRecord.duration = attemptEnd.getTime() - attemptStart.getTime();
          attemptRecord.recipients = Array.isArray(lastResult.resolution_log) 
            ? lastResult.resolution_log.filter(log => log.includes('@'))
            : [];
          attemptRecord.resolutionSource = lastResult.resolution_source;
          
          if (!lastResult.success) {
            attemptRecord.errorDetails = lastResult.message;
            criticalErrors.push(`Attempt ${attempt}: ${lastResult.message}`);
          }

          // Log detailed attempt
          await this.logNotificationAttempt(attemptRecord, lastResult);

          // Break on success
          if (lastResult.success && lastResult.recipients_count > 0) {
            console.log(`✅ HARDENED NOTIFICATION - Success on attempt ${attempt}`);
            break;
          }

          // Apply fallback routing if enabled and not last attempt
          if (this.config.enableFallbackRouting && attempt < this.config.maxRetries + 1) {
            const fallbackResult = await this.applyFallbackRouting(orderData, emailType, attempt);
            if (fallbackResult.applied) {
              fallbacksUsed.push(fallbackResult.fallbackType);
              orderData = { ...orderData, ...fallbackResult.modifiedData };
            }
          }

        } catch (error) {
          console.error(`❌ HARDENED NOTIFICATION - Attempt ${attempt} failed:`, error);
          
          const attemptEnd = new Date();
          attemptRecord.status = error.message.includes('timeout') ? 'timeout' : 'failed';
          attemptRecord.endTime = attemptEnd.toISOString();
          attemptRecord.duration = attemptEnd.getTime() - attemptStart.getTime();
          attemptRecord.errorDetails = error.message;
          
          criticalErrors.push(`Attempt ${attempt}: ${error.message}`);
          
          await this.logNotificationAttempt(attemptRecord, null, error);
        }

        // Wait before retry (except on last attempt)
        if (attempt < this.config.maxRetries + 1) {
          await this.delay(this.config.retryDelayMs * attempt); // Exponential backoff
        }
      }

      // Determine final status
      const finalStatus = this.determineFinalStatus(attempts, lastResult);
      const totalDuration = new Date().getTime() - startTime.getTime();

      // Log final session result
      await this.logSessionResult(sessionId, attempts, finalStatus, totalDuration, fallbacksUsed, criticalErrors);

      // Monitor routing health after completion
      await emailRoutingMonitor.logEmailRoutingAttempt(
        emailType,
        emailType,
        orderData.store,
        orderId,
        lastResult?.recipients_count ? [`${lastResult.recipients_count} recipients`] : [],
        lastResult?.resolution_source === 'order_fields' ? 'database' : 'fallback',
        criticalErrors.length > 0 ? criticalErrors.join('; ') : undefined
      );

      return {
        ...lastResult || this.createFailedResult(),
        attempts,
        totalAttempts: attempts.length,
        finalStatus,
        totalDuration,
        fallbacksUsed,
        criticalErrors
      };

    } catch (error) {
      console.error(`💥 HARDENED NOTIFICATION - Critical session failure:`, error);
      criticalErrors.push(`Critical session failure: ${error.message}`);
      
      return {
        ...this.createFailedResult(),
        attempts,
        totalAttempts: attempts.length,
        finalStatus: 'failed',
        totalDuration: new Date().getTime() - startTime.getTime(),
        fallbacksUsed,
        criticalErrors
      };
    }
  }

  /**
   * Attempt notification with built-in timeout protection
   */
  private async attemptNotificationWithTimeout(
    orderData: OrderDataInput,
    emailType: EmailType,
    orderId: string,
    additionalPayload?: Partial<NotificationPayload>
  ): Promise<NotificationResult> {
    
    return sendUnifiedNotification(orderData, emailType, orderId, additionalPayload);
  }

  /**
   * Create timeout promise for race conditions
   */
  private createTimeoutPromise(timeoutMs: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Notification timeout exceeded')), timeoutMs);
    });
  }

  /**
   * Apply fallback routing strategies
   */
  private async applyFallbackRouting(
    orderData: OrderDataInput,
    emailType: EmailType,
    attempt: number
  ): Promise<{
    applied: boolean;
    fallbackType: string;
    modifiedData: Partial<OrderDataInput>;
  }> {
    
    console.log(`🔄 HARDENED NOTIFICATION - Applying fallback routing for attempt ${attempt}`);

    // Fallback Strategy 1: Try alternative email field
    if (attempt === 2 && !orderData.email && orderData.destination_manager_email) {
      return {
        applied: true,
        fallbackType: 'alternative_email_field',
        modifiedData: { email: orderData.destination_manager_email }
      };
    }

    // Fallback Strategy 2: Expand to parent plant recipients
    if (attempt === 3 && orderData.plant) {
      return {
        applied: true,
        fallbackType: 'parent_plant_expansion',
        modifiedData: { plant: 'All Plants' }
      };
    }

    // Fallback Strategy 3: Super admin escalation
    if (attempt === 4) {
      return {
        applied: true,
        fallbackType: 'super_admin_escalation',
        modifiedData: { 
          email: 'system-alert@conlantire.com',
          escalation_required: true
        }
      };
    }

    return {
      applied: false,
      fallbackType: 'none',
      modifiedData: {}
    };
  }

  /**
   * Log routing health check before notification attempts
   */
  private async logRoutingHealthCheck(orderId: string, emailType: EmailType, store: string): Promise<void> {
    try {
      const healthStatus = await emailRoutingMonitor.getRoutingHealth();
      
      await supabase
        .from('notification_logs')
        .insert({
          order_id: orderId,
          notification_type: 'routing_health_check',
          recipient_email: 'system',
          recipient_role: 'system',
          store: store,
          status: healthStatus.isHealthy ? 'healthy' : 'degraded',
          email_provider: 'hardening_service',
          metadata: {
            service: 'notification_hardening_service',
            email_type: emailType,
            health_status: {
              is_healthy: healthStatus.isHealthy,
              last_check_time: healthStatus.lastCheckTime,
              total_alerts: healthStatus.totalAlerts,
              critical_alerts: healthStatus.criticalAlerts,
              warning_alerts: healthStatus.warningAlerts
            },
            timestamp: new Date().toISOString()
          } as any
        });

    } catch (error) {
      console.error('🛡️ HARDENED NOTIFICATION - Failed to log health check:', error);
    }
  }

  /**
   * Log individual notification attempt
   */
  private async logNotificationAttempt(
    attempt: NotificationAttempt,
    result: NotificationResult | null,
    error?: Error
  ): Promise<void> {
    
    if (!this.config.enableComprehensiveLogging) return;

    try {
      await supabase
        .from('notification_logs')
        .insert({
          order_id: attempt.orderId,
          notification_type: `hardened_attempt_${attempt.emailType}`,
          recipient_email: attempt.recipients.join(', ') || 'none',
          recipient_role: 'system_attempt',
          store: attempt.metadata.orderData?.store || 'unknown',
          status: attempt.status,
          error_message: attempt.errorDetails || error?.message,
          email_provider: 'hardening_service',
          metadata: {
            service: 'notification_hardening_service',
            attempt_id: attempt.attemptId,
            attempt_number: attempt.attempt,
            duration_ms: attempt.duration,
            resolution_source: attempt.resolutionSource,
            result_summary: result ? {
              success: result.success,
              recipients_count: result.recipients_count,
              message: result.message
            } : null,
            timestamp: new Date().toISOString()
          } as any
        });

    } catch (error) {
      console.error('🛡️ HARDENED NOTIFICATION - Failed to log attempt:', error);
    }
  }

  /**
   * Log final session result
   */
  private async logSessionResult(
    sessionId: string,
    attempts: NotificationAttempt[],
    finalStatus: string,
    totalDuration: number,
    fallbacksUsed: string[],
    criticalErrors: string[]
  ): Promise<void> {
    
    try {
      const firstAttempt = attempts[0];
      if (!firstAttempt) return;

      await supabase
        .from('notification_logs')
        .insert({
          order_id: firstAttempt.orderId,
          notification_type: `hardened_session_${firstAttempt.emailType}`,
          recipient_email: 'session_summary',
          recipient_role: 'system_session',
          store: firstAttempt.metadata.orderData?.store || 'unknown',
          status: finalStatus,
          error_message: criticalErrors.length > 0 ? criticalErrors.join('; ') : null,
          email_provider: 'hardening_service',
          metadata: {
            service: 'notification_hardening_service',
            session_id: sessionId,
            total_attempts: attempts.length,
            total_duration_ms: totalDuration,
            fallbacks_used: fallbacksUsed,
            critical_errors: criticalErrors,
            attempt_statuses: attempts.map(a => ({
              attempt: a.attempt,
              status: a.status,
              duration: a.duration,
              recipients: a.recipients.length
            })),
            timestamp: new Date().toISOString()
          } as any
        });

      console.log(`📊 HARDENED NOTIFICATION - Session ${sessionId} completed:`, {
        finalStatus,
        totalAttempts: attempts.length,
        totalDuration,
        fallbacksUsed,
        criticalErrors: criticalErrors.length
      });

    } catch (error) {
      console.error('🛡️ HARDENED NOTIFICATION - Failed to log session result:', error);
    }
  }

  /**
   * Determine final status based on attempts and last result
   */
  private determineFinalStatus(attempts: NotificationAttempt[], lastResult: NotificationResult | null): 'success' | 'failed' | 'timeout' | 'max_retries_exceeded' {
    if (lastResult?.success && lastResult.recipients_count > 0) {
      return 'success';
    }

    const hasTimeout = attempts.some(a => a.status === 'timeout');
    if (hasTimeout) {
      return 'timeout';
    }

    if (attempts.length >= this.config.maxRetries + 1) {
      return 'max_retries_exceeded';
    }

    return 'failed';
  }

  /**
   * Create a failed result template
   */
  private createFailedResult(): NotificationResult {
    return {
      success: false,
      message: 'Hardened notification failed',
      recipients_count: 0,
      resolution_source: 'hardening_service',
      resolution_log: ['Hardened notification service failure']
    };
  }

  /**
   * Sanitize order data for logging (remove sensitive fields)
   */
  private sanitizeOrderData(orderData: OrderDataInput): Partial<OrderDataInput> {
    const { email, ...sanitized } = orderData;
    return {
      ...sanitized,
      email: email ? '[EMAIL_REDACTED]' : null
    };
  }

  /**
   * Simple delay utility for retry backoff
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get comprehensive notification statistics
   */
  async getNotificationStatistics(hours: number = 24): Promise<{
    totalSessions: number;
    successRate: number;
    averageAttempts: number;
    averageDuration: number;
    fallbackUsage: Record<string, number>;
    errorCategories: Record<string, number>;
    criticalIssues: string[];
  }> {
    
    try {
      const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

      const { data: sessionLogs } = await supabase
        .from('notification_logs')
        .select('*')
        .like('notification_type', 'hardened_session_%')
        .gte('created_at', cutoffTime);

      if (!sessionLogs || sessionLogs.length === 0) {
        return {
          totalSessions: 0,
          successRate: 0,
          averageAttempts: 0,
          averageDuration: 0,
          fallbackUsage: {},
          errorCategories: {},
          criticalIssues: []
        };
      }

      const sessions = sessionLogs.map(log => ({
        status: log.status,
        metadata: log.metadata as any
      }));

      const successfulSessions = sessions.filter(s => s.status === 'success').length;
      const totalSessions = sessions.length;
      const successRate = totalSessions > 0 ? (successfulSessions / totalSessions) * 100 : 0;

      const totalAttempts = sessions.reduce((sum, s) => sum + (s.metadata?.total_attempts || 0), 0);
      const averageAttempts = totalSessions > 0 ? totalAttempts / totalSessions : 0;

      const totalDuration = sessions.reduce((sum, s) => sum + (s.metadata?.total_duration_ms || 0), 0);
      const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

      const fallbackUsage: Record<string, number> = {};
      const errorCategories: Record<string, number> = {};
      const criticalIssues: string[] = [];

      sessions.forEach(session => {
        // Count fallback usage
        if (session.metadata?.fallbacks_used) {
          session.metadata.fallbacks_used.forEach((fallback: string) => {
            fallbackUsage[fallback] = (fallbackUsage[fallback] || 0) + 1;
          });
        }

        // Categorize errors
        if (session.metadata?.critical_errors) {
          session.metadata.critical_errors.forEach((error: string) => {
            const category = this.categorizeError(error);
            errorCategories[category] = (errorCategories[category] || 0) + 1;
            
            if (this.isCriticalError(error)) {
              criticalIssues.push(error);
            }
          });
        }
      });

      return {
        totalSessions,
        successRate,
        averageAttempts,
        averageDuration,
        fallbackUsage,
        errorCategories,
        criticalIssues: [...new Set(criticalIssues)].slice(0, 10) // Top 10 unique critical issues
      };

    } catch (error) {
      console.error('🛡️ HARDENED NOTIFICATION - Failed to get statistics:', error);
      return {
        totalSessions: 0,
        successRate: 0,
        averageAttempts: 0,
        averageDuration: 0,
        fallbackUsage: {},
        errorCategories: {},
        criticalIssues: []
      };
    }
  }

  /**
   * Categorize error types for statistics
   */
  private categorizeError(error: string): string {
    if (error.includes('timeout')) return 'timeout';
    if (error.includes('recipients')) return 'recipient_resolution';
    if (error.includes('database')) return 'database';
    if (error.includes('network')) return 'network';
    if (error.includes('authentication')) return 'auth';
    return 'other';
  }

  /**
   * Determine if an error is critical
   */
  private isCriticalError(error: string): boolean {
    const criticalKeywords = ['critical', 'urgent', 'escalation', 'timeout', 'max_retries'];
    return criticalKeywords.some(keyword => error.toLowerCase().includes(keyword));
  }
}

// Export singleton instance with production-ready configuration
export const hardenedNotificationService = new NotificationHardeningService({
  maxRetries: 3,
  retryDelayMs: 2000,
  enableFallbackRouting: true,
  enableComprehensiveLogging: true,
  timeoutMs: 30000
});
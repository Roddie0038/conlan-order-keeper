/**
 * Phase 3: Standardized Logging Utility
 * Replaces all console.log statements with structured logging
 * Follows OT Platform logging patterns
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogContext {
  service?: string;
  orderId?: string;
  userId?: string;
  store?: string;
  plant?: string;
  emailType?: string;
  [key: string]: any;
}

class StandardizedLogger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isTest = process.env.NODE_ENV === 'test';

  /**
   * Log structured message with context
   */
  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    // Suppress all logging in test environment
    if (this.isTest) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context: context || {},
      ...(error && { 
        error: {
          name: error.name,
          message: error.message,
          stack: this.isDevelopment ? error.stack : undefined
        }
      })
    };

    // In development, use console for immediate feedback
    if (this.isDevelopment) {
      const contextStr = context ? ` | Context: ${JSON.stringify(context)}` : '';
      const errorStr = error ? ` | Error: ${error.message}` : '';
      
      switch (level) {
        case LogLevel.DEBUG:
          console.log(`🔍 [${timestamp}] ${message}${contextStr}${errorStr}`);
          break;
        case LogLevel.INFO:
          console.log(`ℹ️ [${timestamp}] ${message}${contextStr}${errorStr}`);
          break;
        case LogLevel.WARN:
          console.warn(`⚠️ [${timestamp}] ${message}${contextStr}${errorStr}`);
          break;
        case LogLevel.ERROR:
          console.error(`❌ [${timestamp}] ${message}${contextStr}${errorStr}`);
          if (error?.stack) console.error(error.stack);
          break;
      }
    }

    // In production, log to structured format (could be sent to external service)
    if (!this.isDevelopment) {
      // For production, we would send to external logging service
      // Currently just suppress console output in production
      this.sendToLoggingService(logEntry);
    }
  }

  /**
   * Send log entry to external logging service in production
   */
  private sendToLoggingService(logEntry: any): void {
    // In a real implementation, this would send to:
    // - Supabase Functions logging
    // - External service like DataDog, LogRocket, etc.
    // For now, we just store critical errors
    if (logEntry.level === LogLevel.ERROR) {
      // Could store in a logs table for critical errors
      this.storeError(logEntry);
    }
  }

  /**
   * Store critical errors in database
   */
  private async storeError(logEntry: any): Promise<void> {
    try {
      // In production, store critical errors in database
      // This would use the supabase client to insert to an error_logs table
    } catch (error) {
      // Fallback: if logging fails, don't crash the app
    }
  }

  /**
   * Debug level logging - only in development
   */
  debug(message: string, context?: LogContext): void {
    this.log(LogLevel.DEBUG, message, context);
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext): void {
    this.log(LogLevel.INFO, message, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.WARN, message, context, error);
  }

  /**
   * Error level logging
   */
  error(message: string, context?: LogContext, error?: Error): void {
    this.log(LogLevel.ERROR, message, context, error);
  }

  /**
   * Order-specific logging convenience method
   */
  orderEvent(message: string, orderId: string, orderType: string, additionalContext?: LogContext): void {
    this.info(message, {
      service: 'order_processing',
      orderId,
      orderType,
      ...additionalContext
    });
  }

  /**
   * Email notification logging convenience method
   */
  emailEvent(message: string, emailType: string, recipients: string[], orderId?: string, additionalContext?: LogContext): void {
    this.info(message, {
      service: 'email_notification',
      emailType,
      recipientCount: recipients.length,
      orderId,
      ...additionalContext
    });
  }

  /**
   * Authentication logging convenience method
   */
  authEvent(message: string, userId?: string, additionalContext?: LogContext): void {
    this.info(message, {
      service: 'authentication',
      userId,
      ...additionalContext
    });
  }
}

// Export singleton logger instance
export const logger = new StandardizedLogger();

// Legacy console replacement functions for gradual migration
export const logInfo = (message: string, context?: LogContext) => logger.info(message, context);
export const logWarn = (message: string, context?: LogContext, error?: Error) => logger.warn(message, context, error);
export const logError = (message: string, context?: LogContext, error?: Error) => logger.error(message, context, error);
export const logDebug = (message: string, context?: LogContext) => logger.debug(message, context);
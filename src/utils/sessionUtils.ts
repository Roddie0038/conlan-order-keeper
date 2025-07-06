// Session validation utilities with enhanced retry logic
import { Session } from '@supabase/supabase-js';

export interface RetryConfig {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffMultiplier?: number;
}

export const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 8000,
  backoffMultiplier: 2
};

/**
 * Validates session readiness with comprehensive checks
 */
export const validateSessionReadiness = async (session: Session | null, user: any): Promise<boolean> => {
  if (!session?.user) {
    console.log('[SessionUtils] No session or user available');
    return false;
  }

  if (!session.access_token) {
    console.log('[SessionUtils] No access token available');
    return false;
  }

  if (!user?.email) {
    console.log('[SessionUtils] User email not available');
    return false;
  }

  // Check if user is Super Admin (roderickdemarais@aol.com)
  const isSuperAdmin = user.email.toLowerCase() === 'roderickdemarais@aol.com';
  
  if (!isSuperAdmin) {
    console.log('[SessionUtils] User is not Super Admin, access denied');
    return false;
  }

  console.log('[SessionUtils] Session validation passed for Super Admin');
  return true;
};

/**
 * Enhanced session validation with progressive delays
 */
export const waitForSessionReadiness = async (
  session: Session | null, 
  user: any, 
  maxWaitTime = 5000
): Promise<boolean> => {
  const startTime = Date.now();
  let attempt = 0;
  
  while (Date.now() - startTime < maxWaitTime) {
    if (await validateSessionReadiness(session, user)) {
      console.log(`[SessionUtils] Session ready after ${attempt} attempts`);
      return true;
    }
    
    attempt++;
    const delay = Math.min(500 * attempt, 2000); // Progressive delay: 500ms, 1s, 1.5s, 2s max
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  console.warn('[SessionUtils] Session readiness timeout reached');
  return false;
};

/**
 * Exponential backoff retry logic for Supabase queries
 */
export const withRetry = async <T>(
  operation: () => Promise<T>,
  config: RetryConfig = defaultRetryConfig,
  operationName = 'Unknown Operation'
): Promise<T> => {
  const { maxRetries, baseDelay, maxDelay, backoffMultiplier } = {
    ...defaultRetryConfig,
    ...config
  };

  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries!; attempt++) {
    try {
      console.log(`[RetryUtils] ${operationName} - Attempt ${attempt + 1}/${maxRetries! + 1}`);
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Don't retry for certain errors
      if (error?.code === 'PGRST301' || error?.code === '42501' || attempt === maxRetries) {
        console.error(`[RetryUtils] ${operationName} - Final failure:`, error);
        throw error;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay! * Math.pow(backoffMultiplier!, attempt),
        maxDelay!
      );
      
      console.warn(`[RetryUtils] ${operationName} - Attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error.message);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};

/**
 * Enhanced error logging with stack traces
 */
export const logError = (context: string, error: any, metadata?: any) => {
  const errorInfo = {
    context,
    message: error?.message || 'Unknown error',
    code: error?.code || 'NO_CODE',
    stack: error?.stack || 'No stack trace',
    timestamp: new Date().toISOString(),
    metadata
  };
  
  console.error(`[ErrorLogger] ${context}:`, errorInfo);
  
  // In production, you might want to send this to a monitoring service
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'exception', {
      description: `${context}: ${error?.message}`,
      fatal: false
    });
  }
  
  return errorInfo;
};
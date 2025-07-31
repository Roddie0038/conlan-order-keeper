/**
 * Phase 3: Simplified Email Utility
 * Replaces dynamicEmailService with minimal required functions
 */

import { logger } from '@/utils/logger';

/**
 * Get first manager email - simplified version for form defaults
 * Returns a placeholder email since all actual email routing goes through NotificationController
 */
export async function getFirstManagerEmail(store: string): Promise<string> {
  logger.debug('Getting first manager email for form default', { store, service: 'email_utility' });
  
  // Return default placeholder - actual recipient resolution handled by NotificationController
  return 'manager@conlantire.com';
}

/**
 * Get manager email string for backward compatibility
 * Returns placeholder since NotificationController handles actual routing
 */
export async function getManagerEmail(store: string): Promise<string> {
  logger.debug('Getting manager email for backward compatibility', { store, service: 'email_utility' });
  
  // Return default placeholder - actual recipient resolution handled by NotificationController
  return 'manager@conlantire.com';
}
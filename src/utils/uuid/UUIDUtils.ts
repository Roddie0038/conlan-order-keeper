/**
 * Phase 4: UUID Utilities
 * Centralized UUID generation across the platform
 */

import { logger } from '@/utils/logger';

/**
 * Generate a UUID v4
 */
export function generateUUID(): string {
  try {
    // Use crypto.randomUUID if available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      const uuid = crypto.randomUUID();
      logger.debug('UUID generated using crypto.randomUUID', {
        service: 'UUIDUtils',
        uuidLength: uuid.length
      });
      return uuid;
    }
    
    // Fallback to manual generation
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    
    logger.debug('UUID generated using fallback method', {
      service: 'UUIDUtils',
      uuidLength: uuid.length
    });
    
    return uuid;
  } catch (error) {
    logger.error('Failed to generate UUID', {
      service: 'UUIDUtils',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    
    // Emergency fallback
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Generate a short ID (8 characters)
 */
export function generateShortId(): string {
  try {
    const shortId = Math.random().toString(36).substr(2, 8);
    logger.debug('Short ID generated', {
      service: 'UUIDUtils',
      shortIdLength: shortId.length
    });
    return shortId;
  } catch (error) {
    logger.error('Failed to generate short ID', {
      service: 'UUIDUtils',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return Date.now().toString(36).substr(-8);
  }
}
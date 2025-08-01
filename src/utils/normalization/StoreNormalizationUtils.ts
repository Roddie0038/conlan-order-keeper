/**
 * Phase 4: Store Normalization Utilities
 * Centralized store data normalization across the platform
 */

import { logger } from '@/utils/logger';

export interface NormalizedStoreInfo {
  storeNumber: string;
  storeName: string;
  plant: string;
}

/**
 * Extract store number from various formats
 * Handles: "22", "Fort Worth 22", "Store 22", etc.
 */
export function extractStoreNumber(store: string): string {
  if (!store) {
    logger.warn('Empty store value provided for normalization', {
      service: 'StoreNormalizationUtils'
    });
    return '';
  }

  // Handle pure number format like "22"
  if (/^\d+$/.test(store.trim())) {
    return store.trim();
  }

  // Extract number from formats like "Fort Worth 22" or "Store 22"
  const match = store.match(/\d+$/);
  const storeNumber = match ? match[0] : '';
  
  logger.debug('Store number extracted', {
    service: 'StoreNormalizationUtils',
    original: store,
    extracted: storeNumber
  });

  return storeNumber;
}

/**
 * Normalize store format for consistent processing
 */
export function normalizeStoreFormat(store: string): string {
  if (!store) {
    return '';
  }

  const normalized = store.trim();
  
  logger.debug('Store format normalized', {
    service: 'StoreNormalizationUtils',
    original: store,
    normalized
  });

  return normalized;
}

/**
 * Validate store format
 */
export function validateStoreFormat(store: string): { isValid: boolean; error?: string } {
  if (!store || store.trim().length === 0) {
    return {
      isValid: false,
      error: 'Store is required'
    };
  }

  const storeNumber = extractStoreNumber(store);
  if (!storeNumber) {
    return {
      isValid: false,
      error: 'Invalid store format - must contain a store number'
    };
  }

  logger.debug('Store format validated', {
    service: 'StoreNormalizationUtils',
    store,
    isValid: true
  });

  return { isValid: true };
}

/**
 * Get store display name from store data
 */
export function getStoreDisplayName(store: string): string {
  if (!store) {
    return '';
  }

  // If it's just a number, format it nicely
  if (/^\d+$/.test(store.trim())) {
    return `Store ${store.trim()}`;
  }

  // Otherwise return as-is
  return store;
}

/**
 * Debug utility to log store normalization process
 */
export function debugStoreNormalization(originalStore: string, context: string = 'unknown'): void {
  const storeNumber = extractStoreNumber(originalStore);
  const normalized = normalizeStoreFormat(originalStore);
  const displayName = getStoreDisplayName(originalStore);
  
  console.log(`🔍 STORE NORMALIZATION DEBUG [${context}]:`, {
    original: originalStore,
    extractedNumber: storeNumber,
    normalized,
    displayName,
    context
  });
}

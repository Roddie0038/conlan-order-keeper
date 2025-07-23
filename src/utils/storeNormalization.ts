
/**
 * Store normalization utility to ensure consistent store format handling
 * across different systems (Google Sheets vs Supabase)
 */

import { storeSanitizeForSupabase } from './storeSanitization';

/**
 * Store name mapping for display format
 */
const STORE_NAME_MAP: Record<string, string> = {
  "22": "Fort Worth 022",
  "27": "Grand Prairie 27",
  "28": "Houston 28",
  "29": "San Antonio 29",
  "30": "OKC 30",
  "32": "Little Rock 32",
  "33": "Kansas 33",
  "35": "Laredo 35",
  "36": "Tulsa 36",
  "39": "Austin 39",
};

/**
 * Normalize store value to proper display format for Google Sheets
 * @param storeValue - Raw store value from forms or user input
 * @returns Normalized store value in proper display format
 */
export function normalizeStoreForSubmission(storeValue: string): string {
  if (!storeValue) return storeValue;
  
  // Trim whitespace
  const trimmed = storeValue.trim();
  
  // Extract store number from various formats:
  // "Fort Worth 022" → "22"
  // "Grand Prairie 027" → "27" 
  // "27" → "27"
  // "Store 25" → "25"
  const storeNumber = trimmed.match(/\d+/)?.[0];
  
  if (storeNumber) {
    // Check if we have a mapping for this store number
    const mappedName = STORE_NAME_MAP[storeNumber];
    if (mappedName) {
      return mappedName;
    }
    
    // Fallback: pad to 2 digits and return in "Store XX" format
    const paddedNumber = storeNumber.padStart(2, '0');
    return `Store ${paddedNumber}`;
  }
  
  // If no number found, return original (fallback)
  return trimmed;
}

/**
 * Extract store number from normalized store format
 * @param normalizedStore - Store in display format
 * @returns Store number as string (e.g., "25")
 */
export function extractStoreNumber(normalizedStore: string): string {
  const match = normalizedStore.match(/\d+/);
  return match ? match[0] : '';
}

/**
 * Normalize all store-related fields in an order object
 * This applies different normalization based on the destination system
 * @param orderData - Order data object with potential store fields
 * @param forSupabase - Whether to normalize for Supabase (raw number) or display (Store XX)
 * @returns Order data with normalized store fields
 */
export function normalizeOrderStoreFields<T extends Record<string, any>>(
  orderData: T, 
  forSupabase: boolean = false
): T {
  const normalized = { ...orderData };
  
  const normalizeField = (value: string) => {
    if (!value) return value;
    
    if (forSupabase) {
      // For Supabase: Convert to raw number format
      const displayFormat = normalizeStoreForSubmission(value);
      return storeSanitizeForSupabase(displayFormat);
    } else {
      // For display: Convert to proper display format
      return normalizeStoreForSubmission(value);
    }
  };
  
  // Normalize store field
  if ('store' in normalized && normalized.store) {
    (normalized as any).store = normalizeField(normalized.store);
  }
  
  // Normalize store_number field
  if ('store_number' in normalized && normalized.store_number) {
    (normalized as any).store_number = normalizeField(normalized.store_number);
  }
  
  // Normalize storeName field (used in some forms)
  if ('storeName' in normalized && normalized.storeName) {
    (normalized as any).storeName = normalizeField(normalized.storeName);
  }
  
  // Normalize cross_dock_destination field
  if ('cross_dock_destination' in normalized && normalized.cross_dock_destination) {
    (normalized as any).cross_dock_destination = normalizeField(normalized.cross_dock_destination);
  }
  
  // Normalize crossDockDestination field (camelCase)
  if ('crossDockDestination' in normalized && normalized.crossDockDestination) {
    (normalized as any).crossDockDestination = normalizeField(normalized.crossDockDestination);
  }
  
  return normalized;
}

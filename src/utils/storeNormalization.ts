
/**
 * Store normalization utility to ensure consistent store format handling
 * across different systems (Google Sheets vs Supabase)
 */

import { storeSanitizeForSupabase } from './storeSanitization';

/**
 * Store name mapping for display format - Updated to 3-digit format
 */
const STORE_NAME_MAP: Record<string, string> = {
  "22": "Fort Worth 022",
  "27": "Grand Prairie 027",
  "28": "Houston 028",
  "29": "San Antonio 029",
  "30": "Oklahoma City 030",
  "32": "Little Rock 032",
  "33": "Kansas City 033",
  "35": "Laredo 035",
  "36": "Tulsa 036",
  "39": "Austin 039",
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
    // Normalize to unpadded format for STORE_NAME_MAP lookup
    const unpadded = parseInt(storeNumber).toString();
    
    // Check if we have a mapping for this store number (try both padded and unpadded)
    const mappedName = STORE_NAME_MAP[storeNumber] || STORE_NAME_MAP[unpadded];
    if (mappedName) {
      return mappedName;
    }
    
    // Fallback: pad to 3 digits and return in "Store XXX" format
    const paddedNumber = storeNumber.padStart(3, '0');
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

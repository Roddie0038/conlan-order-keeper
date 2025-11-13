/**
 * Store Helper Utilities
 * DEPRECATED - Use OT Platform hooks for real data
 * This is a minimal compatibility layer
 */

/**
 * Extract 3-digit store code from store name
 * Examples: "Fort Worth 022" -> "022", "Austin 039" -> "039"
 */
export function extractStoreCode(storeName: string): string | null {
  if (!storeName) return null;
  
  // Match 2-3 digits at the end, pad to 3 digits
  const match = storeName.match(/\d{2,3}$/);
  if (match) {
    return match[0].padStart(3, '0');
  }
  
  return null;
}

/**
 * Get plant for store - DEPRECATED
 * Use OTStore.plant from useOTStores() instead
 */
export function getPlantForStore(storeName: string): string {
  const storeCode = extractStoreCode(storeName);
  if (!storeCode) return "";
  
  const code = parseInt(storeCode);
  
  // Basic plant mapping - should come from OT Platform
  if (code >= 1 && code <= 21) return "Mulberry 099";
  if (code >= 22 && code <= 39) return "Grand Prairie 097";
  if (code >= 40 && code <= 60) return "Romulus 098";
  
  return "Grand Prairie 097"; // Default
}

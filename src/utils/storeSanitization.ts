
/**
 * Store sanitization utilities for Supabase database format
 */

/**
 * Sanitize store value for Supabase database storage
 * Converts "Store 27" → "27" (raw number format expected by database)
 * @param storeValue - Store value in display format ("Store 27")
 * @returns Raw store number for database storage ("27")
 */
export function storeSanitizeForSupabase(storeValue: string): string {
  if (!storeValue) return storeValue;
  
  const trimmed = storeValue.trim();
  
  // Extract number from "Store XX" format
  const match = trimmed.match(/^Store\s+(\d+)$/);
  if (match) {
    return match[1]; // Return raw number (e.g., "27")
  }
  
  // If already in raw number format, return as-is
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }
  
  // Fallback: try to extract any number
  const numberMatch = trimmed.match(/(\d+)/);
  return numberMatch ? numberMatch[1] : trimmed;
}

/**
 * Convert store number to padded format for email recipient lookup
 * Handles both 2-digit and 3-digit padding
 * @param storeNumber - Raw store number ("27")
 * @returns Array of possible formats ["27", "027"]
 */
export function getStoreNumberVariants(storeNumber: string): string[] {
  if (!storeNumber) return [];
  
  const cleaned = storeNumber.replace(/\D/g, ''); // Remove non-digits
  if (!cleaned) return [];
  
  const variants = [cleaned]; // Original format
  
  // Add zero-padded variants
  if (cleaned.length === 1) {
    variants.push(`0${cleaned}`);    // "7" → "07"
    variants.push(`00${cleaned}`);   // "7" → "007"
  } else if (cleaned.length === 2) {
    variants.push(`0${cleaned}`);    // "27" → "027"
  }
  
  return [...new Set(variants)]; // Remove duplicates
}

/**
 * Log store format transformations for debugging
 */
export function logStoreFormatTransformation(
  operation: string,
  original: string,
  transformed: string,
  context: string
): void {
  console.log(`🔄 STORE FORMAT [${operation}]:`, {
    operation,
    original,
    transformed,
    context,
    timestamp: new Date().toISOString()
  });
}

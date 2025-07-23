
/**
 * Store sanitization utilities for Supabase database format
 */

/**
 * Sanitize store value for Supabase database storage
 * Converts display format to raw number format expected by database
 * @param storeValue - Store value in display format ("Fort Worth 022")
 * @returns Raw store number for database storage ("22")
 */
export function storeSanitizeForSupabase(storeValue: string): string {
  if (!storeValue) return storeValue;
  
  const trimmed = storeValue.trim();
  
  // Handle Fort Worth 022 specifically
  if (trimmed === "Fort Worth 022") {
    return "22";
  }
  
  // Extract number from any format
  const match = trimmed.match(/(\d+)/);
  if (match) {
    return match[1]; // Return raw number (e.g., "22")
  }
  
  // If already in raw number format, return as-is
  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }
  
  // Fallback: return original
  return trimmed;
}

/**
 * Convert store number to padded format for email recipient lookup
 * Handles both 2-digit and 3-digit padding
 * @param storeNumber - Raw store number ("22")
 * @returns Array of possible formats ["22", "022"]
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
    variants.push(`0${cleaned}`);    // "22" → "022"
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

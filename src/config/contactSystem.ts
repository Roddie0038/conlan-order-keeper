// Contact system for email routing across all stores and plants
// @deprecated All email routing now handled by store_email_recipients table and dynamicEmailService.ts
// This file is preserved only for plant/region mappings that don't involve emails

export interface Contact {
  name: string;
  email: string;
  role: 'store_manager' | 'warehouse_manager' | 'retread_manager' | 'warehouse_coordinator' | 'plant_manager';
  region?: string;
  plant?: string;
  store?: string;
}

// @deprecated Store Manager mappings replaced by store_email_recipients table
// Use getOrderingEmailRecipients(storeNumber, emailType) from @/services/dynamicEmailService instead
export const STORE_MANAGERS: Record<string, Contact> = {};

// @deprecated Plant personnel mappings replaced by store_email_recipients table
// Use getOrderingEmailRecipients(storeNumber, emailType) from @/services/dynamicEmailService instead
export const PLANT_PERSONNEL: Record<string, Contact[]> = {};

// Store to Plant mapping (updated to include Grand Prairie stores)
export const STORE_TO_PLANT_MAP: Record<string, string> = {
  // Grand Prairie stores -> Grand Prairie 097
  "22": "Grand Prairie 097", // Fort Worth
  "27": "Grand Prairie 097", // Grand Prairie
  "28": "Grand Prairie 097", // Houston
  "29": "Grand Prairie 097", // San Antonio
  "30": "Grand Prairie 097", // OKC
  "32": "Grand Prairie 097", // Little Rock
  "33": "Grand Prairie 097", // Kansas
  "35": "Grand Prairie 097", // Laredo
  "36": "Grand Prairie 097", // Tulsa
  "39": "Grand Prairie 097", // Austin
  
  // South FL stores -> Mulberry 099
  "003": "Mulberry 099", // Miami
  "007": "Mulberry 099", // Pompano Beach
  "009": "Mulberry 099", // Fort Myers
  
  // North FL stores -> Mulberry 099  
  "002": "Mulberry 099", // Jacksonville
  "005": "Mulberry 099", // Ocala
  "015": "Mulberry 099", // Tallahassee
  
  // Central FL stores -> Mulberry 099
  "001": "Mulberry 099", // Mulberry Service
  "004": "Mulberry 099", // Orlando
  "006": "Mulberry 099", // Tampa
  "023": "Mulberry 099", // Sarasota
  "040": "Mulberry 099", // Tampa Foam Fill
};

// Store to Region mapping (updated to include Grand Prairie stores)
export const STORE_TO_REGION_MAP: Record<string, string> = {
  // Grand Prairie region stores
  "22": "Texas", // Fort Worth
  "27": "Texas", // Grand Prairie
  "28": "Texas", // Houston
  "29": "Texas", // San Antonio
  "30": "Oklahoma", // OKC
  "32": "Arkansas", // Little Rock
  "33": "Kansas", // Kansas
  "35": "Texas", // Laredo
  "36": "Oklahoma", // Tulsa
  "39": "Texas", // Austin
  
  // Florida stores
  "003": "South FL", // Miami
  "007": "South FL", // Pompano Beach  
  "009": "South FL", // Fort Myers
  "002": "North FL", // Jacksonville
  "005": "North FL", // Ocala
  "015": "North FL", // Tallahassee
  "001": "Central FL", // Mulberry Service
  "004": "Central FL", // Orlando
  "006": "Central FL", // Tampa
  "023": "Central FL", // Sarasota
  "040": "Central FL", // Tampa Foam Fill
};

/**
 * Get store manager email for a store number
 * @deprecated Use getOrderingEmailRecipients(storeNumber, emailType) from @/services/dynamicEmailService instead
 */
export function getStoreManagerEmail(storeNumber: string): string {
  console.warn('⚠️ DEPRECATED: getStoreManagerEmail() is deprecated. Use getOrderingEmailRecipients() from dynamicEmailService instead');
  return "";
}

/**
 * Get plant for a store number
 */
export function getPlantForStoreNumber(storeNumber: string): string {
  return STORE_TO_PLANT_MAP[storeNumber] || "";
}

/**
 * Get region for a store number  
 */
export function getRegionForStoreNumber(storeNumber: string): string {
  return STORE_TO_REGION_MAP[storeNumber] || "";
}

/**
 * Get personnel by plant and role
 * @deprecated Use getOrderingEmailRecipients(storeNumber, emailType) from @/services/dynamicEmailService instead
 */
export function getPlantPersonnel(plant: string, role: Contact['role']): Contact[] {
  console.warn('⚠️ DEPRECATED: getPlantPersonnel() is deprecated. Use getOrderingEmailRecipients() from dynamicEmailService instead');
  return [];
}

/**
 * Get all email recipients for warranty submissions
 * @deprecated Use getOrderingEmailRecipients(storeNumber, 'warranty') from @/services/orderingEmailService instead
 */
export function getWarrantyEmailRecipients(storeNumber: string): string[] {
  console.warn('⚠️ DEPRECATED: getWarrantyEmailRecipients() is deprecated. Use getOrderingEmailRecipients() from orderingEmailService instead');
  return [];
}

/**
 * Get all email recipients for MTO orders
 * @deprecated Use getOrderingEmailRecipients(storeNumber, 'mto') from @/services/orderingEmailService instead
 */
export function getMTOEmailRecipients(storeNumber: string): string[] {
  console.warn('⚠️ DEPRECATED: getMTOEmailRecipients() is deprecated. Use getOrderingEmailRecipients() from orderingEmailService instead');
  return [];
}

/**
 * Get all email recipients for Transfer Requests  
 * @deprecated Use getOrderingEmailRecipients(storeNumber, 'transfer') from @/services/orderingEmailService instead
 */
export function getTransferEmailRecipients(storeNumber: string): string[] {
  console.warn('⚠️ DEPRECATED: getTransferEmailRecipients() is deprecated. Use getOrderingEmailRecipients() from orderingEmailService instead');
  return [];
}

/**
 * Get all email recipients for Refurbished Orders (Wheel orders)
 * @deprecated Use getOrderingEmailRecipients(storeNumber, 'wheel') from @/services/orderingEmailService instead
 */
export function getRefurbishedEmailRecipients(storeNumber: string): string[] {
  console.warn('⚠️ DEPRECATED: getRefurbishedEmailRecipients() is deprecated. Use getOrderingEmailRecipients() from orderingEmailService instead');
  return [];
}
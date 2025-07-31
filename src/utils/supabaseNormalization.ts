/**
 * Supabase Database Normalization Utilities
 * These utilities call the normalize_store_format() and normalize_plant_name() functions
 * directly from the Supabase database to ensure consistency across all platforms
 */

import { supabase } from "@/integrations/supabase/client";
import { StoreNormalizationResult, PlantNormalizationResult } from "@/types/orders";

/**
 * Normalize store format using Supabase database function
 * Calls normalize_store_format() directly from the database
 * @param storeValue - Raw store value from forms or user input
 * @returns Normalized store value using database function
 */
export async function normalizeStoreFormat(storeValue: string): Promise<string> {
  if (!storeValue) return storeValue;
  
  try {
    const { data, error } = await supabase.rpc('normalize_store_format', {
      input_store: storeValue
    });
    
    if (error) {
      console.error('Error normalizing store format:', error);
      // Fallback to original value if database function fails
      return storeValue;
    }
    
    return data || storeValue;
  } catch (err) {
    console.error('Failed to call normalize_store_format:', err);
    // Fallback to original value if call fails
    return storeValue;
  }
}

/**
 * Normalize plant name using Supabase database function
 * Calls normalize_plant_name() directly from the database
 * @param plantValue - Raw plant value from forms or user input
 * @returns Normalized plant name using database function
 */
export async function normalizePlantName(plantValue: string): Promise<string> {
  if (!plantValue) return plantValue;
  
  try {
    const { data, error } = await supabase.rpc('normalize_plant_name', {
      input_plant: plantValue
    });
    
    if (error) {
      console.error('Error normalizing plant name:', error);
      // Fallback to original value if database function fails
      return plantValue;
    }
    
    return data || plantValue;
  } catch (err) {
    console.error('Failed to call normalize_plant_name:', err);
    // Fallback to original value if call fails
    return plantValue;
  }
}

/**
 * Comprehensive store normalization with all format variants
 * @param storeValue - Raw store value
 * @returns Complete normalization result with display and DB formats
 */
export async function getStoreNormalizationResult(storeValue: string): Promise<StoreNormalizationResult> {
  const normalizedStore = await normalizeStoreFormat(storeValue);
  
  // Extract store number for variants
  const storeNumber = normalizedStore.match(/\d+/)?.[0] || '';
  const variants: string[] = [];
  
  if (storeNumber) {
    variants.push(storeNumber); // Raw number
    if (storeNumber.length === 1) {
      variants.push(`0${storeNumber}`); // "7" → "07"
      variants.push(`00${storeNumber}`); // "7" → "007"
    } else if (storeNumber.length === 2) {
      variants.push(`0${storeNumber}`); // "22" → "022"
    }
  }
  
  return {
    displayFormat: normalizedStore, // e.g., "Fort Worth 022"
    dbFormat: storeNumber, // e.g., "22"
    variants: [...new Set(variants)] // Remove duplicates
  };
}

/**
 * Comprehensive plant normalization
 * @param plantValue - Raw plant value
 * @returns Complete normalization result
 */
export async function getPlantNormalizationResult(plantValue: string): Promise<PlantNormalizationResult> {
  const normalizedPlant = await normalizePlantName(plantValue);
  
  return {
    displayFormat: normalizedPlant,
    dbFormat: normalizedPlant
  };
}

/**
 * Normalize all store and plant fields in an order object using database functions
 * @param orderData - Order data object with potential store/plant fields
 * @returns Order data with normalized store/plant fields
 */
export async function normalizeOrderFields<T extends Record<string, any>>(orderData: T): Promise<T> {
  const normalized = { ...orderData } as any;
  
  // Normalize store field if present
  if ('store' in normalized && normalized.store) {
    normalized.store = await normalizeStoreFormat(normalized.store);
  }
  
  // Normalize plant field if present
  if ('plant' in normalized && normalized.plant) {
    normalized.plant = await normalizePlantName(normalized.plant);
  }
  
  // Normalize cross_dock_destination field if present
  if ('cross_dock_destination' in normalized && normalized.cross_dock_destination) {
    normalized.cross_dock_destination = await normalizeStoreFormat(normalized.cross_dock_destination);
  }
  
  // Normalize crossDockDestination field (camelCase) if present
  if ('crossDockDestination' in normalized && normalized.crossDockDestination) {
    normalized.crossDockDestination = await normalizeStoreFormat(normalized.crossDockDestination);
  }
  
  // Normalize storeName field (used in some forms) if present
  if ('storeName' in normalized && normalized.storeName) {
    normalized.storeName = await normalizeStoreFormat(normalized.storeName);
  }
  
  // Normalize destinationPlant field if present
  if ('destinationPlant' in normalized && normalized.destinationPlant) {
    normalized.destinationPlant = await normalizePlantName(normalized.destinationPlant);
  }
  
  return normalized as T;
}

/**
 * Transform camelCase form data to snake_case for database insertion
 * This ensures field names match the database schema exactly
 * @param formData - Form data with camelCase field names
 * @returns Data with snake_case field names matching database schema
 */
export function transformToSnakeCase<T extends Record<string, any>>(formData: T): Record<string, any> {
  const transformed: Record<string, any> = {};
  
  // Field name mappings from camelCase to snake_case
  const fieldMappings: Record<string, string> = {
    productNumber: 'product_number',
    scheduleArrival: 'schedule_arrival',
    crossDock: 'cross_dock_type',
    crossDockDestination: 'cross_dock_destination',
    crossDockType: 'cross_dock_type',
    crossDockReceiverNumber: 'cross_dock_receiver_number',
    crossDockEtaDate: 'cross_dock_eta_date',
    destinationManagerEmail: 'destination_manager_email',
    orderType: 'order_type',
    casingGrade: 'casing_grade',
    tireSize: 'tire_size',
    projectedDelivery: 'projected_delivery',
    haveCasings: 'have_casings',
    treadInInventory: 'tread_in_inventory',
    managersEmail: 'destination_manager_email', // Map to proper field
    managerEmail: 'destination_manager_email' // Map to proper field
  };
  
  for (const [key, value] of Object.entries(formData)) {
    if (value !== undefined && value !== null) {
      const dbFieldName = fieldMappings[key] || key;
      transformed[dbFieldName] = value;
    }
  }
  
  return transformed;
}

/**
 * Synchronous fallback store normalization (uses client-side logic)
 * Used when database function calls are not available
 * @param storeValue - Raw store value
 * @returns Normalized store value using client-side logic
 */
export function normalizeStoreFormatSync(storeValue: string): string {
  if (!storeValue) return storeValue;
  
  const trimmed = storeValue.trim().toLowerCase();
  
  // Store name mapping based on OT Platform logic
  const storeMap: Record<string, string> = {
    '22': 'Fort Worth 022',
    '027': 'Grand Prairie 027',
    '27': 'Grand Prairie 027',
    '28': 'Houston 028',
    '29': 'San Antonio 029',
    '30': 'Oklahoma City 030',
    '32': 'Little Rock 032',
    '33': 'Kansas City 033',
    '35': 'Laredo 035',
    '36': 'Tulsa 036',
    '39': 'Austin 039'
  };
  
  // Extract store number
  const storeNumber = trimmed.match(/\d+/)?.[0];
  if (storeNumber) {
    const unpadded = parseInt(storeNumber).toString();
    return storeMap[storeNumber] || storeMap[unpadded] || storeValue;
  }
  
  return storeValue;
}

/**
 * Synchronous fallback plant normalization (uses client-side logic)
 * Used when database function calls are not available
 * @param plantValue - Raw plant value
 * @returns Normalized plant value using client-side logic
 */
export function normalizePlantNameSync(plantValue: string): string {
  if (!plantValue) return 'Grand Prairie 097';
  
  const trimmed = plantValue.trim().toLowerCase();
  
  // Plant name mapping based on OT Platform logic
  if (trimmed.includes('grand prairie') || trimmed.includes('97') || trimmed === 'texas') {
    return 'Grand Prairie 097';
  }
  if (trimmed.includes('mulberry') || trimmed.includes('99') || trimmed === 'florida') {
    return 'Mulberry 099';
  }
  if (trimmed.includes('romulus') || trimmed.includes('98') || trimmed === 'michigan') {
    return 'Romulus 098';
  }
  if (trimmed === 'all plants' || trimmed === 'all') {
    return 'All Plants';
  }
  
  return 'Grand Prairie 097'; // Default fallback
}
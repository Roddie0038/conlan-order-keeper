/**
 * Utility functions for formatting store and plant names for drafts
 */

interface StoreData {
  number?: string;
  city?: string;
  name?: string;
}

interface PlantData {
  number?: string;
  city?: string;
  name?: string;
}

export const formatStoreForDraft = (storeObj: StoreData | string): string => {
  if (typeof storeObj === 'string') {
    return storeObj;
  }
  
  if (storeObj.number && storeObj.city) {
    return `Store ${storeObj.number} – ${storeObj.city}`;
  }
  
  return storeObj.name || storeObj.number || 'Unknown Store';
};

export const formatPlantForDraft = (plantObj: PlantData | string): string => {
  if (typeof plantObj === 'string') {
    return plantObj;
  }
  
  if (plantObj.number && plantObj.city) {
    // Ensure plant number is always 3 digits (097 not 97)
    const paddedNumber = String(plantObj.number).padStart(3, '0');
    return `Plant ${paddedNumber} – ${plantObj.city}`;
  }
  
  return plantObj.name || plantObj.number || 'Unknown Plant';
};

/**
 * Canonical formatter for store names in draft keys
 */
export const formatStore = (number: string | number, city: string): string => {
  return `Store ${String(number).trim()} – ${city}`;
};

/**
 * Canonical formatter for plant names in draft keys
 */
export const formatPlant = (number: string | number, city: string): string => {
  const paddedNumber = String(number).padStart(3, '0');
  return `Plant ${paddedNumber} – ${city}`;
};
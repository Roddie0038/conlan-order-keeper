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
    return `Plant ${plantObj.number} – ${plantObj.city}`;
  }
  
  return plantObj.name || plantObj.number || 'Unknown Plant';
};
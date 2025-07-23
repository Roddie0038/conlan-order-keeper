
// MASTER REFERENCE: Plant to store mapping using correct 3-digit format
export const PLANT_STORE_MAP = {
  // Plant 097 – Grand Prairie (ALL CURRENT STORES)
  "Grand Prairie 097": [
    "Fort Worth 022", "Grand Prairie 027", "Houston 028", "San Antonio 029", 
    "Oklahoma City 030", "Little Rock 032", "Kansas City 033", "Laredo 035", 
    "Tulsa 036", "Austin 039"
  ],
  // Plant 098 – Romulus (Midwest) - Currently not used
  "Romulus 098": [],
  // Plant 099 – Mulberry (Central Florida) - Currently not used  
  "Mulberry 099": []
};

/**
 * Determine which plant should handle an order based on the store
 * @param store - Store in normalized format (e.g., "Fort Worth 022")
 * @returns The plant name with 3-digit code format
 */
export function getPlantForStore(store: string): string {
  // Normalize store name by removing extra spaces
  const normalizedStore = store.trim();

  console.log(`🔍 PLANT MAPPING - Store: "${store}" -> Normalized: "${normalizedStore}"`);
  
  // Check each plant's store list for exact match first
  for (const [plant, stores] of Object.entries(PLANT_STORE_MAP)) {
    if (stores.some(s => normalizedStore === s)) {
      console.log(`✅ PLANT MAPPING - Exact match found: ${plant}`);
      return plant;
    }
  }

  // If no exact match, extract store number and map to Grand Prairie 097
  const storeNumber = normalizedStore.match(/\d+/)?.[0];
  if (storeNumber) {
    const num = parseInt(storeNumber, 10);
    
    console.log(`🔍 PLANT MAPPING - Store number extracted: ${num}`);
    
    // ALL current stores (22, 27-39) map to Grand Prairie 097
    if ([22, 27, 28, 29, 30, 32, 33, 35, 36, 39].includes(num)) {
      console.log(`✅ PLANT MAPPING - Mapped to Grand Prairie 097`);
      return "Grand Prairie 097";
    }
  }

  // Default to Grand Prairie 097 for all stores
  console.log(`✅ PLANT MAPPING - Default mapping to Grand Prairie 097`);
  return "Grand Prairie 097";
}

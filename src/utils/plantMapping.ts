// MASTER REFERENCE: Plant to store mapping using "Store XX" format
export const PLANT_STORE_MAP = {
  // Plant 099 – Mulberry (Central Florida)
  "Mulberry 099": [
    "Store 01", "Store 02", "Store 03", "Store 04", "Store 05", 
    "Store 06", "Store 07", "Store 08", "Store 09", "Store 10", "Store 11"
  ],
  // Plant 098 – Romulus (Midwest)  
  "Romulus 098": [
    "Store 20", "Store 21", "Store 22", "Store 23", "Store 24", 
    "Store 25", "Store 26", "Store 27", "Store 28", "Store 29", 
    "Store 30", "Store 31", "Store 32", "Store 33", "Store 34", 
    "Store 35", "Store 36", "Store 37", "Store 38", "Store 39", 
    "Store 40", "Store 41", "Store 42", "Store 43", "Store 44", 
    "Store 45", "Store 46", "Store 47", "Store 48", "Store 49", "Store 50"
  ],
  // Plant 097 – Grand Prairie (Texas)
  "Grand Prairie 097": [
    "Store 97"
  ]
};

/**
 * Determine which plant should handle an order based on the store
 * @param store - Store in "Store XX" format (e.g., "Store 25")
 * @returns The plant name with 3-digit code format
 */
export function getPlantForStore(store: string): string | undefined {
  // Normalize store name by removing extra spaces
  const normalizedStore = store.trim();

  // Check each plant's store list for exact match first
  for (const [plant, stores] of Object.entries(PLANT_STORE_MAP)) {
    if (stores.some(s => normalizedStore === s)) {
      return plant;
    }
  }

  // If no exact match, extract store number and map to plant
  const storeNumber = normalizedStore.match(/\d+/)?.[0];
  if (storeNumber) {
    const num = parseInt(storeNumber, 10);
    
    console.log(`🔍 PLANT MAPPING - Store: "${store}" -> Number: ${num}`);
    
    // Mulberry 099: stores 01-11
    if (num >= 1 && num <= 11) {
      console.log(`✅ PLANT MAPPING - Mapped to Mulberry 099`);
      return "Mulberry 099";
    }
    
    // Romulus 098: stores 20-50
    if (num >= 20 && num <= 50) {
      console.log(`✅ PLANT MAPPING - Mapped to Romulus 098`);
      return "Romulus 098";
    }
    
    // Grand Prairie 097: store 97
    if (num === 97) {
      console.log(`✅ PLANT MAPPING - Mapped to Grand Prairie 097`);
      return "Grand Prairie 097";
    }
  }

  // Default to Grand Prairie if no match is found
  console.warn(`❌ PLANT MAPPING - No mapping found for store: "${store}", defaulting to Grand Prairie 097`);
  return "Grand Prairie 097";
}
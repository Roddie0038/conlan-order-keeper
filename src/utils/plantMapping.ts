
// MASTER REFERENCE: Plant to store mapping using correct 3-digit format
export const PLANT_STORE_MAP = {
  // Plant 097 – Grand Prairie (Southern Region)
  "Grand Prairie 097": [
    "Fort Worth 022", "Grand Prairie 027", "Houston 028", "San Antonio 029", 
    "Oklahoma City 030", "Little Rock 032", "Kansas City 033", "Laredo 035", 
    "Tulsa 036", "Austin 039"
  ],
  // Plant 098 – Romulus (Midwest Region)
  "Romulus 098": [
    "Toledo 008", "Detroit 011", "Grand Rapids 013", "Cleveland 018", "Chicago 041",
    "Detroit 040", "Indianapolis 042", "Milwaukee 043", "Columbus 044", 
    "Cincinnati 045", "Louisville 046", "Nashville 047"
  ],
  // Plant 099 – Mulberry (Central Florida Region)  
  "Mulberry 099": [
    "Mulberry 001", "Jacksonville 002", "Miami 003", "Orlando 004", "Ocala 005",
    "Tampa 006", "Pompano Beach 007", "Fort Myers 009", "Tallahassee 015",
    "Vero Beach 021", "Sarasota 023",
    "Tampa 050", "Orlando 051", "Jacksonville 052", "Miami 053",
    "Fort Lauderdale 054", "West Palm Beach 055", "Gainesville 056"
  ]
};

/**
 * Normalize plant name to consistent format
 * @param input - Plant name in various formats
 * @returns Normalized plant name with 3-digit code format
 */
export function normalizePlantName(input: string): string {
  if (!input || typeof input !== 'string') return "Grand Prairie 097";
  
  const normalized = input.trim().toLowerCase();
  
  // Grand Prairie 097 variants
  if (normalized.includes('grand prairie') || normalized.includes('097') || normalized === 'gp') {
    return "Grand Prairie 097";
  }
  
  // Romulus 098 variants
  if (normalized.includes('romulus') || normalized.includes('098') || normalized === 'rom') {
    return "Romulus 098";
  }
  
  // Mulberry 099 variants
  if (normalized.includes('mulberry') || normalized.includes('099') || normalized === 'mb') {
    return "Mulberry 099";
  }
  
  // If already in correct format, return as-is
  if (['Grand Prairie 097', 'Romulus 098', 'Mulberry 099'].includes(input)) {
    return input;
  }
  
  // Default fallback
  return "Grand Prairie 097";
}

/**
 * Enhanced store normalization for consistency
 * @param input - Store name in various formats
 * @returns Normalized store name with "City 0XX" format
 */
export function normalizeStoreName(input: string): string {
  if (!input || typeof input !== 'string') return input;
  
  const trimmed = input.trim();
  
  // Extract numeric part
  const match = trimmed.match(/(\d+)/);
  if (!match) return trimmed;
  
  const storeNumber = parseInt(match[1], 10);
  
  // Map store numbers to proper city names with leading zeros
  const storeMap: Record<number, string> = {
    // Mulberry 099 stores
    1: "Mulberry 001",
    2: "Jacksonville 002", 
    3: "Miami 003",
    4: "Orlando 004",
    5: "Ocala 005",
    6: "Tampa 006",
    7: "Pompano Beach 007",
    8: "Toledo 008",
    9: "Fort Myers 009",
    11: "Detroit 011",
    13: "Grand Rapids 013",
    15: "Tallahassee 015",
    18: "Cleveland 018",
    21: "Vero Beach 021",
    22: "Fort Worth 022",
    23: "Sarasota 023",
    27: "Grand Prairie 027", 
    28: "Houston 028",
    29: "San Antonio 029",
    30: "Oklahoma City 030",
    32: "Little Rock 032",
    33: "Kansas City 033",
    35: "Laredo 035",
    36: "Tulsa 036",
    39: "Austin 039",
    40: "Detroit 040",
    41: "Chicago 041",
    42: "Indianapolis 042",
    43: "Milwaukee 043",
    44: "Columbus 044",
    45: "Cincinnati 045",
    46: "Louisville 046",
    47: "Nashville 047",
    50: "Tampa 050",
    51: "Orlando 051",
    52: "Jacksonville 052",
    53: "Miami 053",
    54: "Fort Lauderdale 054",
    55: "West Palm Beach 055",
    56: "Gainesville 056"
  };
  
  return storeMap[storeNumber] || trimmed;
}

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

  // If no exact match, extract store number and map to correct plant
  const storeNumber = normalizedStore.match(/\d+/)?.[0];
  if (storeNumber) {
    const num = parseInt(storeNumber, 10);
    
    console.log(`🔍 PLANT MAPPING - Store number extracted: ${num}`);
    
    // Grand Prairie 097 stores (22, 27-39)
    if ([22, 27, 28, 29, 30, 32, 33, 35, 36, 39].includes(num)) {
      console.log(`✅ PLANT MAPPING - Mapped to Grand Prairie 097`);
      return "Grand Prairie 097";
    }
    
    // Romulus 098 stores (8, 11, 13, 18, 40-47)
    if ([8, 11, 13, 18, 40, 41, 42, 43, 44, 45, 46, 47].includes(num)) {
      console.log(`✅ PLANT MAPPING - Mapped to Romulus 098`);
      return "Romulus 098";
    }
    
    // Mulberry 099 stores (1-7, 9, 15, 21, 23, 50-56)
    if ([1, 2, 3, 4, 5, 6, 7, 9, 15, 21, 23, 50, 51, 52, 53, 54, 55, 56].includes(num)) {
      console.log(`✅ PLANT MAPPING - Mapped to Mulberry 099`);
      return "Mulberry 099";
    }
  }

  // Default to Grand Prairie 097 for unknown stores
  console.log(`✅ PLANT MAPPING - Default mapping to Grand Prairie 097`);
  return "Grand Prairie 097";
}

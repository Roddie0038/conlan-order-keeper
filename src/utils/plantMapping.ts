// MASTER REFERENCE: Plant to store mapping with 3-digit plant codes
export const PLANT_STORE_MAP = {
  "Grand Prairie 097": [
    "Fort Worth 022", "Grand Prairie 027", "Houston 028", "San Antonio 029", 
    "Oklahoma 030", "Little Rock 032", "Kansas 033", "Laredo 035", 
    "Tulsa 036", "Austin 039"
  ],
  "Romulus 098": [
    "Romulus 040", "Detroit 041", "Toledo 042", "Columbus 043", 
    "Flint 044", "South Bend 045"
  ],
  "Mulberry 099": [
    "Fort Myers 001", "Tampa 002", "St. Pete 003", "Sarasota 004", 
    "Lakeland 005", "Fort Pierce 006", "Orlando 007", "Lake Wales 008", 
    "Gainesville 009", "Jacksonville 010", "Ocala 011"
  ]
};

/**
 * Determine which plant should handle an order based on the store
 * @param store - The full store name (e.g., "Fort Worth 022")
 * @returns The plant name with 3-digit code format
 */
export function getPlantForStore(store: string): string | undefined {
  // Normalize store name by removing extra spaces
  const normalizedStore = store.trim();

  // Check each plant's store list for a match
  for (const [plant, stores] of Object.entries(PLANT_STORE_MAP)) {
    if (stores.some(s => normalizedStore === s)) {
      return plant;
    }
  }

  // If no match is found, check for partial matches (store number)
  const storeNumber = normalizedStore.match(/\d+$/)?.[0];
  if (storeNumber) {
    const paddedStoreNumber = storeNumber.padStart(3, '0');
    
    // Mulberry 099: stores 001-011
    if (["001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011"].includes(paddedStoreNumber)) {
      return "Mulberry 099";
    }
    
    // Grand Prairie 097: stores 022, 027-030, 032-033, 035-036, 039
    if (["022", "027", "028", "029", "030", "032", "033", "035", "036", "039"].includes(paddedStoreNumber)) {
      return "Grand Prairie 097";
    }
    
    // Romulus 098: stores 040-045
    if (["040", "041", "042", "043", "044", "045"].includes(paddedStoreNumber)) {
      return "Romulus 098";
    }
  }

  // Default to Grand Prairie if no match is found
  console.warn(`No plant mapping found for store: ${store}, defaulting to Grand Prairie 097`);
  return "Grand Prairie 097";
}
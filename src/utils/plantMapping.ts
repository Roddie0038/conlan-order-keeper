
// MASTER REFERENCE: Plant to store mapping (Store Name Store Number format)
export const PLANT_STORE_MAP = {
  "Grand Prairie 97": [
    "Fort Worth 22", "Grand Prairie Service 27", "Grand Prairie 97", "Houston 28", 
    "San Antonio 29", "Laredo 35", "Austin 39", "Oklahoma City 30", 
    "Little Rock 32", "Kansas City 33", "Tulsa 36"
  ],
  "Romulus 98": [
    "Romulus 98", "Toledo 8", "Detroit 11", "Grand Rapids 13", 
    "Cleveland 18", "Chicago 41"
  ],
  "Mulberry 99": [
    "Miami 3", "Pompano Beach 7", "Fort Myers 9", "Jacksonville 002", 
    "Ocala 5", "Tallahassee 15", "Mulberry Service 1", "Mulberry 99", 
    "New Orleans 4", "Tampa 6", "Vero Beach 21", "Sarasota 23", 
    "Tampa Foam Fill 40"
  ]
};

/**
 * Determine which plant should handle an order based on the store
 * @param store - The full store name (e.g., "Fort Worth 22")
 * @returns The plant name or undefined if no matching plant is found
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
    for (const [plant, stores] of Object.entries(PLANT_STORE_MAP)) {
      if (stores.some(s => s.includes(storeNumber))) {
        return plant;
      }
    }
  }

  // For new Florida stores, map by store number
  if (storeNumber) {
    const floridaStoreNumbers = ["001", "002", "003", "004", "005", "006", "007", "009", "015", "023", "040"];
    if (floridaStoreNumbers.includes(storeNumber.padStart(3, '0'))) {
      return "Mulberry 99";
    }
  }

  // Default to Grand Prairie if no match is found
  console.warn(`No plant mapping found for store: ${store}, defaulting to Grand Prairie 97`);
  return "Grand Prairie 97";
}


/**
 * Extract store number from full store name (e.g., "Fort Worth 22" -> "22")
 */
export const extractStoreNumber = (storeName: string): string => {
  const match = storeName.match(/\b(\d+)\b/);
  return match ? match[1] : '';
};

/**
 * Get store name from store number using existing store data
 */
export const getStoreNameFromNumber = (storeNumber: string): string => {
  // Import store data from existing config
  const stores = [
    { id: "22", name: "Fort Worth 22" },
    { id: "27", name: "Grand Prairie 27" },
    { id: "28", name: "Houston 28" },
    { id: "29", name: "San Antonio 29" },
    { id: "30", name: "OKC 30" },
    { id: "32", name: "Little Rock 32" },
    { id: "33", name: "Kansas 33" },
    { id: "35", name: "Laredo 35" },
    { id: "36", name: "Tulsa 36" },
    { id: "39", name: "Austin 39" },
    { id: "001", name: "Mulberry Service 001" },
    { id: "002", name: "Jacksonville 002" },
    { id: "003", name: "Miami 003" },
    { id: "004", name: "Orlando 004" },
    { id: "005", name: "Ocala 005" },
    { id: "006", name: "Tampa 006" },
    { id: "007", name: "Pompano Beach 007" },
    { id: "009", name: "Fort Myers 009" },
    { id: "015", name: "Tallahassee 015" },
    { id: "023", name: "Sarasota 023" },
    { id: "040", name: "Tampa Foam Fill 040" },
  ];

  const store = stores.find(s => s.id === storeNumber);
  return store ? store.name : `Store ${storeNumber}`;
};

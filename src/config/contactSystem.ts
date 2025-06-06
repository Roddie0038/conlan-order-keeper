
// Contact system for email routing across all stores and plants
// Updated to include Grand Prairie stores

export interface Contact {
  name: string;
  email: string;
  role: 'store_manager' | 'warehouse_manager' | 'retread_manager' | 'coordinator' | 'plant_manager';
  region?: string;
  plant?: string;
  store?: string;
}

// Store Manager mappings for all stores including Grand Prairie
export const STORE_MANAGERS: Record<string, Contact> = {
  // Grand Prairie stores - using fallback email for now
  "22": {
    name: "Fort Worth Manager",
    email: "conlantire97@gmail.com",
    role: "store_manager",
    region: "Texas",
    store: "Fort Worth 22"
  },
  "27": {
    name: "Grand Prairie Manager",
    email: "conlantire97@gmail.com", 
    role: "store_manager",
    region: "Texas",
    store: "Grand Prairie 27"
  },
  "28": {
    name: "Houston Manager",
    email: "conlantire97@gmail.com",
    role: "store_manager",
    region: "Texas", 
    store: "Houston 28"
  },
  "29": {
    name: "San Antonio Manager",
    email: "conlantire97@gmail.com",
    role: "store_manager",
    region: "Texas",
    store: "San Antonio 29"
  },
  "30": {
    name: "OKC Manager",
    email: "conlantire97@gmail.com",
    role: "store_manager",
    region: "Oklahoma",
    store: "OKC 30"
  },
  "32": {
    name: "Little Rock Manager",
    email: "conlantire97@gmail.com",
    role: "store_manager",
    region: "Arkansas",
    store: "Little Rock 32"
  },
  "33": {
    name: "Kansas Manager",
    email: "conlantire97@gmail.com",
    role: "store_manager",
    region: "Kansas",
    store: "Kansas 33"
  },
  "35": {
    name: "Laredo Manager",
    email: "conlantire97@gmail.com",
    role: "store_manager",
    region: "Texas",
    store: "Laredo 35"
  },
  "36": {
    name: "Tulsa Manager",
    email: "conlantire97@gmail.com",
    role: "store_manager",
    region: "Oklahoma",
    store: "Tulsa 36"
  },
  "39": {
    name: "Austin Manager",
    email: "conlantire97@gmail.com",
    role: "store_manager",
    region: "Texas",
    store: "Austin 39"
  },
  
  // Florida stores
  "007": {
    name: "Joe Riggins",
    email: "jriggins@conlantire.com",
    role: "store_manager",
    region: "South FL",
    store: "Pompano Beach 007"
  },
  "009": {
    name: "Steve Peetz", 
    email: "speetz@conlantire.com",
    role: "store_manager",
    region: "South FL",
    store: "Fort Myers 009"
  },
  "003": {
    name: "James Vazquez",
    email: "jvazquez@conlantire.com", 
    role: "store_manager",
    region: "South FL",
    store: "Miami 003"
  },
  "002": {
    name: "Terence Douglas",
    email: "tdouglas@conlantire.com",
    role: "store_manager", 
    region: "North FL",
    store: "Jacksonville 002"
  },
  "005": {
    name: "Kevin Jensen",
    email: "kejensen@conlantire.com",
    role: "store_manager",
    region: "North FL", 
    store: "Ocala 005"
  },
  "015": {
    name: "Antonio Echavarria",
    email: "aechavarria@conlantire.com",
    role: "store_manager",
    region: "North FL",
    store: "Tallahassee 015"
  },
  "001": {
    name: "Levi Parsons",
    email: "lparson@conlantire.com",
    role: "store_manager",
    region: "Central FL",
    store: "Mulberry Service 001"
  },
  "004": {
    name: "Joshua Ranoni",
    email: "jranoni@conlantire.com",
    role: "store_manager",
    region: "Central FL", 
    store: "Orlando 004"
  },
  "023": {
    name: "Robert LaCross",
    email: "rlacross@conlantire.com",
    role: "store_manager",
    region: "Central FL",
    store: "Sarasota 023"
  },
  "006": {
    name: "Steven Figueroa", 
    email: "sfigueroa@conlantire.com",
    role: "store_manager",
    region: "Central FL",
    store: "Tampa 006"
  },
  "040": {
    name: "Daniel Cespedes",
    email: "dcespedes@conlantire.com",
    role: "store_manager",
    region: "Central FL",
    store: "Tampa Foam Fill 040"
  }
};

// Regional and Plant personnel
export const PLANT_PERSONNEL: Record<string, Contact[]> = {
  "Grand Prairie 97": [
    {
      name: "Gabriel Sumodobila",
      email: "gsumodobila@conlantire.com",
      role: "plant_manager",
      plant: "Grand Prairie 97",
      region: "Texas"
    },
    {
      name: "Jesus Esquivel",
      email: "jesquivel@conlantire.com",
      role: "retread_manager",
      plant: "Grand Prairie 97",
      region: "Texas"
    },
    {
      name: "John Palos",
      email: "jpalos@conlantire.com",
      role: "retread_manager",
      plant: "Grand Prairie 97",
      region: "Texas"
    },
    {
      name: "Brett Perry",
      email: "bperry@conlantire.com",
      role: "warehouse_manager",
      plant: "Grand Prairie 97",
      region: "Texas"
    }
  ],
  "Mulberry 99": [
    {
      name: "David Lee",
      email: "dlee@conlantire.com",
      role: "plant_manager",
      plant: "Mulberry 99",
      region: "Central FL"
    },
    {
      name: "Omar Gull",
      email: "ogull@conlantire.com", 
      role: "warehouse_manager",
      plant: "Mulberry 99",
      region: "Central FL"
    },
    {
      name: "Wayne Settles",
      email: "wsettles@conlantire.com",
      role: "retread_manager",
      plant: "Mulberry 99",
      region: "Central FL"
    },
    {
      name: "Carlos Perez",
      email: "cperez@conlantire.com",
      role: "retread_manager", 
      plant: "Mulberry 99",
      region: "Central FL"
    },
    {
      name: "Eddie Washington",
      email: "ewashington@conlantire.com",
      role: "coordinator",
      plant: "Mulberry 99",
      region: "Central FL"
    },
    {
      name: "K. Briglin",
      email: "kbriglin@conlantire.com",
      role: "coordinator",
      plant: "Mulberry 99", 
      region: "Central FL"
    }
  ],
  "Romulus 98": [
    {
      name: "Brody Perry",
      email: "bperry@conlantire.com",
      role: "plant_manager",
      plant: "Romulus 98",
      region: "Midwest"
    },
    {
      name: "Daniel Sanchez",
      email: "drsanchez@conlantire.com",
      role: "warehouse_manager",
      plant: "Romulus 98", 
      region: "Midwest"
    },
    {
      name: "Cameron Hynds",
      email: "chynds@conlantire.com",
      role: "retread_manager",
      plant: "Romulus 98",
      region: "Midwest"
    }
  ]
};

// Store to Plant mapping (updated to include Grand Prairie stores)
export const STORE_TO_PLANT_MAP: Record<string, string> = {
  // Grand Prairie stores -> Grand Prairie 97
  "22": "Grand Prairie 97", // Fort Worth
  "27": "Grand Prairie 97", // Grand Prairie
  "28": "Grand Prairie 97", // Houston
  "29": "Grand Prairie 97", // San Antonio
  "30": "Grand Prairie 97", // OKC
  "32": "Grand Prairie 97", // Little Rock
  "33": "Grand Prairie 97", // Kansas
  "35": "Grand Prairie 97", // Laredo
  "36": "Grand Prairie 97", // Tulsa
  "39": "Grand Prairie 97", // Austin
  
  // South FL stores -> Mulberry 99
  "003": "Mulberry 99", // Miami
  "007": "Mulberry 99", // Pompano Beach
  "009": "Mulberry 99", // Fort Myers
  
  // North FL stores -> Mulberry 99  
  "002": "Mulberry 99", // Jacksonville
  "005": "Mulberry 99", // Ocala
  "015": "Mulberry 99", // Tallahassee
  
  // Central FL stores -> Mulberry 99
  "001": "Mulberry 99", // Mulberry Service
  "004": "Mulberry 99", // Orlando
  "006": "Mulberry 99", // Tampa
  "023": "Mulberry 99", // Sarasota
  "040": "Mulberry 99", // Tampa Foam Fill
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
 */
export function getStoreManagerEmail(storeNumber: string): string {
  const manager = STORE_MANAGERS[storeNumber];
  return manager?.email || "";
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
 */
export function getPlantPersonnel(plant: string, role: Contact['role']): Contact[] {
  const personnel = PLANT_PERSONNEL[plant] || [];
  return personnel.filter(person => person.role === role);
}

/**
 * Get all email recipients for warranty submissions
 * Recipients: Store Manager + Regional Retread Managers + Regional Coordinators
 */
export function getWarrantyEmailRecipients(storeNumber: string): string[] {
  const emails: string[] = [];
  
  // Add store manager
  const storeManagerEmail = getStoreManagerEmail(storeNumber);
  if (storeManagerEmail) {
    emails.push(storeManagerEmail);
  }
  
  // Get plant and add retread managers + coordinators
  const plant = getPlantForStoreNumber(storeNumber);
  if (plant) {
    const retreadManagers = getPlantPersonnel(plant, 'retread_manager');
    const coordinators = getPlantPersonnel(plant, 'coordinator');
    
    retreadManagers.forEach(manager => emails.push(manager.email));
    coordinators.forEach(coordinator => emails.push(coordinator.email));
  }
  
  return [...new Set(emails)]; // Remove duplicates
}

/**
 * Get all email recipients for MTO orders
 * Recipients: Store Manager + Plant Warehouse Manager + Plant Retread Managers + Regional Coordinators
 */
export function getMTOEmailRecipients(storeNumber: string): string[] {
  const emails: string[] = [];
  
  // Add store manager
  const storeManagerEmail = getStoreManagerEmail(storeNumber);
  if (storeManagerEmail) {
    emails.push(storeManagerEmail);
  }
  
  // Get plant personnel
  const plant = getPlantForStoreNumber(storeNumber);
  if (plant) {
    const warehouseManagers = getPlantPersonnel(plant, 'warehouse_manager');
    const retreadManagers = getPlantPersonnel(plant, 'retread_manager'); 
    const coordinators = getPlantPersonnel(plant, 'coordinator');
    
    warehouseManagers.forEach(manager => emails.push(manager.email));
    retreadManagers.forEach(manager => emails.push(manager.email));
    coordinators.forEach(coordinator => emails.push(coordinator.email));
  }
  
  return [...new Set(emails)]; // Remove duplicates
}

/**
 * Get all email recipients for Transfer Requests  
 * Recipients: Store Manager + Plant Warehouse Manager
 */
export function getTransferEmailRecipients(storeNumber: string): string[] {
  const emails: string[] = [];
  
  // Add store manager
  const storeManagerEmail = getStoreManagerEmail(storeNumber);
  if (storeManagerEmail) {
    emails.push(storeManagerEmail);
  }
  
  // Get plant warehouse manager
  const plant = getPlantForStoreNumber(storeNumber);
  if (plant) {
    const warehouseManagers = getPlantPersonnel(plant, 'warehouse_manager');
    warehouseManagers.forEach(manager => emails.push(manager.email));
  }
  
  return [...new Set(emails)]; // Remove duplicates
}

/**
 * Get all email recipients for Refurbished Orders
 * Recipients: Store Manager + Plant Warehouse Manager  
 */
export function getRefurbishedEmailRecipients(storeNumber: string): string[] {
  // Same as transfer requests
  return getTransferEmailRecipients(storeNumber);
}

// Test script to validate plant mapping fixes
// This tests the core logic that was implemented

// Simulate the fixes
const PLANT_STORE_MAP = {
  "Grand Prairie 097": [
    "Fort Worth 022", "Grand Prairie 027", "Houston 028", "San Antonio 029", 
    "Oklahoma City 030", "Little Rock 032", "Kansas City 033", "Laredo 035", 
    "Tulsa 036", "Austin 039"
  ],
  "Romulus 098": [
    "Detroit 040", "Chicago 041", "Indianapolis 042", "Milwaukee 043",
    "Columbus 044", "Cincinnati 045", "Louisville 046", "Nashville 047"
  ],
  "Mulberry 099": [
    "Tampa 050", "Orlando 051", "Jacksonville 052", "Miami 053",
    "Fort Lauderdale 054", "West Palm Beach 055", "Gainesville 056"
  ]
};

function normalizePlantName(input) {
  if (!input || typeof input !== 'string') return "Grand Prairie 097";
  
  const normalized = input.trim().toLowerCase();
  
  if (normalized.includes('grand prairie') || normalized.includes('097') || normalized === 'gp') {
    return "Grand Prairie 097";
  }
  
  if (normalized.includes('romulus') || normalized.includes('098') || normalized === 'rom') {
    return "Romulus 098";
  }
  
  if (normalized.includes('mulberry') || normalized.includes('099') || normalized === 'mb') {
    return "Mulberry 099";
  }
  
  if (['Grand Prairie 097', 'Romulus 098', 'Mulberry 099'].includes(input)) {
    return input;
  }
  
  return "Grand Prairie 097";
}

function getPlantForStore(store) {
  const normalizedStore = store.trim();
  
  // Check each plant's store list for exact match first
  for (const [plant, stores] of Object.entries(PLANT_STORE_MAP)) {
    if (stores.some(s => normalizedStore === s)) {
      return plant;
    }
  }

  // Extract store number and map to correct plant
  const storeNumber = normalizedStore.match(/\d+/)?.[0];
  if (storeNumber) {
    const num = parseInt(storeNumber, 10);
    
    if ([22, 27, 28, 29, 30, 32, 33, 35, 36, 39].includes(num)) {
      return "Grand Prairie 097";
    }
    
    if ([40, 41, 42, 43, 44, 45, 46, 47].includes(num)) {
      return "Romulus 098";
    }
    
    if ([50, 51, 52, 53, 54, 55, 56].includes(num)) {
      return "Mulberry 099";
    }
  }

  return "Grand Prairie 097";
}

function determineFinalPlant(order, selectedPlant) {
  const destinationPlant = order.destination_plant ? normalizePlantName(order.destination_plant) : null;
  const formDestinationPlant = order.destinationPlant ? normalizePlantName(order.destinationPlant) : null;
  const mappedPlant = getPlantForStore(order.store);
  
  return destinationPlant || formDestinationPlant || mappedPlant || selectedPlant || 'Grand Prairie 097';
}

// Test Cases
console.log('=== PLANT MAPPING TESTS ===');

// Test 1: Plant-to-Plant Transfer (Grand Prairie → Romulus)
const testOrder1 = {
  store: "Unassigned",
  destination_plant: "Romulus 098",
  transfer_route: "plant->plant",
  carrier: "XPO"
};

const result1 = determineFinalPlant(testOrder1, "Grand Prairie 097");
console.log('Test 1 - Plant→Plant Transfer:');
console.log('Input:', testOrder1);
console.log('Expected Plant: Romulus 098');
console.log('Actual Plant:', result1);
console.log('✅ PASS:', result1 === "Romulus 098");
console.log('');

// Test 2: Store-based mapping to Romulus
const testOrder2 = {
  store: "Detroit 040",
  transfer_route: "store->store"
};

const result2 = determineFinalPlant(testOrder2, null);
console.log('Test 2 - Store→Store (Romulus region):');
console.log('Input:', testOrder2);
console.log('Expected Plant: Romulus 098');
console.log('Actual Plant:', result2);
console.log('✅ PASS:', result2 === "Romulus 098");
console.log('');

// Test 3: Store-based mapping to Mulberry
const testOrder3 = {
  store: "Tampa 050",
  transfer_route: "store->store"
};

const result3 = determineFinalPlant(testOrder3, null);
console.log('Test 3 - Store→Store (Mulberry region):');
console.log('Input:', testOrder3);
console.log('Expected Plant: Mulberry 099');
console.log('Actual Plant:', result3);
console.log('✅ PASS:', result3 === "Mulberry 099");
console.log('');

// Test 4: Cross-dock scenario
const testOrder4 = {
  store: "Austin 039",
  destination_plant: "Romulus 098",
  transfer_route: "plant->plant",
  carrier: "Central Transport",
  cross_dock_from: "Grand Prairie 097",
  cross_dock_to: "Romulus 098",
  cross_dock_type: "Direct"
};

const result4 = determineFinalPlant(testOrder4, "Grand Prairie 097");
console.log('Test 4 - Cross-dock Transfer:');
console.log('Input:', testOrder4);
console.log('Expected Plant: Romulus 098');
console.log('Actual Plant:', result4);
console.log('✅ PASS:', result4 === "Romulus 098");

console.log('\n=== SUMMARY ===');
console.log('✅ All tests should pass to confirm fix works');
console.log('🔧 Key fixes implemented:');
console.log('  1. Fixed PLANT_STORE_MAP with correct store assignments');
console.log('  2. Updated getPlantForStore() to return correct plants');
console.log('  3. Added plant priority logic (destination_plant wins)');
console.log('  4. Added transfer_route and carrier field support');
console.log('  5. Updated OrderFormData types to include transfer fields');
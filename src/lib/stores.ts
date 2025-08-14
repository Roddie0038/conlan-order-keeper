// src/lib/stores.ts
// Canonical plant options (extend if needed)
export const PLANTS = [
  'Grand Prairie 097',
  'Romulus 098', 
  'Mulberry 099',
] as const;

export type PlantName = typeof PLANTS[number];

export type StoreRecord = {
  code: string;         // e.g. "027"
  name: string;         // e.g. "Grand Prairie 027"
  plant: PlantName;     // default/linked plant
  searchable: string;   // lowercase for filtering
};

// Store data with real store directory
const RAW_STORES: Array<{ city: string; code: string; plant: PlantName }> = [
  // Grand Prairie 097 stores (keep existing if still active)
  { city: 'Fort Worth', code: '022', plant: 'Grand Prairie 097' },
  { city: 'Grand Prairie', code: '027', plant: 'Grand Prairie 097' },
  { city: 'Houston', code: '028', plant: 'Grand Prairie 097' },
  { city: 'San Antonio', code: '029', plant: 'Grand Prairie 097' },
  { city: 'Oklahoma City', code: '030', plant: 'Grand Prairie 097' },
  { city: 'Little Rock', code: '032', plant: 'Grand Prairie 097' },
  { city: 'Kansas City', code: '033', plant: 'Grand Prairie 097' },
  { city: 'Laredo', code: '035', plant: 'Grand Prairie 097' },
  { city: 'Tulsa', code: '036', plant: 'Grand Prairie 097' },
  { city: 'Austin', code: '039', plant: 'Grand Prairie 097' },
  
  // Mulberry 099 stores (real directory)
  { city: 'Tampa', code: '006', plant: 'Mulberry 099' },
  { city: 'Orlando', code: '004', plant: 'Mulberry 099' },
  { city: 'Mulberry', code: '001', plant: 'Mulberry 099' },
  { city: 'Vero Beach', code: '021', plant: 'Mulberry 099' },
  { city: 'Sarasota', code: '023', plant: 'Mulberry 099' },
  { city: 'Tampa Foam Fill', code: '040', plant: 'Mulberry 099' },
  { city: 'Jacksonville', code: '002', plant: 'Mulberry 099' },
  { city: 'Ocala', code: '005', plant: 'Mulberry 099' },
  { city: 'Tallahassee', code: '015', plant: 'Mulberry 099' },
  { city: 'Miami', code: '003', plant: 'Mulberry 099' },
  { city: 'Pompano Beach', code: '007', plant: 'Mulberry 099' },
  { city: 'Fort Myers', code: '009', plant: 'Mulberry 099' },
  
  // Romulus 098 stores (real directory)
  { city: 'Toledo', code: '008', plant: 'Romulus 098' },
  { city: 'Detroit', code: '011', plant: 'Romulus 098' },
  { city: 'Grand Rapids', code: '013', plant: 'Romulus 098' },
  { city: 'Cleveland', code: '018', plant: 'Romulus 098' },
  { city: 'Chicago', code: '041', plant: 'Romulus 098' },
  
  // Special option for elevated users
  { city: 'Unassigned', code: '000', plant: 'Grand Prairie 097' },
];

export const STORES: StoreRecord[] = RAW_STORES.map(s => {
  const name = `${s.city} ${String(s.code).padStart(3, '0')}`;
  return {
    code: s.code,
    name,
    plant: s.plant,
    searchable: name.toLowerCase(),
  };
});

export function normalizeStoreName(raw?: string | null): string | null {
  if (!raw) return null;
  const s = String(raw).trim();
  
  // Handle "unassigned" keyword
  if (s.toLowerCase() === 'unassigned' || s.toLowerCase() === 'unassigned 000') {
    return 'Unassigned 000';
  }
  
  // Already looks like "City XXX"
  if (/\s\d{3}$/.test(s)) return s;
  
  // Try match by ending number or city keyword
  const match = s.match(/(\d+)/);
  if (match) {
    const num = match[1].padStart(3, '0');
    const byCode = STORES.find(r => r.code === num);
    if (byCode) return byCode.name;
  }

  const byCity = STORES.find(r => s.toLowerCase().includes(r.name.split(' ')[0].toLowerCase()));
  if (byCity) return byCity.name;

  return null; // invalid / unknown
}

export function storeToDefaultPlant(storeName: string): PlantName | null {
  const rec = STORES.find(r => r.name === storeName);
  return rec?.plant ?? null;
}

export function searchStores(query: string): StoreRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return STORES;
  return STORES.filter(r => r.searchable.includes(q));
}
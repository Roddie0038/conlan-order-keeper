// src/utils/storeMapping.ts
// Single source of truth for store normalization and plant resolution.

export const STORE_NAME_MAP: Record<string, string> = {
  "022": "Fort Worth 022",
  "027": "Grand Prairie 027",
  "028": "Houston 028",
  "029": "San Antonio 029",
  "030": "Oklahoma City 030",
  "032": "Little Rock 032",
  "033": "Kansas City 033",
  "035": "Laredo 035",
  "036": "Tulsa 036",
  "039": "Austin 039",
  "041": "Detroit 041",
  "042": "Toledo 042",
  "097": "Grand Prairie 097",
  "098": "Romulus 098",
  "099": "Mulberry 099",
};

// For deriving PLANT from STORE. Keep mappings tight and explicit.
const STORE_TO_PLANT: Record<string, string> = {
  "Fort Worth 022": "Grand Prairie 097",
  "Grand Prairie 027": "Grand Prairie 097",
  "Houston 028": "Grand Prairie 097",
  "San Antonio 029": "Grand Prairie 097",
  "Oklahoma City 030": "Grand Prairie 097",
  "Little Rock 032": "Grand Prairie 097",
  "Kansas City 033": "Grand Prairie 097",
  "Laredo 035": "Grand Prairie 097",
  "Tulsa 036": "Grand Prairie 097",
  "Austin 039": "Grand Prairie 097",

  "Detroit 041": "Romulus 098",
  "Toledo 042": "Romulus 098",

  // Add FL stores here as needed → "Mulberry 099"
};

function pad3(n: string | number): string {
  const s = String(n).replace(/\D/g, "");
  return s.padStart(3, "0");
}

/**
 * Normalize input to canonical "City 0XX".
 * Accepts things like "Store 22", "22", "Grand Prairie 27", "027".
 */
export function normalizeStore(input: string | null | undefined): string {
  if (!input) return "";
  const trimmed = String(input).trim();

  // If it's already in "City 0XX" form, keep it.
  if (/^[A-Za-z][A-Za-z\s]+ 0\d{2}$/.test(trimmed)) return trimmed;

  // Try to extract a trailing 2-3 digit store number from common inputs
  const mNum = trimmed.match(/(\d{1,3})$/);
  if (mNum) {
    const code = pad3(mNum[1]);
    const name = STORE_NAME_MAP[code];
    return name ?? "";
  }

  return "";
}

/**
 * Resolve the plant for a normalized store. Returns "" if unknown.
 */
export function getPlantForStore(normalizedStore: string): string {
  if (!normalizedStore) return "";
  return STORE_TO_PLANT[normalizedStore] ?? "";
}

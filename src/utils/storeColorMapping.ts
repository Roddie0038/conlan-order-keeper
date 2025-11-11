// Store color mapping - matches OT platform's source of truth
// Ordering displays this for UX; OT derives it server-side
export const STORE_COLOR_MAP: Record<string, {name: string; hex: string}> = {
  '033': { name: 'Pink',        hex: '#FF69B4' },
  '032': { name: 'Orange',      hex: '#FF7F00' },
  '029': { name: 'Gray',        hex: '#808080' },
  '035': { name: 'Neon Green',  hex: '#39FF14' },
  '030': { name: 'Purple',      hex: '#800080' },
  '036': { name: 'Light Green', hex: '#90EE90' },
  '028': { name: 'Light Blue',  hex: '#ADD8E6' },
  '022': { name: 'Red',         hex: '#FF0000' },
  '027': { name: 'Yellow',      hex: '#FFD400' },
  '039': { name: 'Dark Blue',   hex: '#0033A0' },
};

/**
 * Extract store code and return color name for display
 * @param storeName - Full store name like "Grand Prairie 027" or "027"
 * @returns Color name (e.g., "Yellow") or empty string if not found
 */
export function getStoreColorName(storeName: string): string {
  if (!storeName) return '';
  
  // Extract 3-digit store code from store name
  const match = storeName.match(/\d{3}$/);
  const storeCode = match ? match[0] : storeName.padStart(3, '0');
  
  return STORE_COLOR_MAP[storeCode]?.name || '';
}

/**
 * Get color hex for visual display
 * @param storeName - Full store name like "Grand Prairie 027" or "027"
 * @returns Color hex code or empty string
 */
export function getStoreColorHex(storeName: string): string {
  if (!storeName) return '';
  
  const match = storeName.match(/\d{3}$/);
  const storeCode = match ? match[0] : storeName.padStart(3, '0');
  
  return STORE_COLOR_MAP[storeCode]?.hex || '';
}

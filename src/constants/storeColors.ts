// Centralized store color mapping with hex values
export const STORE_COLOR_MAP: Record<string, string> = {
  "Fort Worth 022": "#ff6b6b",
  "Grand Prairie 027": "#F8FF5C",
  "Houston 028": "#22d3ee",
  "San Antonio 029": "#A6A39D",
  "Oklahoma City 030": "#a855f7",
  "Little Rock 032": "#fb923c",
  "Kansas City 033": "#f472b6",
  "Laredo 035": "#a3e635",
  "Tulsa 036": "#4ade80",
  "Austin 039": "#60a5fa",
  "Detroit 041": "#34F7CC",
  "Toledo 042": "#E3A41B",
  "Indianapolis 043": "#9C1F84",
  "Tampa 051": "#B3C722",
  "Orlando 052": "#C78822",
  "Jacksonville 053": "#A4F268",
  "Grand Prairie 097": "#1BE37F",
  "Romulus 098": "#E31B6B",
  "Mulberry 099": "#2261C7",
  "Unassigned 000": "#D9E319",
  "Admin": "#60a5fa"
};

// Get color for a store by name
export function getStoreColorHex(storeName: string): string | undefined {
  return STORE_COLOR_MAP[storeName];
}
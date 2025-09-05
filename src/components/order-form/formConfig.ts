
import { CrossDockFields } from "@/types/cross-dock.types";

export const stores = [
  { id: "22", name: "Fort Worth 022" },
  { id: "27", name: "Grand Prairie 027" },
  { id: "28", name: "Houston 028" },
  { id: "29", name: "San Antonio 29" },
  { id: "30", name: "Oklahoma City 030" },
  { id: "32", name: "Little Rock 032" },
  { id: "33", name: "Kansas City 033" },
  { id: "35", name: "Laredo 035" },
  { id: "36", name: "Tulsa 036" },
  { id: "39", name: "Austin 039" },
];

// REMOVED: Hardcoded email mappings - now using dynamic platform_users lookup
// export const storeManagerEmails: Record<string, string> = { ... };
// This has been replaced with dynamic database lookups in the user management system

// Store to color mapping with specific colors for each store
export const storeColors: Record<string, string> = {
  "022": "store-color-022",   // Fort Worth 022 - RED
  "027": "store-color-027",   // Grand Prairie 027
  "27": "store-color-027",    // Grand Prairie 027 (unpadded)
  "028": "store-color-028",   // Houston 028 - Light Blue
  "029": "store-color-029",   // San Antonio 029
  "29": "store-color-029",    // San Antonio 029 (unpadded)
  "030": "store-color-030",   // Oklahoma City 030 - Purple
  "30": "store-color-030",    // Oklahoma City 030 (unpadded)
  "032": "store-color-032",   // Little Rock 032 - Orange
  "32": "store-color-032",    // Little Rock 032 (unpadded)
  "033": "store-color-033",   // Kansas City 033 - Pink
  "33": "store-color-033",    // Kansas City 033 (unpadded)
  "035": "store-color-035",   // Laredo 035 - Neon Green
  "35": "store-color-035",    // Laredo 035 (unpadded)
  "036": "store-color-036",   // Tulsa 036 - Light Green
  "36": "store-color-036",    // Tulsa 036 (unpadded)
  "039": "store-color-039",   // Austin 039 - Dark Blue
  "39": "store-color-039",    // Austin 039 (unpadded)
  "041": "store-color-041",   // Detroit 041
  "41": "store-color-041",    // Detroit 041 (unpadded)
  "042": "store-color-042",   // Toledo 042
  "42": "store-color-042",    // Toledo 042 (unpadded)
  "043": "store-color-043",   // Indianapolis 043
  "43": "store-color-043",    // Indianapolis 043 (unpadded)
  "051": "store-color-051",   // Tampa 051
  "51": "store-color-051",    // Tampa 051 (unpadded)
  "052": "store-color-052",   // Orlando 052
  "52": "store-color-052",    // Orlando 052 (unpadded)
  "053": "store-color-053",   // Jacksonville 053
  "53": "store-color-053",    // Jacksonville 053 (unpadded)
  "097": "store-color-097",   // Grand Prairie 097
  "97": "store-color-097",    // Grand Prairie 097 (unpadded)
  "098": "store-color-098",   // Romulus 098
  "98": "store-color-098",    // Romulus 098 (unpadded)
  "099": "store-color-099",   // Mulberry 099
  "99": "store-color-099",    // Mulberry 099 (unpadded)
  "000": "store-color-000",   // Unassigned 000
  "0": "store-color-000",     // Unassigned 000 (unpadded)
  "Admin": "store-color-admin"
};

// REMOVED: getManagerEmail function - now using dynamic platform_users lookup
// This hardcoded function has been replaced with dynamic database queries
// All email routing now happens through the ordering-confirmation-email edge function

// Export the getStoreColor function for wheel orders
export const getStoreColor = (store: string): string => {
  if (store === "Admin") return storeColors["Admin"];
  const match = store.match(/\d+/);
  if (match) {
    const storeNumber = match[0];
    // Handle both padded and unpadded numbers
    return storeColors[storeNumber.padStart(3, '0')] || storeColors[storeNumber] || 'store-color-000';
  }
  return 'store-color-000';
};

export const scheduleOptions = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Will Call Pick Up",
].map(value => ({ value }));

export const crossDockOptions = [
  { value: "Yes", name: "Yes" },
  { value: "No", name: "No" },
];

export type FormData = {
  yourName: string;
  store: string;
  dateReceived: string;
  productNumber: string;
  description: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
  // Remove duplicate fields that are defined in CrossDockFields
  managersEmail?: string;
} & CrossDockFields; // Extend FormData with CrossDockFields

export const initialFormData: FormData = {
  yourName: "",
  store: "",
  dateReceived: "",
  productNumber: "",
  description: "",
  quantity: "",
  scheduleArrival: "",
  notes: "",
  crossDock: "No", // Default to "No"
  crossDockDestination: "",
  receiverNo: "",
  etaDate: "",
  crossDockConfirmation: false,
  managersEmail: "",
};

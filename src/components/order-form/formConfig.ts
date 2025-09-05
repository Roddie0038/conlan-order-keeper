
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
  "022": "text-red-400",      // Fort Worth 022 - RED
  "27": "text-yellow-300",    // Grand Prairie 027 - Yellow
  "028": "text-cyan-300",     // Houston 028 - Light Blue
  "29": "text-gray-400",      // San Antonio 29 - Gray
  "030": "text-purple-400",   // Oklahoma City 030 - Purple
  "032": "text-orange-400",   // Little Rock 032 - Orange
  "033": "text-pink-400",     // Kansas City 033 - Pink
  "035": "text-lime-400",     // Laredo 035 - Neon Green
  "036": "text-green-300",    // Tulsa 036 - Light Green
  "039": "text-blue-400",     // Austin 039 - Dark Blue
  "Admin": "text-blue-400"
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
    return storeColors[storeNumber.padStart(3, '0')] || storeColors[storeNumber] || 'text-yellow-300';
  }
  return 'text-yellow-300';
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

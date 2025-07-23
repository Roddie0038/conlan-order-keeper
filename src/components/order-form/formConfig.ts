
import { CrossDockFields } from "@/types/cross-dock.types";

export const stores = [
  { id: "22", name: "Fort Worth 022" },
  { id: "27", name: "Grand Prairie 027" },
  { id: "28", name: "Houston 028" },
  { id: "29", name: "San Antonio 029" },
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

// Store to color mapping for wheel orders
export const storeColors: Record<string, string> = {
  "22": "Yellow",
  "27": "Yellow", 
  "28": "Yellow",
  "29": "Yellow",
  "30": "Yellow",
  "32": "Yellow",
  "33": "Yellow",
  "35": "Yellow",
  "36": "Yellow",
  "39": "Yellow",
  "Admin": "Yellow"
};

// REMOVED: getManagerEmail function - now using dynamic platform_users lookup
// This hardcoded function has been replaced with dynamic database queries
// All email routing now happens through the ordering-confirmation-email edge function

// Export the getStoreColor function for wheel orders
export const getStoreColor = (store: string): string => {
  if (store === "Admin") return storeColors["Admin"];
  const match = store.match(/\d+$/);
  const storeNumber = match ? match[0] : '';
  return storeColors[storeNumber] || 'Yellow';
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

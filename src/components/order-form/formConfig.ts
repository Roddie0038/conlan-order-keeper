// src/components/order-form/formConfig.ts
// DEPRECATED - Stores should come from OT Platform via useOTStores()
// Colors should come from OT Platform via useOTStoreColors()

import { CrossDockFields } from "@/types/cross-dock.types";

// DEPRECATED: Use useOTStores() instead
export const stores = [
  { id: "022", name: "Fort Worth 022" },
  { id: "027", name: "Grand Prairie 027" },
  { id: "028", name: "Houston 028" },
  { id: "029", name: "San Antonio 029" },
  { id: "030", name: "OKC 030" },
  { id: "032", name: "Little Rock 032" },
  { id: "033", name: "Kansas 033" },
  { id: "035", name: "Laredo 035" },
  { id: "036", name: "Tulsa 036" },
  { id: "039", name: "Austin 039" },
];

// DEPRECATED: Use useOTStoreColors() instead
export const storeColors: Record<string, string> = {
  "022": "Yellow",
  "027": "Yellow", 
  "028": "Yellow",
  "029": "Yellow",
  "030": "Yellow",
  "032": "Yellow",
  "033": "Yellow",
  "035": "Yellow",
  "036": "Yellow",
  "039": "Yellow",
  "Admin": "Yellow"
};

// DEPRECATED: Use useOTStoreColors() instead
export const getStoreColor = (store: string): string => {
  if (store === "Admin") return storeColors["Admin"];
  const match = store.match(/\d{3}$/);
  if (!match) {
    const match2 = store.match(/\d{2}$/);
    const storeNumber = match2 ? match2[0].padStart(3, '0') : '';
    return storeColors[storeNumber] || 'Yellow';
  }
  return storeColors[match[0]] || 'Yellow';
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

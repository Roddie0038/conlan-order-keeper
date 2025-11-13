// src/components/order-form/formConfig.ts
// Form configuration constants - data now comes from OT Platform

import { CrossDockFields } from "@/types/cross-dock.types";

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

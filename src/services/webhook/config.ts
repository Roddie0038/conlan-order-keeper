
import { PLANT_WEBHOOKS } from '@/contexts/PlantContext';

// Webhook URLs for Google Apps Script
export const WEBHOOK_URLS = {
  // New Orders (Orders Tab)
  ORDERS: "https://script.google.com/macros/s/AKfycbwlFNudZkk0jFFORdU-Tr-Ma-iNytJQ8b4nq3H7IXhsiFov1iGX8uCs2AF0eMrMbrpXcg/exec",
  // Wheel Orders (Stores Wheel Orders Tab)
  WHEEL_ORDERS: "https://script.google.com/macros/s/AKfycbw_PHHn33ELTWnvQHG49VWew18L11EKaF0nHbMFLZvT2C_CNOLs-smLd4aHNxDF7CIEQA/exec",
  // MTO Orders (MTO'S Tab)
  MTO_ORDERS: "https://script.google.com/macros/s/AKfycbySpbQtyGFnhR1pvMq53HwBAUXGI-TS5j7wcaCq0m9zotDyvV-IzGXJJCU3nOrUc5z-wQ/exec"
};

export type Plant = keyof typeof PLANT_WEBHOOKS;

// Define order type union
export type OrderType = "MTO" | "WHEEL_POWDER_COATING" | "TRANSFER";

// Base interface with common properties
export interface BaseOrderData {
  type: OrderType;
  timestamp: string;
  store: string;
  managersEmail?: string;
  managerEmail?: string; // Add both formats to ensure compatibility
  plant: string;
}

export interface OrderData extends BaseOrderData {
  yourName: string;
  dateReceived: string;
  productNumber: string;
  description: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
  crossDock: string;
  crossDockDestination?: string;
}

export interface MTOOrderData extends BaseOrderData {
  name: string;
  productNumber: string;
  casingGrade: string[];  // String array for casing grades
  tireSize: string;
  tireTreadNeeded: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
}

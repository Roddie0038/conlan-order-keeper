
import { PLANT_WEBHOOKS } from '@/contexts/PlantContext';
import { CrossDockFields } from '@/types/cross-dock.types';

// Webhook URLs for Google Apps Script
export const WEBHOOK_URLS = {
  // New Orders (Orders Tab)
  ORDERS: "https://script.google.com/macros/s/AKfycbwlFNudZkk0jFFORdU-Tr-Ma-iNytJQ8b4nq3H7IXhsiFov1iGX8uCs2AF0eMrMbrpXcg/exec",
  // Wheel Orders (Stores Wheel Orders Tab)
  WHEEL_ORDERS: "https://script.google.com/macros/s/AKfycbw_PHHn33ELTWnvQHG49VWew18L11EKaF0nHbMFLZvT2C_CNOLs-smLd4aHNxDF7CIEQA/exec",
  // MTO Orders (MTO'S Tab)
  MTO_ORDERS: "https://script.google.com/macros/s/AKfycbySpbQtyGFnhR1pvMq53HwBAUXGI-TS5j7wcaCq0m9zotDyvV-IzGXJJCU3nOrUc5z-wQ/exec"
};

// Additional webhook endpoints
export const ADDITIONAL_WEBHOOKS = {
  GP97_ORDERS: "https://eot9y6n22fro4la.m.pipedream.net"
};

// Log webhook URLs on initial load for verification
console.log("🔍 CONFIG - Webhook URLs configuration loaded:");
console.log("🔍 CONFIG - ORDERS URL:", WEBHOOK_URLS.ORDERS);
console.log("🔍 CONFIG - WHEEL_ORDERS URL:", WEBHOOK_URLS.WHEEL_ORDERS); 
console.log("🔍 CONFIG - MTO_ORDERS URL:", WEBHOOK_URLS.MTO_ORDERS);
console.log("🔍 CONFIG - Expected WHEEL_ORDERS URL: https://script.google.com/macros/s/AKfycbw_PHHn33ELTWnvQHG49VWew18L11EKaF0nHbMFLZvT2C_CNOLs-smLd4aHNxDF7CIEQA/exec");
console.log("🔍 CONFIG - URLs match?", WEBHOOK_URLS.WHEEL_ORDERS === "https://script.google.com/macros/s/AKfycbw_PHHn33ELTWnvQHG49VWew18L11EKaF0nHbMFLZvT2C_CNOLs-smLd4aHNxDF7CIEQA/exec");

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

export interface OrderData extends BaseOrderData, CrossDockFields {
  yourName: string;
  dateReceived: string;
  productNumber: string;
  description: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
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

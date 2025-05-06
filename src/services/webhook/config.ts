
import { PLANT_WEBHOOKS } from '@/contexts/PlantContext';
import { CrossDockFields } from '@/types/cross-dock.types';

// Webhook URLs for Google Apps Script
export const WEBHOOK_URLS = {
  // Store Transfer Request Orders
  ORDERS: "https://script.google.com/macros/s/AKfycbzKqcxF0lJaplxHS65J_YeOqwE8R528wqmdakeGK07uxAFCMId_44l58zro7DXVRXLUbw/exec",
  // Wheel Orders
  WHEEL_ORDERS: "https://script.google.com/macros/s/AKfycby787MsaPsVc9A-lV9UmFagAsvwSezy7StjoX1Cxm2cb43HTSJnv7OBu7lCrRmLvUrY3w/exec",
  // MTO Orders
  MTO_ORDERS: "https://script.google.com/macros/s/AKfycbwWSU8hJCZkg3m3ASQQOcrhLnBu4mu7pbgdzYy-wk5yx81kBSp8o8xR534BP7iiqBsMVQ/exec"
};

// Log webhook URLs on initial load for verification
console.log("🔍 CONFIG - Webhook URLs configuration loaded:");
console.log("🔍 CONFIG - ORDERS URL:", WEBHOOK_URLS.ORDERS);
console.log("🔍 CONFIG - WHEEL_ORDERS URL:", WEBHOOK_URLS.WHEEL_ORDERS); 
console.log("🔍 CONFIG - MTO_ORDERS URL:", WEBHOOK_URLS.MTO_ORDERS);

// Define plant type
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
  destinationManagerEmail?: string; // Added for cross dock orders
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

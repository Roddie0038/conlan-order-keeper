
import { PLANT_WEBHOOKS } from '@/contexts/PlantContext';
import { CrossDockFields } from '@/types/cross-dock.types';
import type { OrderFormData, MTOFormData } from '@/types/orders';

// Webhook URLs - UPDATED TO USE SUPABASE EDGE FUNCTIONS
export const WEBHOOK_URLS = {
  // Transfer Request Orders - Orders Tab (Transfer New Orders)
  ORDERS: "https://script.google.com/macros/s/AKfycbxQPqBQwA0IIMN3_LH_FgYY1jU5FMP1U0Z8RtMFSAjH_Kz-5IsKa5xNDpVxMfbN2zIA/exec",
  // Wheel Orders - CORRECTED URL for Stores Wheel Orders Tab (CONFIRMED WORKING IN POSTMAN)
  WHEEL_ORDERS: "https://script.google.com/macros/s/AKfycbyHgFTW0pDGhZOHwUjW5zeqWebs6pXH53Ud8FFC-87bMxCNEf406j0Eu8dQvo_zAhJUEQ/exec",
  // MTO Orders - OT Platform Dashboard (Supabase Edge Function)
  MTO_ORDERS: "https://cdbixtaqjppvdkyfbhkz.supabase.co/functions/v1/receive-mto-order",
  // Admin Orders
  ADMIN_ORDERS: "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/"
};

// Log webhook URLs on initial load for verification
console.log("🔍 CONFIG - WEBHOOK ROUTING - URLs configuration loaded:");
console.log("🔍 CONFIG - ORDERS (Transfer) URL:", WEBHOOK_URLS.ORDERS);
console.log("🔍 CONFIG - WHEEL_ORDERS URL (UPDATED):", WEBHOOK_URLS.WHEEL_ORDERS); 
console.log("🔍 CONFIG - MTO_ORDERS URL:", WEBHOOK_URLS.MTO_ORDERS);
console.log("🔍 CONFIG - ADMIN_ORDERS URL:", WEBHOOK_URLS.ADMIN_ORDERS);

// Define plant type
export type Plant = keyof typeof PLANT_WEBHOOKS;

// Define order type union
export type OrderType = "MTO" | "WHEEL_POWDER_COATING" | "TRANSFER" | "ADMIN";

// Base interface with common properties
export interface BaseOrderData {
  type: OrderType;
  timestamp: string;
  store: string;
  managersEmail?: string;
  managerEmail?: string; // Add both formats to ensure compatibility
  plant: string;
  destinationManagerEmail?: string; // Added for cross dock orders
  email?: string; // Added for compatibility with OrderData from supabase-extensions
}

// Use the OrderFormData type from orders for consistency  
export type { OrderFormData as OrderData };

// Use the MTOFormData type from orders for consistency
export type { MTOFormData };

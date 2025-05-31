
import { PLANT_WEBHOOKS } from '@/contexts/PlantContext';
import { CrossDockFields } from '@/types/cross-dock.types';
import type { OrderData as SupabaseOrderData, MTOOrderData as SupabaseMTOOrderData } from '@/types/supabase-extensions';

// Webhook URLs for Google Apps Script - UPDATED GOOGLE SHEETS URLS
export const WEBHOOK_URLS = {
  // Transfer Request Orders - UPDATED URL for Orders Tab
  ORDERS: "https://script.google.com/macros/s/AKfycbxQPqBQwA0IIMN3_LH_FgYY1jU5FMP1U0Z8RtMFSAjH_Kz-5IsKa5xNDpVxMfbN2zIA/exec",
  // Wheel Orders - UPDATED URL for Stores Wheel Orders Tab
  WHEEL_ORDERS: "https://script.google.com/macros/s/AKfycbzzmndIqoWTGGl5tLCdDwcIdAMnzIxpJCAfA-LZeDQleZG15-UbK42eHA6cRkgcr8CG_Q/exec",
  // MTO Orders - UPDATED URL for MTO'S Tab
  MTO_ORDERS: "https://script.google.com/macros/s/AKfycbx9pgfa8FSVcatTgLcDzeeVcB56h2LdAPD4w51Y41uOOuFWgavdgGAFg1LcFGp7AEdtxA/exec",
  // Admin Orders
  ADMIN_ORDERS: "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/"
};

// Log webhook URLs on initial load for verification
console.log("🔍 CONFIG - UPDATED GOOGLE SHEETS Webhook URLs configuration loaded:");
console.log("🔍 CONFIG - ORDERS (Transfer) URL:", WEBHOOK_URLS.ORDERS);
console.log("🔍 CONFIG - WHEEL_ORDERS URL:", WEBHOOK_URLS.WHEEL_ORDERS); 
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

// Use the OrderData type from supabase-extensions to ensure consistency
export type { SupabaseOrderData as OrderData };

// Use the MTOOrderData type from supabase-extensions for consistency
export type { SupabaseMTOOrderData as MTOOrderData };

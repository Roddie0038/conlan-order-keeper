
import { PLANT_WEBHOOKS } from '@/contexts/PlantContext';
import { CrossDockFields } from '@/types/cross-dock.types';
import type { OrderData as SupabaseOrderData, MTOOrderData as SupabaseMTOOrderData } from '@/types/supabase-extensions';

// Webhook URLs for Google Apps Script - UPDATED WITH NEW URLS
export const WEBHOOK_URLS = {
  // Store Transfer Request Orders - UPDATED URL
  ORDERS: "https://script.google.com/macros/s/AKfycbzRiNPeiZMpBX7pT0dlqBTmGge7rtDzzaFMSVQ9xKplXZiaJST7x1fWL1_YxEQhu_JdJA/exec",
  // Wheel Orders - UPDATED URL
  WHEEL_ORDERS: "https://script.google.com/macros/s/AKfycby8tJGqMLTC5co0BbYNUcnrHsOBbwkT0s87yqiH5RYI6DuznND6q9ag5ua1Je5WzPqaqA/exec",
  // MTO Orders - UPDATED URL
  MTO_ORDERS: "https://script.google.com/macros/s/AKfycbzq-5X1dFQf5HK3xYZuWNIEySXRscipdTjjpVwB3mCxOoav4czK3GXdJpsGrCeRfqZulQ/exec",
  // Admin Orders
  ADMIN_ORDERS: "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/"
};

// Log webhook URLs on initial load for verification
console.log("🔍 CONFIG - UPDATED Webhook URLs configuration loaded:");
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

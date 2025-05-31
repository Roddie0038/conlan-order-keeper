
import { PLANT_WEBHOOKS } from '@/contexts/PlantContext';
import { CrossDockFields } from '@/types/cross-dock.types';
import type { OrderData as SupabaseOrderData, MTOOrderData as SupabaseMTOOrderData } from '@/types/supabase-extensions';

// Webhook URLs for Google Apps Script - LATEST DEPLOYMENT URLS
export const WEBHOOK_URLS = {
  // Store Transfer Request Orders - LATEST URL
  ORDERS: "https://script.google.com/macros/s/AKfycbzRiNPeiZMpBX7pT0dlqBTmGge7rtDzzaFMSVQ9xKplXZiaJST7x1fWL1_YxEQhu_JdJA/exec",
  // Wheel Orders - LATEST URL
  WHEEL_ORDERS: "https://script.google.com/macros/s/AKfycbwj_PJIypALIR3EzighgJRngLPqU8vp06tXWwSYUk5NuAtlFU-nTsqurKTQl95vtmX6Ng/exec",
  // MTO Orders - LATEST URL
  MTO_ORDERS: "https://script.google.com/macros/s/AKfycbzGaj_uVgZiBQikKCByRF9OIeL_d6FYtw31sicQTHrzNx2R70S8LePJzMlQTEKTldVrZQ/exec",
  // Admin Orders
  ADMIN_ORDERS: "https://hooks.zapier.com/hooks/catch/21741437/2wk9kll/"
};

// Log webhook URLs on initial load for verification
console.log("🔍 CONFIG - LATEST Webhook URLs configuration loaded:");
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


/**
 * Type definitions for webhook payloads
 */

import { CrossDockFields } from "./cross-dock.types";
import type { OrderFormData } from "./orders";

// Re-export OrderFormData type
export type { OrderFormData } from "./orders";
export type OrderData = OrderFormData; // Legacy alias

/**
 * Cross Dock Webhook Payload
 * Defines the structure of data sent to the cross dock webhook
 */
export interface CrossDockWebhookPayload {
  name: string;
  store: string;
  product_number: string;
  description: string;
  quantity: number;
  schedule_arrival: string;
  notes: string;
  email: string;
  cross_dock: "Yes" | "No";
  cross_dock_from?: string;
  cross_dock_dest?: string;
  destination_manager_email?: string;
  receiver_no?: string;
  eta_date?: string;
  order_source?: string;
  order_type?: string;
  plant?: string;
}

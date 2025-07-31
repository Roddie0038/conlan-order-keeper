/**
 * Unified Order Interface Types for Ordering Platform
 * These types align with the OT Platform structure and actual Supabase database schema
 * All field names use snake_case to match database columns exactly
 */

import type { Database } from "@/integrations/supabase/types";
import { OrderType } from "@/services/OrderIDService";

// Base order interface with common fields across all order types
export interface BaseOrder {
  id: string; // UUID from database
  timestamp: string; // ISO timestamp
  name: string;
  store: string; // Normalized store format
  notes: string | null;
  status: string;
  completed: boolean;
  completed_at: string | null;
  plant: string | null;
  email: string | null;
}

// Transfer Order Record - matches 'orders' table schema exactly
export interface OrderRecord {
  id: number; // bigint in database (keeping for backward compatibility)
  timestamp: string; // ISO timestamp
  name: string;
  store: string; // Normalized store format
  notes: string | null;
  status: string;
  completed: boolean;
  completed_at: string | null;
  plant: string | null;
  email: string | null;
  product_number: string;
  description: string;
  quantity: number; // bigint in database
  schedule_arrival: string;
  cross_dock_type: string | null;
  cross_dock_destination: string | null;
  cross_dock_receiver_number: string | null;
  cross_dock_eta_date: string | null;
  invoice_number: string | null;
  destination_manager_email: string | null;
  order_type: string;
  out_of_stock: boolean | null;
  out_of_stock_eta: string | null;
  out_of_stock_notes: string | null;
  warehouse_received: boolean | null;
  received_at_warehouse: string | null;
  cross_plant_order: boolean | null;
  response_deadline: string | null;
  store_response_status: string | null;
  confirmation_token: string | null;
}

// MTO Order Record - matches 'mto_orders' table schema exactly
export interface MTOOrderRecord {
  id: string; // UUID from database
  timestamp: string; // ISO timestamp
  name: string;
  store: string; // Normalized store format
  notes: string | null;
  status: string;
  completed: boolean;
  completed_at: string | null;
  plant: string | null;
  email: string | null;
  product_number: string;
  casing_grade: string;
  tire_size: string;
  tread: string | null;
  quantity: number;
  have_casings: boolean | null;
  projected_delivery: string | null; // date field
  tread_in_inventory: boolean | null;
  send_invoice: boolean | null;
  send_email_trigger: boolean | null;
  status_updated_at: string | null;
  ready_to_ship_at: string | null;
  in_transit_at: string | null;
  received_at: string | null;
  shipped_quantity: number | null;
  pending_quantity: number | null;
  last_shipment_date: string | null; // date field
  casings_in_stock: boolean | null;
  tread_in_stock: boolean | null;
  casings_eta: string | null; // date field
  tread_eta: string | null; // date field
  warehouse_notified_at: string | null;
  retread_notified_at: string | null;
  store_notified_at: string | null;
  inventory_last_updated: string | null;
  deleted_at: string | null;
  invoice_number: string | null;
  order_completion_link: string | null;
  destination_manager_email: string | null;
  email_message: string | null;
  cross_dock_form_link: string | null;
  order_type: string;
  description: string | null;
  type: string | null;
  updated_by: string | null;
}

// Wheel Order Record - matches 'wheel_orders' table schema exactly
export interface WheelOrderRecord {
  id: string; // UUID from database
  timestamp: string; // ISO timestamp
  name: string;
  store: string; // Normalized store format
  notes: string | null;
  status: string;
  completed: boolean;
  completed_at: string | null;
  plant: string | null;
  email: string | null;
  productnumber: string;
  wheeltype: string;
  wheelsize: string;
  desiredcolor: string;
  quantity: number;
  schedulearrival: string;
  ordertype: string;
  wheelmaterial: string | null;
  handholes: number | null;
  // Optional fields that may exist in some records
  customerName?: string | null;
  dateReceived?: string | null;
  userStore?: string | null;
  storeColors?: string | null;
  destinationPlant?: string | null;
}

// Warranty Order Record - matches 'warranty_orders' table schema exactly
export interface WarrantyOrderRecord {
  id: string; // UUID
  created_at: string;
  name: string;
  store: string; // Normalized store format
  dot_number: string;
  tire_type: string;
  tire_size: string;
  condition: string;
  notes: string | null;
  status: string;
  completed_at: string | null; // This field exists in database
  plant: string;
  customer_name: string | null;
  email: string | null;
  approval_status: string | null;
  approval_date: string | null;
  denial_reason: string | null;
  work_order: string | null;
}

// Combined Order interface for unified display
export interface CombinedOrder {
  id: string; // Standardized order ID format (e.g., "ORD-uuid", "MTO-uuid", "WHL-uuid", "WAR-uuid")
  timestamp: string;
  name: string;
  store: string;
  productNumber: string;
  description: string;
  quantity: number;
  scheduleArrival: string;
  notes: string;
  status: string;
  completed: boolean;
  orderType: OrderType;
  completedAt?: string;
  completedBy?: string;
}

// Re-export Database types for compatibility
export type TransferOrderRecord = Database['public']['Tables']['orders']['Row'];
export type MTOOrderDatabaseRecord = Database['public']['Tables']['mto_orders']['Row'];
export type WheelOrderDatabaseRecord = Database['public']['Tables']['wheel_orders']['Row'];
export type WarrantyOrderDatabaseRecord = Database['public']['Tables']['warranty_orders']['Row'];

// Form data interfaces for order submission (camelCase for UI forms)
export interface OrderFormData {
  id?: string;
  yourName?: string;
  name: string;
  store: string;
  dateReceived?: string;
  productNumber: string;
  description: string;
  quantity: number;
  scheduleArrival?: string;
  notes?: string;
  crossDock?: "Yes" | "No";
  crossDockDestination?: string;
  crossDockType?: "Yes" | "No";
  crossDockReceiverNumber?: string;
  crossDockEtaDate?: string;
  email?: string;
  plant?: string;
  timestamp?: string;
  type?: OrderType;
  userId?: string;
  userEmail?: string;
  status?: string;
  
  // Additional fields that may be used
  managerEmail?: string;
  managersEmail?: string;
  destinationManagerEmail?: string;
  receiverNo?: string;
  etaDate?: string;
  
  // Wheel-specific fields (for wheel order forms)
  customerName?: string;
  wheelMaterial?: string;
  wheelType?: string;
  handHoles?: number;
  wheelSize?: string;
  wheelColor?: string;
  qtyWheels?: string;
  storeColors?: string;
}

export interface MTOFormData {
  id?: string;
  timestamp?: string;
  name: string;
  store: string;
  productNumber: string;
  casingGrade: string;
  tireSize: string;
  tread?: string;
  quantity: number;
  notes?: string;
  email?: string;
  plant?: string;
  status?: string;
  type?: OrderType;
  orderType?: string;
  description: string;
}

export interface WheelFormData {
  yourName: string;
  storeName: string;
  storeId: string;
  dateReceived: string;
  qtyWheels: string;
  customerName: string;
  wheelMaterial: string;
  wheelType: string;
  handHoles: string;
  wheelSize: string;
  wheelColor: string;
  scheduleArrival: string;
  userStore: string;
  storeColors: string;
  destinationPlant: string;
}

// Utility type for transforming camelCase to snake_case for database inserts
export type CamelToSnakeCase<T> = {
  [K in keyof T as K extends string ? SnakeCaseKey<K> : K]: T[K];
};

type SnakeCaseKey<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${SnakeCaseKey<U>}`
  : S;

// Database normalization utilities
export interface StoreNormalizationResult {
  displayFormat: string; // e.g., "Fort Worth 022"
  dbFormat: string; // e.g., "22"
  variants: string[]; // e.g., ["22", "022"]
}

export interface PlantNormalizationResult {
  displayFormat: string; // e.g., "Grand Prairie 097"
  dbFormat: string; // e.g., "Grand Prairie 097"
}
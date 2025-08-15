/**
 * PHASE 1: Complete Order Interface Alignment with OT Platform Standards
 * 
 * This file contains ALL order-related TypeScript interfaces that exactly match
 * the Supabase database schema field-for-field, type-for-type, naming-for-naming.
 * 
 * CRITICAL: Uses snake_case for database compatibility and includes ALL advanced
 * fields for future-proofing, even if not yet used in the UI.
 */

import type { Database } from "@/integrations/supabase/types";
import { OrderType } from "@/services/OrderIDService";

// ============= DATABASE RECORD INTERFACES =============
// These interfaces match the exact Supabase table schemas

/**
 * Transfer Order Record - matches 'orders' table schema EXACTLY
 * Based on live Supabase schema - ALL 47 fields included
 */
export interface OrderRecord {
  // Core identification fields
  id: number; // bigint in database, non-nullable, primary key
  timestamp: string; // text field, non-nullable
  
  // Basic order information
  name: string | null;
  store: string | null;
  product_number: string | null;
  description: string | null;
  quantity: number | null; // bigint, nullable
  schedule_arrival: string | null;
  notes: string | null;
  
  // Status and completion tracking
  status: string | null; // default: 'pending'
  completed: boolean | null;
  completed_at: string | null; // timestamp without time zone
  completed_by: string | null;
  status_updated_at: string | null; // timestamp without time zone, default: now()
  
  // Plant and contact information
  plant: string | null;
  email: string | null;
  
  // Advanced Cross-Dock Fields
  cross_plant_order: boolean | null; // default: false
  cross_dock_type: string | null;
  cross_dock_destination: string | null;
  cross_dock_receiver_number: string | null;
  cross_dock_eta_date: string | null;
  cross_dock_form_link: string | null;
  
  // Out-of-Stock Workflow Fields (Advanced)
  out_of_stock: boolean | null;
  out_of_stock_eta: string | null;
  out_of_stock_notes: string | null;
  out_of_stock_items: any | null; // jsonb type
  
  // Warehouse and Receiving Fields
  warehouse_received: boolean | null; // default: false
  received_at_warehouse: string | null; // timestamp with time zone
  received_at: string | null; // timestamp without time zone
  ready_to_ship_at: string | null; // timestamp without time zone
  in_transit_at: string | null; // timestamp without time zone
  
  // Manager Workflow Fields (Advanced)
  manager_notes: string | null;
  tire_pull_status: string | null;
  store_manager_message: string | null;
  
  // Response and Communication Fields
  response_deadline: string | null; // timestamp with time zone
  store_response_status: string | null;
  store_response_date: string | null; // timestamp with time zone
  confirmation_token: string | null;
  
  // Email and Notification Fields
  send_email_trigger: boolean | null;
  send_invoice: boolean | null;
  email_message: string | null;
  destination_manager_email: string | null;
  
  // Invoice and Documentation Fields
  invoice_number: string | null;
  order_completion_link: string | null;
  pull_sheet_link: string | null;
  
  // System and Maintenance Fields
  order_type: string | null;
  archived: boolean | null;
  deleted_at: string | null; // timestamp with time zone
  reopened_at: string | null; // timestamp without time zone
  reopened_reason: string | null;
  manual_override_allowed: boolean | null; // default: false
  manual_override_reason: string | null;
}

/**
 * MTO Order Record - matches 'mto_orders' table schema EXACTLY (43 fields total)
 * CORRECTED to include ALL database fields from actual schema
 */
export interface MTOOrderRecord {
  // Core identification
  id: string; // UUID, non-nullable
  timestamp: string | null; // text field
  
  // Basic order information
  name: string | null;
  store: string | null;
  product_number: string | null;
  casing_grade: string | null;
  tire_size: string | null;
  tread: string | null;
  quantity: number | null; // integer
  notes: string | null;
  description: string | null;
  
  // Status and completion tracking
  status: string | null;
  completed: boolean | null;
  completed_at: string | null; // timestamp with time zone
  status_updated_at: string | null; // timestamp with time zone
  
  // Plant and contact information
  plant: string | null;
  email: string | null;
  type: string | null;
  
  // Inventory and availability tracking
  have_casings: boolean | null;
  tread_in_inventory: boolean | null;
  casings_in_stock: boolean | null;
  tread_in_stock: boolean | null;
  projected_delivery: string | null; // date
  casings_eta: string | null; // date
  tread_eta: string | null; // date
  
  // Shipping and fulfillment
  shipped_quantity: number | null; // integer
  pending_quantity: number | null; // integer
  last_shipment_date: string | null; // date
  ready_to_ship_at: string | null; // timestamp with time zone
  in_transit_at: string | null; // timestamp with time zone
  received_at: string | null; // timestamp with time zone
  
  // Notification tracking
  warehouse_notified_at: string | null; // timestamp with time zone
  retread_notified_at: string | null; // timestamp with time zone
  store_notified_at: string | null; // timestamp with time zone
  inventory_last_updated: string | null; // timestamp with time zone
  
  // Email and communication
  send_invoice: boolean | null;
  send_email_trigger: boolean | null;
  email_message: string | null;
  destination_manager_email: string | null;
  
  // Documentation and links
  invoice_number: string | null;
  order_completion_link: string | null;
  cross_dock_form_link: string | null;
  order_type: string | null;
  
  // System fields
  deleted_at: string | null; // timestamp with time zone
  updated_by: string | null;
}

/**
 * Wheel Order Record - matches 'wheel_orders' table schema EXACTLY
 * Based on live Supabase schema - ALL 34 fields included (snake_case naming)
 */
export interface WheelOrderRecord {
  // Core identification
  id: string; // UUID, non-nullable, primary key
  timestamp: string | null;
  
  // Plant and location
  plant: string | null;
  store: string | null;
  
  // Basic order information
  name: string | null;
  quantity: number | null; // integer
  
  // Wheel specifications (snake_case as per database)
  wheel_size: string | null;
  wheel_type: string | null;
  wheel_material: string | null;
  desired_color: string | null;
  hand_holes: number | null; // integer
  
  // Scheduling and delivery
  due_date: string | null; // date
  
  // Receiving and fulfillment
  wheels_received: number | null; // integer
  work_order_link: string | null;
  received_at: string | null; // timestamp with time zone
  
  // Status and completion tracking
  completed: boolean | null;
  completed_at: string | null; // timestamp with time zone
  status_updated_at: string | null; // timestamp with time zone
  
  // Cross-Dock Fields (snake_case as per database)
  cross_dock_destination: string | null;
  cross_dock_eta_date: string | null; // date
  cross_dock_form_link: string | null;
  cross_dock_receiver_number: string | null;
  cross_dock_type: string | null;
  
  // Email and notification fields (snake_case as per database)
  send_email_trigger: boolean | null;
  email_message: string | null;
  destination_manager_email: string | null;
  
  // System fields
  deleted_at: string | null; // timestamp with time zone
}

/**
 * Warranty Order Record - matches 'warranty_orders' table schema EXACTLY
 * Based on live Supabase schema - ALL 36 fields included
 */
export interface WarrantyOrderRecord {
  // Core identification
  id: string; // UUID, non-nullable, primary key
  created_at: string | null; // timestamp with time zone, default: now()
  
  // Plant and location
  plant: string | null;
  store: string | null;
  
  // Basic information
  name: string | null;
  product_number: string | null;
  quantity: number | null; // integer
  description: string | null;
  
  // Customer and contact information
  customer_name: string | null;
  email: string | null;
  phone: string | null;
  
  // Tire and product details
  tire_size: string | null;
  tire_type: string | null;
  dot_number: string | null;
  condition: string | null;
  load_range: string | null;
  mileage_on_tire: number | null; // integer
  wear_percentage: number | null; // integer
  
  // Vehicle information
  vehicle_make: string | null;
  model_year: string | null;
  vin_or_unit: string | null;
  wheel_position: string | null;
  
  // Financial and processing
  purchase_date: string | null; // date
  work_order: string | null;
  approval_invoice_number: string | null;
  denial_invoice_number: string | null;
  excise_tax_collected: boolean | null;
  
  // Documentation
  invoice_url: string | null;
  photo_urls: string[] | null; // array of text
  signature_url: string | null;
  replacement_product_code: string | null;
  
  // Status and processing
  status: string; // Non-nullable, default: 'pending'
  updated_at: string | null; // timestamp with time zone, default: now()
  user_id: string | null; // UUID
  date_submitted: string | null; // timestamp with time zone, default: now()
}

// ============= UNIFIED DISPLAY INTERFACE =============

/**
 * Combined Order interface for unified display across all order types
 * Used in order management and listing components
 */
export interface CombinedOrder {
  id: string; // Standardized format: "ORD-123", "MTO-uuid", "WHL-uuid", "WAR-uuid"
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
  plant?: string;
  email?: string;
}

// ============= FORM DATA INTERFACES =============
// These use camelCase for UI form compatibility

/**
 * Transfer Order Form Data - camelCase for UI forms
 */
export interface OrderFormData {
  // Core fields
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
  email?: string;
  plant?: string;
  timestamp?: string;
  type?: OrderType;
  userId?: string;
  userEmail?: string;
  status?: string;
  
  // Cross-dock fields
  crossDock?: "Yes" | "No";
  crossDockDestination?: string;
  crossDockType?: "Yes" | "No";
  crossDockReceiverNumber?: string;
  crossDockEtaDate?: string;
  
  // Manager and communication fields
  managerEmail?: string;
  managersEmail?: string;
  destinationManagerEmail?: string;
  receiverNo?: string;
  etaDate?: string;
  
  // Cross-plant ordering fields (optional)
  ordering_store?: string;
  ordering_plant?: string;
  destination_plant?: string;
  
  // Transfer fields
  transfer_route?: string;
  carrier?: string;
  
  // Mixed compatibility fields (for wheel order forms)
  customerName?: string;
  wheelMaterial?: string;
  wheelType?: string;
  handHoles?: number;
  wheelSize?: string;
  wheelColor?: string;
  qtyWheels?: string;
  storeColors?: string;
}

/**
 * MTO Order Form Data - camelCase for UI forms
 */
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
  // Cross-plant ordering fields (optional)
  ordering_store?: string;
  ordering_plant?: string;
  destination_plant?: string;
  
  // Transfer fields
  transfer_route?: TransferRoute;
  carrier?: Carrier;
  
  // Additional transfer fields
  destination_store?: string;
  cross_dock_from?: string;
  cross_dock_to?: string;
  cross_dock_type?: string;
}

/**
 * Wheel Order Form Data - camelCase for UI forms
 */
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
  destinationPlant: string; // Mandatory plant field
  // Cross-plant fields for elevated users
  ordering_store?: string;
  ordering_plant?: string;
  destination_plant?: string;
  // Transfer route and carrier fields
  transfer_route?: TransferRoute;
  carrier?: Carrier;
  // Additional transfer fields
  destination_store?: string;
  cross_dock_from?: string;
  cross_dock_to?: string;
  cross_dock_type?: string;
}

/**
 * Warranty Order Form Data - camelCase for UI forms
 */
export interface WarrantyFormData {
  customerName: string;
  storeName: string;
  plantLocation: string;
  dotNumber: string;
  tireType: string;
  tireSize: string;
  condition: string;
  email?: string;
  notes?: string;
  vehicleMake?: string;
  modelYear?: string;
  vinOrUnit?: string;
  wheelPosition?: string;
  loadRange?: string;
  mileageOnTire?: number;
  wearPercentage?: number;
  purchaseDate?: string;
  workOrder?: string;
}

// ============= TRANSFER AND CARRIER TYPES =============

/**
 * Transfer Route Types for enhanced ordering portal
 */
export type TransferRoute = 'store->store' | 'store->plant' | 'plant->store' | 'plant->plant';

export const TRANSFER_ROUTES: { value: TransferRoute; label: string }[] = [
  { value: 'store->store', label: 'Store → Store' },
  { value: 'store->plant', label: 'Store → Plant' },
  { value: 'plant->store', label: 'Plant → Store' },
  { value: 'plant->plant', label: 'Plant → Plant' },
];

/**
 * Carrier Types for shipping
 */
export const CARRIERS = ['Central Transport', 'PAM Transport'] as const;
export type Carrier = typeof CARRIERS[number];

export const CARRIER_OPTIONS: { value: Carrier; label: string }[] = [
  { value: 'Central Transport', label: 'Central Transport' },
  { value: 'PAM Transport', label: 'PAM Transport' },
];

// ============= UTILITY TYPES =============

/**
 * Database normalization results
 */
export interface StoreNormalizationResult {
  displayFormat: string; // e.g., "Fort Worth 022"
  dbFormat: string; // e.g., "Fort Worth 022"
  variants: string[]; // e.g., ["22", "022", "Store 22"]
}

export interface PlantNormalizationResult {
  displayFormat: string; // e.g., "Grand Prairie 097"
  dbFormat: string; // e.g., "Grand Prairie 097"
}

/**
 * Utility type for transforming camelCase to snake_case for database inserts
 */
export type CamelToSnakeCase<T> = {
  [K in keyof T as K extends string ? SnakeCaseKey<K> : K]: T[K];
};

type SnakeCaseKey<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${SnakeCaseKey<U>}`
  : S;

// ============= DATABASE TYPE RE-EXPORTS =============
// Direct references to Supabase-generated types for maximum compatibility

export type TransferOrderDatabaseRecord = Database['public']['Tables']['orders']['Row'];
export type MTOOrderDatabaseRecord = Database['public']['Tables']['mto_orders']['Row'];
export type WheelOrderDatabaseRecord = Database['public']['Tables']['wheel_orders']['Row'];
export type WarrantyOrderDatabaseRecord = Database['public']['Tables']['warranty_orders']['Row'];

// Insert and Update types for each order type
export type TransferOrderInsert = Database['public']['Tables']['orders']['Insert'];
export type TransferOrderUpdate = Database['public']['Tables']['orders']['Update'];

export type MTOOrderInsert = Database['public']['Tables']['mto_orders']['Insert'];
export type MTOOrderUpdate = Database['public']['Tables']['mto_orders']['Update'];

export type WheelOrderInsert = Database['public']['Tables']['wheel_orders']['Insert'];
export type WheelOrderUpdate = Database['public']['Tables']['wheel_orders']['Update'];

export type WarrantyOrderInsert = Database['public']['Tables']['warranty_orders']['Insert'];
export type WarrantyOrderUpdate = Database['public']['Tables']['warranty_orders']['Update'];

// ============= LEGACY COMPATIBILITY =============
// Maintain backward compatibility with existing code

/**
 * @deprecated Use OrderRecord instead
 */
export type BaseOrder = {
  id: string;
  timestamp: string;
  name: string;
  store: string;
  notes: string | null;
  status: string;
  completed: boolean;
  completed_at: string | null;
  plant: string | null;
  email: string | null;
};
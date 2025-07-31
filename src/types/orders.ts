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
 * Transfer Order Record - matches 'orders' table schema exactly
 * Includes ALL advanced fields for manager workflow, out-of-stock, cross-dock, etc.
 */
export interface OrderRecord {
  // Core identification fields
  id: number; // bigint in database
  timestamp: string; // text field, not timestamp
  
  // Basic order information
  name: string | null;
  store: string | null; // Normalized store format
  product_number: string | null;
  description: string | null;
  quantity: number | null; // bigint, can be null in database
  schedule_arrival: string | null;
  notes: string | null;
  
  // Status and completion tracking
  status: string | null;
  completed: boolean | null;
  completed_at: string | null; // timestamp without time zone
  completed_by: string | null;
  status_updated_at: string | null; // timestamp without time zone
  
  // Plant and contact information
  plant: string | null;
  email: string | null;
  
  // Advanced Cross-Dock Fields (Future-Proofed)
  cross_plant_order: boolean | null;
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
  warehouse_received: boolean | null;
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
  manual_override_allowed: boolean | null;
  manual_override_reason: string | null;
}

/**
 * MTO Order Record - matches 'mto_orders' table schema exactly
 * Already comprehensive - no changes needed
 */
export interface MTOOrderRecord {
  // Core identification
  id: string; // UUID
  timestamp: string | null;
  
  // Basic order information
  name: string | null;
  store: string | null;
  product_number: string | null;
  casing_grade: string | null;
  tire_size: string | null;
  tread: string | null;
  quantity: number | null;
  notes: string | null;
  description: string | null;
  
  // Status and completion tracking
  status: string | null;
  completed: boolean | null;
  completed_at: string | null;
  status_updated_at: string | null;
  
  // Plant and contact information
  plant: string | null;
  email: string | null;
  
  // Inventory and availability tracking
  have_casings: boolean | null;
  tread_in_inventory: boolean | null;
  casings_in_stock: boolean | null;
  tread_in_stock: boolean | null;
  projected_delivery: string | null; // date
  casings_eta: string | null; // date
  tread_eta: string | null; // date
  
  // Shipping and fulfillment
  shipped_quantity: number | null;
  pending_quantity: number | null;
  last_shipment_date: string | null; // date
  ready_to_ship_at: string | null;
  in_transit_at: string | null;
  received_at: string | null;
  
  // Notification tracking
  warehouse_notified_at: string | null;
  retread_notified_at: string | null;
  store_notified_at: string | null;
  inventory_last_updated: string | null;
  
  // Email and communication
  send_invoice: boolean | null;
  send_email_trigger: boolean | null;
  email_message: string | null;
  destination_manager_email: string | null;
  
  // Documentation and links
  invoice_number: string | null;
  order_completion_link: string | null;
  cross_dock_form_link: string | null;
  
  // System fields
  order_type: string | null;
  type: string | null;
  deleted_at: string | null;
  updated_by: string | null;
}

/**
 * Wheel Order Record - matches 'wheel_orders' table schema exactly
 * ALL fields match database column names exactly (no snake_case conversion)
 */
export interface WheelOrderRecord {
  // Core identification
  id: string; // UUID
  timestamp: string | null; // timestamp with time zone
  
  // Basic order information
  name: string | null;
  store: string | null;
  productnumber: string | null;
  quantity: number | null; // integer
  notes: string | null;
  description: string | null;
  
  // Wheel specifications
  wheeltype: string | null;
  wheelsize: string | null;
  wheelmaterial: string | null;
  desiredcolor: string | null;
  handholes: number | null; // integer
  
  // Scheduling and delivery
  schedulearrival: string | null;
  duedate: string | null; // date
  
  // Status and completion tracking
  status: string | null;
  completed: boolean | null;
  completed_at: string | null; // timestamp with time zone
  completedat: string | null; // timestamp with time zone  
  statusupdatedat: string | null; // text field (not timestamp)
  
  // Plant and contact information
  plant: string | null;
  email: string | null;
  
  // Receiving and fulfillment
  wheelsreceived: boolean | null; // boolean, not number
  received_at: string | null; // timestamp with time zone
  receivedat: string | null; // timestamp with time zone
  
  // Cross-Dock Fields (exact database field names)
  crossdockdestination: string | null;
  crossdocketadate: string | null; // text field
  crossdockformlink: string | null;
  crossdockreceivernumber: string | null;
  crossdocktype: string | null;
  
  // Email and notification fields
  sendemailtrigger: boolean | null;
  emailmessage: string | null;
  destinationmanageremail: string | null;
  
  // Documentation and links
  workorderlink: string | null;
  
  // System fields
  ordertype: string | null; // Database field is 'ordertype', not 'order_type'
  deleted_at: string | null; // timestamp with time zone
}

/**
 * Warranty Order Record - matches 'warranty_orders' table schema exactly
 * ALL fields match exact database schema with correct types and nullability
 */
export interface WarrantyOrderRecord {
  // Core identification
  id: string; // UUID, non-nullable
  user_id: string | null; // UUID, nullable
  created_at: string; // timestamp with time zone, non-nullable
  updated_at: string; // timestamp with time zone, non-nullable
  
  // Status and processing
  status: string; // text, non-nullable (default: 'open')
  plant: string; // text, non-nullable
  
  // Basic information
  store: string | null;
  name: string | null;
  customer_name: string | null;
  email: string | null;
  
  // Tire information
  tire_type: string | null;
  dot_number: string | null; // nullable in database
  tire_size: string | null;
  condition: string | null; // nullable in database
  notes: string | null;
  
  // Submission details
  date_submitted: string | null; // date, nullable (default: CURRENT_DATE)
  work_order: string | null;
  
  // Vehicle information
  vehicle_make: string | null;
  vin_or_unit: string | null;
  model_year: string | null;
  wheel_position: string | null;
  load_range: string | null;
  
  // Tire condition details (text fields, not numeric)
  wear_percentage: string | null; // text in database, not number
  mileage_on_tire: string | null; // text in database, not number
  purchase_date: string | null; // date
  
  // Financial processing
  excise_tax_collected: boolean | null; // boolean in database, not number
  replacement_product_code: string | null;
  
  // Documentation and media
  invoice_url: string | null;
  photo_urls: string[] | null; // ARRAY type in database
  signature_url: string | null;
  
  // System fields
  deleted_at: string | null; // timestamp with time zone
  
  // Approval workflow
  approval_status: string | null; // default: 'pending'
  approval_date: string | null; // timestamp with time zone
  approved_by: string | null;
  approval_notes: string | null;
  approval_invoice_number: string | null;
  denial_reason: string | null;
  denial_invoice_number: string | null;
  
  // Compatibility field for orderCombiner (computed from approval_date)
  completed_at?: string | null;
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
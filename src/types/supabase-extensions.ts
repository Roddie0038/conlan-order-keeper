import type { Database } from "@/integrations/supabase/types";
import { OrderType } from "@/services/OrderIDService";

// Standardized Supabase insert result type
export type SupabaseInsertResult<T> = {
  data: T | null;
  error: Error | null;
};

// Define OrderData interface with standardized ID format
export interface OrderData {
  id?: string; // Standardized order ID format (e.g., "ORD-uuid")
  yourName?: string;
  name: string;
  store: string;
  dateReceived?: string;
  productNumber: string;
  description: string;
  quantity: number; // Ensure this is number, not string
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
  type?: OrderType; // Use standardized OrderType
  userId?: string;
  userEmail?: string;
  status?: string;
  
  // Additional fields that may be used
  managerEmail?: string;
  managersEmail?: string;
  destinationManagerEmail?: string;
  receiverNo?: string;
  etaDate?: string;
  
  // Wheel-specific fields - using camelCase to match Supabase schema
  customerName?: string;
  wheelMaterial?: string;
  wheelType?: string;
  handHoles?: number; // Changed to number to match schema
  wheelSize?: string;
  wheelColor?: string;
  qtyWheels?: string;
  
  // Store colors field - FIXED: Added to resolve TypeScript error
  storeColors?: string;
}

// Define MTOOrderData interface for MTO orders with standardized ID
export interface MTOOrderData {
  id?: string; // Standardized order ID format (e.g., "MTO-uuid")
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
  type?: OrderType; // Use standardized OrderType
  orderType?: string;
  description: string; // Made required to match OrderData
  
  // Additional MTO-specific fields to match database schema
  tireTreadNeeded?: string;
  managerEmail?: string;
  haveCasings?: boolean;
  treadInInventory?: boolean;
  projectedDelivery?: string;
  completed?: boolean;
  sendInvoice?: boolean;
  sendEmailTrigger?: boolean;
  statusUpdatedAt?: string;
  readyToShipAt?: string;
  inTransitAt?: string;
  receivedAt?: string;
  completedAt?: string;
  crossDockFormLink?: string;
  emailMessage?: string;
  destinationManagerEmail?: string;
  orderCompletionLink?: string;
  invoiceNumber?: string;
}

// Define specific return types for each order type
export type MTOOrderRecord = Database['public']['Tables']['mto_orders']['Row'];
export type TransferOrderRecord = Database['public']['Tables']['orders']['Row'];
export type WheelOrderRecord = Database['public']['Tables']['wheel_orders']['Row'];
export type WarrantyOrderRecord = Database['public']['Tables']['warranty_orders']['Row'];

// Add order messages type
export type OrderMessageRecord = Database['public']['Tables']['order_messages']['Row'];

export interface ExtendedDatabase extends Database {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      approved_treads: {
        Row: {
          id: string;
          tread_code: string;
          status: string | null;
          notes: string | null;
          category: string | null;
          display_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          tread_code: string;
          status?: string | null;
          notes?: string | null;
          category?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          tread_code?: string;
          status?: string | null;
          notes?: string | null;
          category?: string | null;
          display_order?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      order_messages: {
        Row: {
          id: string;
          order_id: string;
          order_type: 'orders' | 'mto_orders' | 'wheel_orders';
          message_text: string;
          sender_email: string;
          sender_role: 'store_manager' | 'warehouse_admin';
          sender_name: string | null;
          sender_store: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          order_type: 'orders' | 'mto_orders' | 'wheel_orders';
          message_text: string;
          sender_email: string;
          sender_role: 'store_manager' | 'warehouse_admin';
          sender_name?: string | null;
          sender_store?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          order_type?: 'orders' | 'mto_orders' | 'wheel_orders';
          message_text?: string;
          sender_email?: string;
          sender_role?: 'store_manager' | 'warehouse_admin';
          sender_name?: string | null;
          sender_store?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
    };
  };
}
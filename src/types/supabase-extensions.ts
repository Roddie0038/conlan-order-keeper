/**
 * PHASE 1: Supabase Extensions and Type Re-exports for Ordering Platform
 * 
 * This file provides additional types, extensions, and compatibility layers
 * for the Supabase integration while maintaining alignment with OT Platform standards.
 */

import type { Database } from "@/integrations/supabase/types";
import { OrderType } from "@/services/OrderIDService";
import { 
  OrderFormData, 
  MTOFormData, 
  WheelFormData,
  WarrantyFormData,
  StoreNormalizationResult,
  PlantNormalizationResult
} from "@/types/orders";

// ============= SUPABASE RESULT TYPES =============

/**
 * Standardized Supabase insert result type
 */
export type SupabaseInsertResult<T> = {
  data: T | null;
  error: Error | null;
};

// ============= FORM DATA RE-EXPORTS =============
// Re-export form data interfaces for compatibility (camelCase for UI forms)
// These are now the primary form interfaces, legacy type aliases removed

export type { OrderFormData, MTOFormData, WheelFormData, WarrantyFormData };

// ============= DATABASE TYPE RE-EXPORTS =============
// Re-export the comprehensive database types from orders.ts

export type { 
  OrderRecord as TransferOrderRecord,
  MTOOrderRecord, 
  WheelOrderRecord, 
  WarrantyOrderRecord 
} from "@/types/orders";

// Legacy aliases for backwards compatibility
export type OrderData = OrderFormData;
export type MTOOrderData = MTOFormData;

// Insert and Update types for database operations
export type MTOOrderInsert = Database['public']['Tables']['mto_orders']['Insert'];
export type MTOOrderUpdate = Database['public']['Tables']['mto_orders']['Update'];

export type TransferOrderInsert = Database['public']['Tables']['orders']['Insert'];
export type TransferOrderUpdate = Database['public']['Tables']['orders']['Update'];

export type WheelOrderInsert = Database['public']['Tables']['wheel_orders']['Insert'];
export type WheelOrderUpdate = Database['public']['Tables']['wheel_orders']['Update'];

export type WarrantyOrderInsert = Database['public']['Tables']['warranty_orders']['Insert'];
export type WarrantyOrderUpdate = Database['public']['Tables']['warranty_orders']['Update'];

// ============= MESSAGE SYSTEM TYPES =============

/**
 * Order Messages Record - matches 'order_messages' table schema
 */
export type OrderMessageRecord = Database['public']['Tables']['order_messages']['Row'];
export type OrderMessageInsert = Database['public']['Tables']['order_messages']['Insert'];
export type OrderMessageUpdate = Database['public']['Tables']['order_messages']['Update'];

// ============= EXTENDED DATABASE SCHEMA =============

/**
 * Extended Database interface that includes custom table definitions
 * beyond the base Supabase schema
 */
export interface ExtendedDatabase extends Database {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      // Approved Treads table extension
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
      
      // Order Messages table extension (if not in base schema)
      order_messages: {
        Row: {
          id: string;
          order_id: string | null;
          order_type: string;
          message_text: string;
          sender_email: string;
          sender_role: string;
          sender_name: string | null;
          sender_store: string | null;
          is_read: boolean | null;
          created_at: string | null;
          reply_to_message_id: string | null;
          attachments: any | null; // jsonb
          message_type: string | null;
          priority: string | null;
          email_sent: boolean | null;
          message_id: string | null;
          reply_to_email_id: string | null;
          thread_id: string | null;
          source: string | null;
        };
        Insert: {
          id?: string;
          order_id?: string | null;
          order_type: string;
          message_text: string;
          sender_email: string;
          sender_role: string;
          sender_name?: string | null;
          sender_store?: string | null;
          is_read?: boolean | null;
          created_at?: string | null;
          reply_to_message_id?: string | null;
          attachments?: any | null;
          message_type?: string | null;
          priority?: string | null;
          email_sent?: boolean | null;
          message_id?: string | null;
          reply_to_email_id?: string | null;
          thread_id?: string | null;
          source?: string | null;
        };
        Update: {
          id?: string;
          order_id?: string | null;
          order_type?: string;
          message_text?: string;
          sender_email?: string;
          sender_role?: string;
          sender_name?: string | null;
          sender_store?: string | null;
          is_read?: boolean | null;
          created_at?: string | null;
          reply_to_message_id?: string | null;
          attachments?: any | null;
          message_type?: string | null;
          priority?: string | null;
          email_sent?: boolean | null;
          message_id?: string | null;
          reply_to_email_id?: string | null;
          thread_id?: string | null;
          source?: string | null;
        };
        Relationships: [];
      };
    };
  };
}

// ============= UTILITY TYPE EXPORTS =============

export type { StoreNormalizationResult, PlantNormalizationResult };
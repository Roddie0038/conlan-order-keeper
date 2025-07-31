import type { Database } from "@/integrations/supabase/types";
import { OrderType } from "@/services/OrderIDService";
import { 
  OrderFormData, 
  MTOFormData, 
  WheelFormData,
  StoreNormalizationResult,
  PlantNormalizationResult
} from "@/types/orders";

// Standardized Supabase insert result type
export type SupabaseInsertResult<T> = {
  data: T | null;
  error: Error | null;
};

// Re-export form data interfaces (camelCase for UI forms)
export type OrderData = OrderFormData;
export type MTOOrderData = MTOFormData;

// Re-export Database types for compatibility
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
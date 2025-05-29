import type { Database } from "@/integrations/supabase/types";

// Define OrderData interface for backward compatibility
export interface OrderData {
  id?: string;
  yourName?: string;
  name: string;
  store: string;
  dateReceived?: string;
  product_number: string;
  description: string;
  quantity: number; // Ensure this is number, not string
  schedule_arrival?: string;
  notes?: string;
  crossDock?: "Yes" | "No";
  crossDockDestination?: string;
  cross_dock_type?: "Yes" | "No";
  cross_dock_destination?: string;
  cross_dock_receiver_number?: string;
  cross_dock_eta_date?: string;
  email?: string;
  plant?: string;
  timestamp?: string;
  type?: string;
  userId?: string;
  userEmail?: string;
  status?: string;
  
  // Additional fields that may be used
  managerEmail?: string;
  managersEmail?: string;
  destinationManagerEmail?: string;
  destination_manager_email?: string;
  receiverNo?: string;
  etaDate?: string;
  
  // Wheel-specific fields
  customerName?: string;
  wheelMaterial?: string;
  wheelType?: string;
  handHoles?: string;
  wheelSize?: string;
  wheelColor?: string;
  qtyWheels?: string;
}

// Define MTOOrderData interface for MTO orders
export interface MTOOrderData {
  id?: string;
  timestamp?: string;
  name: string;
  store: string;
  product_number: string;
  casing_grade: string;
  tire_size: string;
  tread?: string;
  quantity: number;
  notes?: string;
  email?: string;
  plant?: string;
  status?: string;
  type?: string;
  order_type?: string;
  description: string; // Made required to match OrderData
  
  // Additional MTO-specific fields to match database schema
  tire_tread_needed?: string;
  manager_email?: string;
  have_casings?: boolean;
  tread_in_inventory?: boolean;
  projected_delivery?: string;
  completed?: boolean;
  send_invoice?: boolean;
  send_email_trigger?: boolean;
  status_updated_at?: string;
  ready_to_ship_at?: string;
  in_transit_at?: string;
  received_at?: string;
  completed_at?: string;
  cross_dock_form_link?: string;
  email_message?: string;
  destination_manager_email?: string;
  order_completion_link?: string;
  invoice_number?: string;
}

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
    };
  };
}


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

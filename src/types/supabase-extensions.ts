
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
  quantity: number;
  schedule_arrival?: string;
  notes?: string;
  crossDock?: "Yes" | "No";
  crossDockDestination?: string;
  cross_dock_type?: "Yes" | "No";
  cross_dock_destination?: string;
  email?: string;
  plant?: string;
  timestamp?: string;
  type?: string;
  userId?: string;
  userEmail?: string;
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

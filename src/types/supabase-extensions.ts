
import { Database as OriginalDatabase } from "@/integrations/supabase/types";
import { CrossDockFields } from "./cross-dock.types";

// Define a base OrderData interface that can be extended
export interface BaseOrderData {
  name?: string;
  store?: string;
  productNumber?: string;
  description?: string;
  quantity?: number | string;
  scheduleArrival?: string;
  notes?: string;
  email?: string;
  crossDock?: "Yes" | "No";
  crossDockDestination?: string;
  timestamp?: string;
  type?: string;
  plant?: string;
}

// Export OrderData type to be used across the application
export interface OrderData extends BaseOrderData {
  // Add the missing properties to fix TypeScript errors
  id?: string;
  yourName?: string;
  dateReceived?: string;
  
  // Additional fields specific to cross-dock orders
  crossDockFrom?: string;
  crossDockDest?: string;
  destinationManagerEmail?: string;
  receiverNo?: string;
  etaDate?: string;
  
  // Additional fields for MTO orders
  casingGrade?: string[];
  tireSize?: string;
  tireTreadNeeded?: string;
  
  // Additional fields for wheel orders
  customerName?: string;
  wheelMaterial?: string;
  wheelType?: string;
  handHoles?: string;
  wheelSize?: string;
  wheelColor?: string;
  qtyWheels?: string | number;
}

// Extend the original Database type to include our new inventory_documents table
export interface ExtendedDatabase extends OriginalDatabase {
  public: {
    Tables: OriginalDatabase["public"]["Tables"] & {
      inventory_documents: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          type: string;
          date: string;
          file_name: string | null;
          file_size: string | null;
          file_path: string | null;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          type: string;
          date?: string;
          file_name?: string | null;
          file_size?: string | null;
          file_path?: string | null;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          type?: string;
          date?: string;
          file_name?: string | null;
          file_size?: string | null;
          file_path?: string | null;
        };
        Relationships: [];
      };
    };
    Views: OriginalDatabase["public"]["Views"];
    Functions: OriginalDatabase["public"]["Functions"];
    Enums: OriginalDatabase["public"]["Enums"];
    CompositeTypes: OriginalDatabase["public"]["CompositeTypes"];
  };
}

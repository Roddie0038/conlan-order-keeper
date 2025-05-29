
import type { Database } from "@/integrations/supabase/types";

// Define OrderData interface for backward compatibility
export interface OrderData {
  id?: string;
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
  type?: string;
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
}

// Define MTOOrderData interface for MTO orders
export interface MTOOrderData {
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
  type?: string;
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

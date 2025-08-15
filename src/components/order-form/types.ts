import { FormData } from "./formConfig";
import { OrderType } from "@/services/OrderIDService";

export interface OrderSummary {
  id: string; // Standardized order ID format (e.g., "ORD-uuid", "MTO-uuid")
  timestamp: string;
  store: string;
  selected?: boolean;
  managersEmail?: string;
  type?: OrderType;
  
  // Base form fields from FormData
  yourName?: string;
  dateReceived?: string;
  productNumber?: string;
  description?: string;
  quantity?: string;
  scheduleArrival?: string;
  notes?: string;
  crossDock?: "Yes" | "No";
  crossDockDestination?: string;
  crossDockConfirmation?: boolean;
  
  // Transfer fields
  transfer_route?: string;
  carrier?: string;
  
  // Cross-plant fields
  destination_plant?: string;
  ordering_plant?: string;
  ordering_store?: string;
  
  // Additional transfer fields
  destination_store?: string;
  cross_dock_from?: string;
  cross_dock_to?: string;
  cross_dock_type?: string;
  
  // Cross Dock fields
  destinationManagerEmail?: string;
  receiverNo?: string;
  etaDate?: string;
}
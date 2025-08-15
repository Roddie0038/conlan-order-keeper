import { FormData } from "./formConfig";
import { OrderType } from "@/services/OrderIDService";

export interface OrderSummary extends FormData {
  id: string; // Standardized order ID format (e.g., "ORD-uuid", "MTO-uuid")
  timestamp: string;
  store: string;
  selected?: boolean;
  managersEmail?: string;
  type?: OrderType;
  
  // Transfer fields
  transfer_route?: string;
  carrier?: string;
  
  // Cross-plant fields
  destination_plant?: string;
  ordering_plant?: string;
  ordering_store?: string;
  
  // Cross Dock fields
  destinationManagerEmail?: string;
  receiverNo?: string;
  etaDate?: string;
}
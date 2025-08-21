import { FormData } from "./formConfig";
import { OrderType } from "@/services/OrderIDService";

export interface OrderSummary extends FormData {
  id: string; // Standardized order ID format (e.g., "ORD-uuid", "MTO-uuid")
  timestamp: string;
  store: string;
  selected?: boolean;
  managersEmail?: string;
  type?: OrderType;
  
  // Add Cross Dock fields
  destinationManagerEmail?: string;
  receiverNo?: string;
  etaDate?: string;
}
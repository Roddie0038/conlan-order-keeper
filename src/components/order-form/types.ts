
import { FormData } from "./formConfig";

export interface OrderSummary extends FormData {
  id: string;
  timestamp: string;
  store: string;
  selected?: boolean;
  managersEmail?: string;
  type?: "MTO" | "WHEEL_POWDER_COATING" | "TRANSFER";
  
  // Add Cross Dock fields
  destinationManagerEmail?: string;
  receiverNo?: string;
  etaDate?: string;
}

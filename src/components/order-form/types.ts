
import { FormData } from "./formConfig";

export interface OrderSummary extends FormData {
  id: string;
  timestamp: string;
  store: string;
  selected?: boolean;
  managersEmail?: string;
  type?: "MTO" | "WHEEL_POWDER_COATING" | "TRANSFER";
  receiverNo?: string;
  etaDate?: string;
  crossDockDestination?: string;
  crossDockConfirmation?: boolean;
}

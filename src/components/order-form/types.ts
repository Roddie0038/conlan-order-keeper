
import { FormData } from "./formConfig";

export interface OrderSummary extends FormData {
  id: string;
  timestamp: string;
  store: string;
  selected?: boolean;
  managersEmail?: string;
  type?: "MTO" | "WHEEL_POWDER_COATING" | "TRANSFER";
  // Cross dock fields
  transferWorkOrderNumber?: string;
  trailerNumber?: string;
  eta?: string;
  crossDockFile?: string;
  crossDockConfirmation?: boolean;
}

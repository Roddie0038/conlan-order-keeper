
import { FormData } from "./formConfig";
import { CrossDockFields } from "@/types/cross-dock.types";

export interface OrderSummary extends FormData, CrossDockFields {
  id: string;
  timestamp: string;
  store: string;
  selected?: boolean;
  managersEmail?: string;
  type?: "MTO" | "WHEEL_POWDER_COATING" | "TRANSFER";
}

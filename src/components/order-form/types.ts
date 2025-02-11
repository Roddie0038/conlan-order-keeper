
import { FormData } from "./formConfig";

export interface OrderSummary extends FormData {
  id: string;
  timestamp: string;
  store: string;
  managerEmail: string;
  selected?: boolean;
}

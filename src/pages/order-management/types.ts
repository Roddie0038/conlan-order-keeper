import { OrderType } from "@/services/OrderIDService";

export interface CombinedOrder {
  id: string; // Standardized order ID format (e.g., "ORD-uuid", "MTO-uuid", "WHL-uuid", "WAR-uuid")
  timestamp: string;
  name: string;
  store: string;
  productNumber: string;
  description: string;
  quantity: number;
  scheduleArrival: string;
  notes: string;
  status: string;
  completed: boolean;
  orderType: OrderType;
  completedAt?: string;
  completedBy?: string;
}

import { supabase } from "@/integrations/supabase/client";

export interface OrderData {
  name?: string;
  store: string;
  productNumber?: string;
  description?: string;
  quantity?: number | string;
  scheduleArrival?: string;
  notes?: string;
  crossDock?: string;
  crossDockDestination?: string;
  transferWorkOrderNumber?: string;  // Added for Cross Dock functionality
  trailerNumber?: string;            // Added for Cross Dock functionality
  etaDate?: string;                  // Added for Cross Dock functionality
  crossDockConfirmation?: boolean;   // Added for Cross Dock functionality
  invoiceNumber?: string;
  completed?: boolean;
  sendInvoice?: boolean;
  outOfStock?: boolean;
  email?: string;
  pullSheet?: string;
  orderCompletionLink?: string;
  sendEmailMessage?: boolean;
  message?: string;
  timestamp?: string;
  type?: string;
}

export async function saveOrderToSupabase(order: OrderData) {
  // Format the order data to match the Supabase table structure
  const formattedOrder = {
    Name: order.name || "",
    Store: order.store,
    "Product Number": order.productNumber || "",
    Description: order.description || "",
    Quantity: typeof order.quantity === 'string' ? parseInt(order.quantity) : order.quantity || 0,
    "Schedule Arrival": order.scheduleArrival || "",
    Notes: order.notes || "",
    "Cross Dock": order.crossDock || "",
    "Cross Dock Destination": order.crossDockDestination || "",
    "Transfer Work Order Number": order.transferWorkOrderNumber || "",
    "Trailer Number": order.trailerNumber || "",
    "ETA Date": order.etaDate || "",
    "Invoice#": order.invoiceNumber || "",
    Email: order.email || "",
    Timestamp: order.timestamp || new Date().toISOString(),
    type: order.type || "TRANSFER"
  };

  console.log("Saving order to Supabase:", formattedOrder);

  const { data, error } = await supabase
    .from('orders')
    .insert([formattedOrder]);

  if (error) {
    console.error("❌ Supabase Insert Error:", error);
  } else {
    console.log("✅ Order saved to Supabase:", data);
  }

  return { data, error };
}

export async function fetchAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('Timestamp', { ascending: false });

  if (error) {
    console.error("❌ Supabase Fetch Error:", error);
    return { orders: [], error };
  }

  return { orders: data || [], error: null };
}

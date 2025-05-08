
import { supabase } from "@/integrations/supabase/client";
import { CrossDockFields } from "@/types/cross-dock.types";

export interface OrderData extends CrossDockFields {
  name?: string;
  store: string;
  productNumber?: string;
  description?: string;
  quantity?: number | string;
  scheduleArrival?: string;
  notes?: string;
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
  destinationManagerEmail?: string; // Added for cross dock destinations
}

export async function saveOrderToSupabase(order: OrderData) {
  // Get current timestamp if not provided
  const timestamp = order.timestamp || new Date().toISOString();

  // Format the order data to match the Supabase table structure
  const formattedOrder = {
    timestamp: timestamp, // Add timestamp explicitly to match the Supabase schema requirement
    completed: order.completed || false,
    name: order.name || "",
    store: order.store,
    product_number: order.productNumber || "",
    description: order.description || "",
    quantity: typeof order.quantity === 'string' ? parseInt(order.quantity) : order.quantity || 0,
    schedule_arrival: order.scheduleArrival || "",
    notes: order.notes || "",
    cross_dock_type: order.crossDock || "No",
    cross_dock_destination: order.crossDockDestination || "",
    cross_dock_receiver_number: order.receiverNo || "",
    "cross_dock_ eta_date": order.etaDate || "",
    invoice_number: order.invoiceNumber || "",
    email: order.email || "",
    destination_manager_email: order.destinationManagerEmail || "", // Added for Cross Dock orders
    order_type: order.type || "TRANSFER"
  };

  console.log("Saving order to Supabase:", formattedOrder);

  const { data, error } = await supabase
    .from('orders')
    .insert(formattedOrder);

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

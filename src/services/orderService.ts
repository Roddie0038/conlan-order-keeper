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
    "Invoice#": order.invoiceNumber || "",
    Email: order.email || "",
    Timestamp: order.timestamp || new Date().toISOString(),
    created_at: new Date().toISOString(),
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
    .order('created_at', { ascending: false });

  if (error) {
    console.error("❌ Supabase Fetch Error:", error);
    return { orders: [], error };
  }

  return { orders: data || [], error: null };
}

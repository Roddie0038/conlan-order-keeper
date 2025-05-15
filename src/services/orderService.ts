
import { supabase } from "@/integrations/supabase/client";
import { CrossDockFields } from "@/types/cross-dock.types";
import { storeData } from "@/config/storeData"; // Import the store data we just created

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
  destinationManagerEmail?: string;
}

export async function saveOrderToSupabase(order: OrderData) {
  // Format timestamp as MM/DD-YYYY hh:mm AM/PM
  const now = new Date();
  const formattedTimestamp = `${(now.getMonth() + 1)
    .toString()
    .padStart(2, "0")}/${now.getDate().toString().padStart(2, "0")}-${now.getFullYear()} ${now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })}`;

  // Get store manager email from storeData if not supplied
  const matchedStore = storeData.find((s) => s.storeNumber === order.store);
  const storeManagerEmail = matchedStore?.managerEmails || "";

  const formattedOrder = {
    timestamp: formattedTimestamp,
    completed: order.completed || false,
    name: order.name || "Unknown",
    store: order.store,
    product_number: order.productNumber || "",
    description: order.description || "",
    quantity: typeof order.quantity === "string" ? parseInt(order.quantity) : order.quantity || 0,
    schedule_arrival: order.scheduleArrival || "",
    notes: order.notes || "",
    cross_dock_type: order.crossDock || "No",
    cross_dock_destination: order.crossDockDestination ? `Store ${order.crossDockDestination}` : "",
    cross_dock_receiver_number: order.receiverNo || "",
    cross_dock_eta_date: order.etaDate || "",
    invoice_number: order.invoiceNumber || "",
    email: order.email || storeManagerEmail,
    destination_manager_email: order.destinationManagerEmail || "",
    order_type: order.type || "TRANSFER",
  };

  console.log("Saving order to Supabase:", formattedOrder);

  const { data, error } = await supabase.from("orders").insert(formattedOrder);

  if (error) {
    console.error("❌ Supabase Insert Error:", error);
  } else {
    console.log("✅ Order saved to Supabase:", data);
  }

  return { data, error };
}

export async function fetchAllOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("timestamp", { ascending: false });

  if (error) {
    console.error("❌ Supabase Fetch Error:", error);
    return { orders: [], error };
  }

  return { orders: data || [], error: null };
}

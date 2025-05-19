
import { supabase } from "@/integrations/supabase/client";
import type { OrderData } from "@/types/supabase-extensions";

/**
 * Save an order to Supabase
 * @param order Order data to save
 * @returns Promise with the result of the save operation
 */
export async function saveOrderToSupabase(order: OrderData) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          name: order.name,
          store: order.store,
          product_number: order.productNumber,
          description: order.description,
          quantity: order.quantity ? parseInt(order.quantity.toString(), 10) : 0,
          schedule_arrival: order.scheduleArrival,
          notes: order.notes,
          email: order.email,
          timestamp: order.timestamp,
          cross_dock_destination: order.crossDockDestination,
          order_type: order.type,
          plant: order.plant,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error saving order:", error);
      return { data: null, error: error.message };
    }

    return { data, error: null };
  } catch (err) {
    console.error("Error saving order to Supabase:", err);
    return { data: null, error: 'Failed to save order to Supabase' };
  }
}

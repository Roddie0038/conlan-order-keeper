
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface OrderRecord {
  // Note: id is not included because it does not exist in the orders table
  timestamp: string;
  name: string;
  store: string;
  product_number: string;
  description: string;
  quantity: number;
  schedule_arrival: string;
  notes: string;
  cross_dock_type: string;
  cross_dock_destination: string;
  cross_dock_receiver_number: string;
  cross_dock_eta_date: string;
  invoice_number: string;
  email: string;
  destination_manager_email: string;
  order_type: string;
  completed: boolean;
  status?: string;
}

export function useFetchOrders() {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .order("timestamp", { ascending: false });

        if (error) {
          throw error;
        }
        
        setOrders(data || []);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Optional: Set up a real-time subscription for live updates
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'orders'
      }, (payload) => {
        console.log('Real-time update:', payload);
        fetchOrders(); // Refetch all orders when any changes occur
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { orders, loading, error };
}

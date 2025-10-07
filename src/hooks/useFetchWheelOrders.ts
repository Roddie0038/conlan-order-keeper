
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { mapOrderRow } from "@/lib/mappers";

export interface WheelOrderRecord {
  id: string;
  timestamp: string;
  name: string;
  store: string;
  productnumber: string;
  wheeltype: string;
  wheelsize: string;
  desiredcolor: string;
  quantity: number;
  schedulearrival: string;
  notes: string;
  status: string;
  completed: boolean;
  completed_at?: string; // Added completed_at field
  ordertype: string;
}

export function useFetchWheelOrders() {
  const [orders, setOrders] = useState<WheelOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from("wheel_orders").select("*");
      
      // If not admin, filter by store
      if (user && !user.isAdmin && user.store) {
        query = query.eq("store", user.store);
      }
      
      const { data, error } = await query.order("timestamp", { ascending: false });

      if (error) {
        throw error;
      }
      
      setOrders((data || []).map(mapOrderRow) as any);
    } catch (err) {
      console.error("Error fetching wheel orders:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error(`Failed to load wheel orders: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return { orders, loading, error, refreshOrders: fetchOrders };
}

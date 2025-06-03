
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface WarrantyOrderRecord {
  id: string;
  created_at: string;
  name: string;
  store: string;
  dot_number: string;
  tire_type: string;
  tire_size: string;
  condition: string;
  notes: string;
  status: string;
  completed_at?: string; // Added completed_at field
  plant: string;
}

export function useFetchWarrantyOrders() {
  const [orders, setOrders] = useState<WarrantyOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from("warranty_orders").select("*");
      
      // If not admin, filter by store
      if (user && !user.isAdmin && user.store) {
        query = query.eq("store", user.store);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      
      setOrders(data as WarrantyOrderRecord[] || []);
    } catch (err) {
      console.error("Error fetching warranty orders:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error(`Failed to load warranty orders: ${err instanceof Error ? err.message : String(err)}`);
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

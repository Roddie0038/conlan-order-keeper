
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { mapOrderRow } from "@/lib/mappers";

export type WarrantyOrderRecord = {
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
  completed_at?: string;
  plant: string;
  out_of_stock?: boolean;
};

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
      
      setOrders((data || []).map((r: any) => ({
        id: String(r.id),
        created_at: r.created_at || "",
        name: r.submitted_by_name || r.name || "",
        store: r.store || "",
        dot_number: r.dot_number || "",
        tire_type: r.tire_type || "",
        tire_size: r.tire_size || "",
        condition: r.condition || "",
        notes: r.notes || "",
        status: r.status || "open",
        completed_at: r.completed_at || undefined,
        plant: r.plant || "",
        out_of_stock: r.out_of_stock || false
      })) as WarrantyOrderRecord[]);
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

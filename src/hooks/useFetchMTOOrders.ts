
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { mapOrderRow } from "@/lib/mappers";

export type MTOOrderRecord = {
  id: string;
  timestamp: string;
  name: string;
  store: string;
  product_number: string;
  casing_grade: string;
  tire_size: string;
  tread: string;
  quantity: number;
  projected_delivery: string;
  notes: string;
  status: string;
  completed: boolean;
  completed_at?: string;
  order_type: string;
};

export function useFetchMTOOrders() {
  const [orders, setOrders] = useState<MTOOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let query = supabase.from("mto_orders").select("*");
      
      // If not admin, filter by store
      if (user && !user.isAdmin && user.store) {
        query = query.eq("store", user.store);
      }
      
      const { data, error } = await query.order("timestamp", { ascending: false });

      if (error) {
        throw error;
      }
      
      setOrders((data || []).map((r: any) => ({
        id: String(r.id),
        timestamp: r.timestamp || r.created_at || "",
        name: r.submitted_by_name || r.name || "",
        store: r.store || "",
        product_number: r.product_number || "",
        casing_grade: r.casing_grade || "",
        tire_size: r.tire_size || "",
        tread: r.tread || "",
        quantity: Number(r.quantity) || 0,
        projected_delivery: r.projected_delivery || r.promised_date || "",
        notes: r.notes || "",
        status: r.status || "open",
        completed: r.status === "completed" || r.completed === true,
        completed_at: r.completed_at || undefined,
        order_type: r.order_type || "mto"
      })) as MTOOrderRecord[]);
    } catch (err) {
      console.error("Error fetching MTO orders:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error(`Failed to load MTO orders: ${err instanceof Error ? err.message : String(err)}`);
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

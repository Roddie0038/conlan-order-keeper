
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface OrderRecord {
  id: number; // Updated to explicitly be a number (BIGINT from database)
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
  out_of_stock?: boolean;
  plant?: string;
}

interface PaginationState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export function useFetchOrders(initialPageSize = 10) {
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    pageSize: initialPageSize,
    totalCount: 0,
    totalPages: 1
  });
  const { user } = useAuth();
  
  // Function to filter orders based on user role and store
  const shouldShowOrder = (order: OrderRecord) => {
    // Admin users can see all orders
    if (user?.isAdmin) return true;
    
    // Regular users can only see orders from their own store
    return user?.store && order.store === user.store;
  };

  const fetchOrders = async (page: number, pageSize: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // First, get the total count of records
      let countQuery = supabase
        .from("orders")
        .select("*", { count: "exact" });
      
      // If not admin, filter by store
      if (user && !user.isAdmin && user.store) {
        countQuery = countQuery.eq("store", user.store);
        console.log("🔍 ORDERS - Filtering orders for store:", user.store);
      }
      
      const { count: totalCount, error: countError } = await countQuery;
      
      if (countError) {
        throw countError;
      }
      
      const calculatedTotalCount = totalCount || 0;
      const totalPages = Math.ceil(calculatedTotalCount / pageSize);
      
      // Calculate the range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Now fetch the actual page of data with store filtering
      let dataQuery = supabase.from("orders").select("*");
      
      // If not admin, filter by store
      if (user && !user.isAdmin && user.store) {
        dataQuery = dataQuery.eq("store", user.store);
      }
      
      const { data, error } = await dataQuery
        .range(from, to)
        .order("timestamp", { ascending: false });

      if (error) {
        throw error;
      }
      
      // Update state with the fetched data and pagination info
      setOrders(data as OrderRecord[] || []);
      setPagination({
        page,
        pageSize,
        totalCount: calculatedTotalCount,
        totalPages
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(err instanceof Error ? err : new Error(String(err)));
      toast.error(`Failed to load orders: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to change page
  const goToPage = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    fetchOrders(page, pagination.pageSize);
  };

  // Function to change page size
  const setPageSize = (newPageSize: number) => {
    fetchOrders(1, newPageSize); // Reset to page 1 when changing page size
  };

  useEffect(() => {
    // Only fetch if we have user information
    if (user) {
      fetchOrders(pagination.page, pagination.pageSize);
      
      // Set up a real-time subscription for live updates
      const channel = supabase
        .channel('schema-db-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'orders'
        }, (payload) => {
          console.log('Real-time update:', payload);
          
          // Extract store from payload if it exists
          const payloadStore = payload.new && typeof payload.new === 'object' ? 
            (payload.new as { store?: string }).store : undefined;
          
          // For non-admins, only refresh if the update is for their store
          if (!user.isAdmin && payloadStore && payloadStore !== user.store) {
            console.log("Skipping refresh - update not relevant to current store");
            return;
          }
          
          // Refetch current page when changes occur
          fetchOrders(pagination.page, pagination.pageSize);
        })
        .subscribe((status) => {
          if (status !== 'SUBSCRIBED') {
            console.error('Failed to subscribe to real-time updates', status);
          }
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  return { 
    orders, 
    loading, 
    error, 
    pagination, 
    goToPage, 
    setPageSize,
    refreshOrders: () => fetchOrders(pagination.page, pagination.pageSize)
  };
}

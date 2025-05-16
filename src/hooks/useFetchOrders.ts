
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OrderRecord {
  id: string; // Add id to the interface since it's needed to identify orders
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

  const fetchOrders = async (page: number, pageSize: number) => {
    setLoading(true);
    setError(null);
    
    try {
      // First, get the total count of records
      const countResponse = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true });
      
      if (countResponse.error) {
        throw countResponse.error;
      }
      
      const totalCount = countResponse.count || 0;
      const totalPages = Math.ceil(totalCount / pageSize);
      
      // Calculate the range for pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      
      // Now fetch the actual page of data
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .range(from, to)
        .order("timestamp", { ascending: false });

      if (error) {
        throw error;
      }
      
      // Update state with the fetched data and pagination info
      setOrders(data || []);
      setPagination({
        page,
        pageSize,
        totalCount,
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
    // Initial fetch
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
  }, []);

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

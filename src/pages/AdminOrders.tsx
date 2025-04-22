
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// The updated Order type matches Supabase's snake_case schema.
type Order = {
  id?: string;
  store: string;
  product_number: string;
  description?: string;
  quantity: number;
  schedule_arrival?: string;
  notes?: string;
  cross_dock?: string;
  cross_dock_destination?: string;
  invoice_number?: string;
  completed?: boolean;
  send_invoice?: boolean;
  out_of_stock?: boolean;
  email?: string;
  pull_sheet?: string;
  order_completion_link?: string;
  send_email_message?: boolean;
  message?: string;
  created_at: string;
  timestamp?: string;
  name?: string;
};

export default function AdminOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.isAdmin) return;

    async function fetchOrders() {
      setLoading(true);
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching orders:", error);
        toast({
          title: "Error loading orders",
          description: error.message,
          variant: "destructive"
        });
      } else {
        // Directly use the Supabase data format (snake_case)
        setOrders((data || []) as Order[]);
      }
      setLoading(false);
    }

    fetchOrders();
  }, [user, toast]);

  if (!user?.isAdmin) {
    return (
      <div className="p-6 text-center text-red-600 font-semibold">
        You do not have permission to view this page.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">All Orders (Supabase)</h1>
      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Store</th>
              <th>Product Number</th>
              <th>Quantity</th>
              <th>Date Submitted</th>
              <th>Order Type</th>
              <th>Completed</th>
              <th>Send Invoice</th>
              <th>Notes</th>
              <th>Cross Dock</th>
              <th>Cross Dock Destination</th>
              <th>Invoice#</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order, idx) => (
              <tr key={`${order.store}-${idx}`} className="text-sm">
                <td>{order.store}</td>
                <td>{order.product_number}</td>
                <td>{order.quantity}</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>{order.description || "TRANSFER"}</td>
                <td>
                  {order.completed ? (
                    <Badge variant="success">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </td>
                <td>
                  {order.send_invoice ? (
                    <Badge variant="success">Yes</Badge>
                  ) : (
                    <Badge variant="outline">No</Badge>
                  )}
                </td>
                <td>{order.notes}</td>
                <td>{order.cross_dock}</td>
                <td>{order.cross_dock_destination}</td>
                <td>{order.invoice_number}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

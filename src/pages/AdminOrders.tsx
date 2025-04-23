
// New admin-only orders page, fetching from Supabase and displaying orders in a table.

import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ui/ProtectedRoute";

interface Order {
  Name: string;
  Store: string;
  "Product Number": string;
  Quantity: number;
  "Schedule Arrival": string;
  Notes: string;
  "Cross Dock": string;
  "Cross Dock Destination": string;
  "Invoice#": string;
  Completed?: boolean;
  SendInvoice?: boolean;
  OutOfStock?: boolean;
  Email?: string;
  created_at: string;
  type?: string;
}

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
        setOrders(data);
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
    <ProtectedRoute adminOnly>
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
                <tr key={`${order.Store}-${idx}`} className="text-sm">
                  <td>{order.Store}</td>
                  <td>{order["Product Number"]}</td>
                  <td>{order.Quantity}</td>
                  <td>{new Date(order.created_at).toLocaleString()}</td>
                  <td>{order.type || "TRANSFER"}</td>
                  <td>
                    {order.Completed ? (
                      <Badge variant="success">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </td>
                  <td>
                    {order.SendInvoice ? (
                      <Badge variant="success">Yes</Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </td>
                  <td>{order.Notes}</td>
                  <td>{order["Cross Dock"]}</td>
                  <td>{order["Cross Dock Destination"]}</td>
                  <td>{order["Invoice#"]}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </ProtectedRoute>
  );
}

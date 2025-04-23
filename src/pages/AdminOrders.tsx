
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ProtectedRoute } from "@/components/ui/ProtectedRoute";

// The updated Order type matches Supabase's snake_case schema
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

// Raw data type from Supabase
type RawOrder = {
  Store: string;
  "Product Number": string;
  Description?: string;
  Quantity: number;
  "Schedule Arrival"?: string;
  Notes?: string;
  "Cross Dock"?: string;
  "Cross Dock Destination"?: string;
  "Invoice#"?: string;
  Completed?: boolean;
  SendInvoice?: boolean;
  OutOfStock?: boolean;
  Email?: string;
  PullSheet?: string;
  OrderCompletionLink?: string;
  SendEmailMessage?: boolean;
  Message?: string;
  Timestamp: string;
  created_at: string;
  Name?: string;
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
        // Transform raw data to match our Order interface
        const transformedOrders = (data || []).map((rawOrder: RawOrder): Order => ({
          store: rawOrder.Store || "",
          product_number: rawOrder["Product Number"] || "",
          description: rawOrder.Description,
          quantity: rawOrder.Quantity || 0,
          schedule_arrival: rawOrder["Schedule Arrival"],
          notes: rawOrder.Notes,
          cross_dock: rawOrder["Cross Dock"],
          cross_dock_destination: rawOrder["Cross Dock Destination"],
          invoice_number: rawOrder["Invoice#"],
          completed: rawOrder.Completed,
          send_invoice: rawOrder.SendInvoice,
          out_of_stock: rawOrder.OutOfStock,
          email: rawOrder.Email,
          pull_sheet: rawOrder.PullSheet,
          order_completion_link: rawOrder.OrderCompletionLink,
          send_email_message: rawOrder.SendEmailMessage,
          message: rawOrder.Message,
          created_at: rawOrder.created_at, // Directly use created_at from Supabase
          timestamp: rawOrder.Timestamp,
          name: rawOrder.Name
        }));
        setOrders(transformedOrders);
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
    </ProtectedRoute>
  );
}


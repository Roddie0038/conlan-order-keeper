
import { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Order {
  id: string;
  timestamp: string;
  store: string;
  yourName?: string;
  productNumber?: string;
  description?: string;
  quantity?: string;
  type?: string;
  [key: string]: any;
}

const ORDER_SOURCES = [
  { key: "pendingOrders", label: "Pending", badge: "bg-yellow-500" },
  { key: "mtoOrders", label: "MTO", badge: "bg-blue-500" },
  { key: "wheelOrders", label: "Wheel", badge: "bg-purple-500" },
  { key: "completedOrders", label: "Completed", badge: "bg-green-500" }
];

const getOrdersFromStorage = (): Order[] => {
  let orders: Order[] = [];
  for (const src of ORDER_SOURCES) {
    const arr = JSON.parse(localStorage.getItem(src.key) || "[]");
    // Tag the order type for the list
    (arr as Order[]).forEach(o => ((o as any)._source = src.label));
    orders = orders.concat(arr as Order[]);
  }
  return orders;
};

export function RecentPortalOrders() {
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const allOrders = getOrdersFromStorage();
    const filtered = allOrders
      .filter(order => {
        if (!order.timestamp) return false;
        const date = new Date(order.timestamp);
        return date >= twoDaysAgo;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setRecentOrders(filtered);
  }, []);

  if (recentOrders.length === 0) {
    return (
      <div className="text-center p-6">
        <span className="text-gray-500">No orders submitted in the last two days.</span>
      </div>
    );
  }

  return (
    <div className="mb-10 rounded-lg border bg-card p-4">
      <h2 className="text-lg font-semibold mb-2">Orders Submitted to Portal (Last 2 Days)</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Product Number</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map(order => (
              <TableRow key={order.id}>
                <TableCell>{new Date(order.timestamp).toLocaleString()}</TableCell>
                <TableCell>{order.store}</TableCell>
                <TableCell>{order.yourName || order.name || ""}</TableCell>
                <TableCell>{order.productNumber}</TableCell>
                <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={
                    order.type === 'MTO' ? "bg-blue-100 text-blue-900 border-blue-400"
                      : order.type === 'WHEEL_POWDER_COATING' ? "bg-purple-100 text-purple-900 border-purple-400"
                      : "bg-green-100 text-green-900 border-green-400"
                  }>
                    {order.type === 'MTO' ? "MTO"
                      : order.type === 'WHEEL_POWDER_COATING' ? "Wheel"
                      : "Transfer"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={
                    order._source === "Pending" ? "bg-yellow-500"
                      : order._source === "MTO" ? "bg-blue-500"
                      : order._source === "Wheel" ? "bg-purple-500"
                      : "bg-green-500"
                  }>
                    {order._source}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

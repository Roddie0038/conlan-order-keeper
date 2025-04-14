
import { useEffect, useState } from 'react';
import { orderApi } from '@/api/orderApi';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export function RecentOrders() {
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = () => {
      const allOrdersResponse = orderApi.getAllOrders();
      if (allOrdersResponse.success && allOrdersResponse.data) {
        // Combine regular and MTO orders
        const combinedOrders = [
          ...allOrdersResponse.data.regular,
          ...allOrdersResponse.data.mto
        ]
        // Sort by timestamp descending and take last 5
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);
        
        setRecentOrders(combinedOrders);
      }
    };

    fetchOrders();
    // Set up an interval to refresh orders
    const interval = setInterval(fetchOrders, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  if (recentOrders.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        No recent orders found
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{new Date(order.timestamp).toLocaleString()}</TableCell>
                <TableCell>{order.store}</TableCell>
                <TableCell>{order.productNumber}</TableCell>
                <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={`${
                      order.type === 'MTO' 
                        ? 'bg-blue-100 text-blue-800 border-blue-300' 
                        : 'bg-green-100 text-green-800 border-green-300'
                    }`}
                  >
                    {order.type === 'MTO' ? 'MTO' : 'Transfer'}
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

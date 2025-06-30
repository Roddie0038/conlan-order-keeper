
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MessageSquare } from "lucide-react";

type OrderSource = "pending" | "mto" | "completed";

interface Order {
  id: string;
  timestamp: string;
  store: string;
  yourName: string;
  productNumber: string;
  description: string;
  quantity: string;
  source: OrderSource;
  [key: string]: any;
}

interface OrdersOverviewTableProps {
  filteredOrders: Order[];
  sortField: string;
  sortDirection: "asc" | "desc";
  setSortField: (field: string) => void;
  setSortDirection: (direction: "asc" | "desc") => void;
  onSendMessage: (order: Order) => void;
}

export function OrdersOverviewTable({
  filteredOrders,
  sortField,
  sortDirection,
  setSortField,
  setSortDirection,
  onSendMessage
}: OrdersOverviewTableProps) {
  const getBadgeColor = (source: OrderSource) => {
    switch(source) {
      case "pending": return "bg-yellow-500 hover:bg-yellow-600";
      case "mto": return "bg-blue-500 hover:bg-blue-600"; 
      case "completed": return "bg-green-500 hover:bg-green-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection(field === "timestamp" ? "desc" : "asc");
    }
  };

  return (
    <div className="border rounded-lg overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-200">
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort("timestamp")}
            >
              <div className="flex items-center">
                <Calendar size={14} className="mr-1" />
                Date
                {sortField === "timestamp" && (
                  <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                )}
              </div>
            </TableHead>
            <TableHead 
              className="cursor-pointer"
              onClick={() => handleSort("store")}
            >
              <div className="flex items-center">
                Store
                {sortField === "store" && (
                  <span className="ml-1">{sortDirection === "asc" ? "↑" : "↓"}</span>
                )}
              </div>
            </TableHead>
            <TableHead>Product Number</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No orders found
              </TableCell>
            </TableRow>
          ) : (
            filteredOrders.map(order => (
              <TableRow key={order.id}>
                <TableCell>{new Date(order.timestamp).toLocaleString()}</TableCell>
                <TableCell>{order.store}</TableCell>
                <TableCell>{order.productNumber}</TableCell>
                <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                <TableCell>{order.quantity}</TableCell>
                <TableCell>
                  <Badge className={`${getBadgeColor(order.source)}`}>
                    {order.source === "pending" ? "Pending" : 
                     order.source === "mto" ? "MTO" : "Completed"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSendMessage(order)}
                    className="flex items-center gap-1"
                  >
                    <MessageSquare className="h-3 w-3" />
                    Message
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}


import { useFetchOrders, OrderRecord } from "@/hooks/useFetchOrders";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function AllStoreOrders() {
  const { orders, loading, error } = useFetchOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStore, setFilterStore] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof OrderRecord>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-red-800 dark:text-red-400 font-medium">Error loading orders</h3>
        <p className="text-red-600 dark:text-red-300">{error.message}</p>
      </div>
    );
  }

  // Get unique list of stores for the filter
  const uniqueStores = [...new Set(orders.map(order => order.store))];

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        (order.product_number?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (order.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.store?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStore = filterStore === "all" || order.store === filterStore;
      
      return matchesSearch && matchesStore;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === bValue) return 0;
      
      if (aValue === null || aValue === undefined) return sortDirection === "asc" ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortDirection === "asc" ? 1 : -1;
      
      if (sortField === "timestamp") {
        // Handle timestamp sorting
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // For other types of values
      return sortDirection === "asc" 
        ? (aValue < bValue ? -1 : 1)
        : (bValue < aValue ? -1 : 1);
    });

  // Function to get status badge color
  const getStatusBadge = (status: string | undefined, completed: boolean) => {
    if (completed) return "bg-green-500 hover:bg-green-600";
    if (!status) return "bg-gray-500 hover:bg-gray-600";
    
    switch(status.toLowerCase()) {
      case "pending": return "bg-yellow-500 hover:bg-yellow-600";
      case "in_transit": return "bg-blue-500 hover:bg-blue-600";
      case "ready_to_ship": return "bg-purple-500 hover:bg-purple-600";
      case "received": return "bg-cyan-500 hover:bg-cyan-600";
      case "completed": return "bg-green-500 hover:bg-green-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Store Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-full md:w-1/3">
            <Input
              type="search"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Select value={filterStore} onValueChange={setFilterStore}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by store" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stores</SelectItem>
                {uniqueStores.map(store => (
                  <SelectItem key={store} value={store}>{store}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No orders found matching your criteria
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => {
                      if (sortField === "timestamp") {
                        setSortDirection(prev => prev === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("timestamp");
                        setSortDirection("desc");
                      }
                    }}
                  >
                    Timestamp {sortField === "timestamp" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => {
                      if (sortField === "name") {
                        setSortDirection(prev => prev === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("name");
                        setSortDirection("asc");
                      }
                    }}
                  >
                    Name {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => {
                      if (sortField === "store") {
                        setSortDirection(prev => prev === "asc" ? "desc" : "asc");
                      } else {
                        setSortField("store");
                        setSortDirection("asc");
                      }
                    }}
                  >
                    Store {sortField === "store" && (sortDirection === "asc" ? "↑" : "↓")}
                  </TableHead>
                  <TableHead>Product #</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order, index) => (
                  <TableRow key={index}>
                    <TableCell>{order.timestamp}</TableCell>
                    <TableCell>{order.name || 'N/A'}</TableCell>
                    <TableCell>{order.store || 'N/A'}</TableCell>
                    <TableCell>{order.product_number || 'N/A'}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{order.description || 'N/A'}</TableCell>
                    <TableCell>{order.quantity || 'N/A'}</TableCell>
                    <TableCell>{order.schedule_arrival || 'N/A'}</TableCell>
                    <TableCell>{order.order_type || 'Transfer'}</TableCell>
                    <TableCell>{order.cross_dock_destination || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(order.status, Boolean(order.completed))}>
                        {order.completed ? 'Completed' : (order.status || 'Pending')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

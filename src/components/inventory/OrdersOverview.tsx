
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Calendar } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";

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

export function OrdersOverview() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStore, setFilterStore] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortField, setSortField] = useState<string>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    // Load all orders from various sources
    const pendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]')
      .map((order: any) => ({ ...order, source: "pending" as OrderSource }));
    
    const mtoOrders = JSON.parse(localStorage.getItem('mtoOrders') || '[]')
      .map((order: any) => ({ ...order, source: "mto" as OrderSource }));
    
    const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]')
      .map((order: any) => ({ ...order, source: "completed" as OrderSource }));
    
    const allOrders = [...pendingOrders, ...mtoOrders, ...completedOrders];
    setOrders(allOrders);
  }, []);

  const stores = ["Fort Worth 22", "Grand Prairie 27", "Houston 28", "San Antonio 29", "Oklahoma 30", 
    "Little Rock 32", "Kansas 33", "Laredo 35", "Tulsa 36", "Austin 39"];

  const getBadgeColor = (source: OrderSource) => {
    switch(source) {
      case "pending": return "bg-yellow-500 hover:bg-yellow-600";
      case "mto": return "bg-blue-500 hover:bg-blue-600";
      case "completed": return "bg-green-500 hover:bg-green-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const sortOrders = (a: Order, b: Order) => {
    if (sortField === "timestamp") {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.productNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.store.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStore = filterStore === "all" || order.store === filterStore;
    const matchesType = filterType === "all" || order.source === filterType;
    
    return matchesSearch && matchesStore && matchesType;
  }).sort(sortOrders);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 w-full md:w-1/3">
          <Search className="text-gray-500" size={18} />
          <Input 
            placeholder="Search orders..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <Select value={filterStore} onValueChange={setFilterStore}>
            <SelectTrigger className="w-[150px] bg-white">
              <SelectValue placeholder="Filter by store" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map(store => (
                <SelectItem key={store} value={store}>{store}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[150px] bg-white">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="mto">MTO</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>

          <ExportButton 
            data={filteredOrders} 
            filename="all-orders" 
            variant="outline"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-200">
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
                onClick={() => {
                  if (sortField === "store") {
                    setSortDirection(prev => prev === "asc" ? "desc" : "asc");
                  } else {
                    setSortField("store");
                    setSortDirection("asc");
                  }
                }}
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

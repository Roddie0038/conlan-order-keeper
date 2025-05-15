
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, Search, Info, RefreshCw, Hourglass } from "lucide-react";
import { OrderDetailView } from "./OrderDetailView";
import { DatePickerWithRange } from "./DateRangePicker";
import { ExportButton } from "@/components/ExportButton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Mock data for demonstration
const mockOrders = [
  {
    id: "ORD-001",
    timestamp: "2025-05-14T10:30:00Z",
    store: "Fort Worth 22",
    storeManager: "John Smith",
    name: "Alex Johnson",
    email: "alex@example.com",
    productNumber: "PRD-12345",
    description: "High Performance All-Season Tire 225/60R17",
    quantity: "4",
    scheduleArrival: "2025-05-18",
    notes: "Customer waiting for these tires",
    type: "TRANSFER",
    status: "synced",
    priority: false
  },
  {
    id: "ORD-002",
    timestamp: "2025-05-13T15:45:00Z",
    store: "Grand Prairie 27",
    storeManager: "Maria Rodriguez",
    name: "Chris Wong",
    email: "chris@example.com",
    productNumber: "PRD-67890",
    description: "All Terrain Truck Tire LT265/70R17",
    quantity: "2",
    scheduleArrival: "2025-05-20",
    notes: "",
    type: "MTO",
    status: "pending",
    priority: true
  },
  {
    id: "ORD-003",
    timestamp: "2025-05-12T09:15:00Z",
    store: "Houston 28",
    storeManager: "Robert Chen",
    name: "Dana Smith",
    email: "dana@example.com",
    productNumber: "PRD-54321",
    description: "Performance Summer Tire 205/55R16",
    quantity: "4",
    scheduleArrival: "2025-05-17",
    notes: "Special order for fleet customer",
    type: "WHEEL_POWDER_COATING",
    status: "synced",
    priority: false
  }
];

export function AllStoreOrders() {
  const [orders, setOrders] = useState<any[]>(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState<any[]>(mockOrders);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStore, setFilterStore] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { user } = useAuth();

  // Stores list for filter dropdown
  const stores = [
    "Fort Worth 22", 
    "Grand Prairie 27", 
    "Houston 28", 
    "San Antonio 29", 
    "Oklahoma 30", 
    "Little Rock 32", 
    "Kansas 33", 
    "Laredo 35", 
    "Tulsa 36", 
    "Austin 39"
  ];

  // Filter orders based on all filter criteria
  useEffect(() => {
    let result = [...orders];

    // Apply search filter
    if (searchTerm) {
      const lowerCaseTerm = searchTerm.toLowerCase();
      result = result.filter(order => 
        order.productNumber.toLowerCase().includes(lowerCaseTerm) ||
        order.description.toLowerCase().includes(lowerCaseTerm) ||
        order.store.toLowerCase().includes(lowerCaseTerm) ||
        order.name.toLowerCase().includes(lowerCaseTerm)
      );
    }

    // Apply store filter
    if (filterStore !== "all") {
      result = result.filter(order => order.store === filterStore);
    }

    // Apply order type filter
    if (filterType !== "all") {
      result = result.filter(order => order.type === filterType);
    }

    // Apply date range filter
    if (dateRange?.from && dateRange?.to) {
      const fromDate = new Date(dateRange.from);
      const toDate = new Date(dateRange.to);
      toDate.setHours(23, 59, 59, 999); // End of the day

      result = result.filter(order => {
        const orderDate = new Date(order.timestamp);
        return orderDate >= fromDate && orderDate <= toDate;
      });
    }

    // Sort by priority (high to low) then by date (newest to oldest)
    result.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority ? -1 : 1;
      }
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    setFilteredOrders(result);
  }, [orders, searchTerm, filterStore, filterType, dateRange]);

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Store Orders</h1>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Info className="h-5 w-5 text-slate-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p className="max-w-xs">
                This view shows all orders from stores. Click on any order for detailed view and actions.
              </p>
            </TooltipContent>
          </Tooltip>
          
          <ExportButton 
            data={filteredOrders} 
            filename="all-store-orders" 
            variant="outline"
          />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by store, product, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-3">
          <Select value={filterStore} onValueChange={setFilterStore}>
            <SelectTrigger className="w-[180px] bg-white">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by store" />
              </div>
            </SelectTrigger>
            <SelectContent align="end" className="w-[180px]">
              <SelectItem value="all">All Stores</SelectItem>
              {stores.map(store => (
                <SelectItem key={store} value={store}>{store}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px] bg-white">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by type" />
              </div>
            </SelectTrigger>
            <SelectContent align="end" className="w-[180px]">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="TRANSFER">Transfer</SelectItem>
              <SelectItem value="MTO">MTO</SelectItem>
              <SelectItem value="WHEEL_POWDER_COATING">Wheel</SelectItem>
            </SelectContent>
          </Select>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-start text-left font-normal bg-white"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {new Date(dateRange.from).toLocaleDateString()} - {" "}
                      {new Date(dateRange.to).toLocaleDateString()}
                    </>
                  ) : (
                    new Date(dateRange.from).toLocaleDateString()
                  )
                ) : (
                  <span>Date Range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {selectedOrder ? (
        <OrderDetailView order={selectedOrder} onClose={closeOrderDetail} />
      ) : (
        <div className="bg-white shadow-sm rounded-lg border overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50 hover:bg-slate-100">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Store</TableHead>
                  <TableHead className="font-semibold">Product</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold">Qty</TableHead>
                  <TableHead className="font-semibold">Schedule</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No orders found matching your filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map(order => (
                    <TableRow 
                      key={order.id}
                      className={`hover:bg-slate-50 cursor-pointer ${order.priority ? 'bg-amber-50' : ''}`}
                      onClick={() => handleOrderClick(order)}
                    >
                      <TableCell className="font-medium">
                        {new Date(order.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell>{order.store}</TableCell>
                      <TableCell>{order.productNumber}</TableCell>
                      <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.scheduleArrival}</TableCell>
                      <TableCell>
                        {order.status === "synced" ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Synced
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                            <Hourglass className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            order.type === 'MTO' 
                              ? 'bg-blue-100 text-blue-800 border-blue-300' 
                              : order.type === 'WHEEL_POWDER_COATING'
                                ? 'bg-purple-100 text-purple-800 border-purple-300'
                                : 'bg-green-100 text-green-800 border-green-300'
                          }
                        >
                          {order.type === 'MTO' 
                            ? 'MTO' 
                            : order.type === 'WHEEL_POWDER_COATING'
                              ? 'Wheel'
                              : 'Transfer'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Placeholder for future functionality - not visible in UI */}
      <div className="hidden">
        <h3>Future Features (Not Implemented)</h3>
        <ul>
          <li>Activity logs (who triggered which action, and when)</li>
          <li>SMS notifications for new orders via Twilio</li>
          <li>Admin configuration of document templates and email content</li>
          <li>Full Supabase Edge Function integrations (for sending PDFs + emails)</li>
        </ul>
      </div>
    </div>
  );
}

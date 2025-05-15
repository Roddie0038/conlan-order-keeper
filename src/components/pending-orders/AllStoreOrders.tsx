import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Filter, Search, Info, RefreshCw } from "lucide-react";
import { OrderDetailView } from "@/components/orders/OrderDetailView";
import { DatePickerWithRange } from "./DateRangePicker";
import { ExportButton } from "@/components/ExportButton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

export function AllStoreOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStore, setFilterStore] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dateRange, setDateRange] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  // Fetch orders from Supabase
  useEffect(() => {
    async function fetchOrders() {
      setIsLoading(true);
      try {
        // First fetch regular orders
        const { data: regularOrders, error: regularError } = await supabase
          .from('orders')
          .select('*')
          .order('timestamp', { ascending: false });
          
        if (regularError) {
          console.error("Error fetching regular orders:", regularError);
          toast.error("Error fetching orders: " + regularError.message);
        }
        
        // Then fetch MTO orders
        const { data: mtoOrders, error: mtoError } = await supabase
          .from('mto_orders')
          .select('*')
          .order('timestamp', { ascending: false });
          
        if (mtoError) {
          console.error("Error fetching MTO orders:", mtoError);
          toast.error("Error fetching MTO orders: " + mtoError.message);
        }
        
        // Combine and normalize the orders
        const allOrders = [
          ...(regularOrders || []).map(order => ({
            ...order,
            type: order.order_type || "TRANSFER",
            productNumber: order.product_number,
            scheduleArrival: order.schedule_arrival
          })),
          ...(mtoOrders || []).map(order => ({
            ...order,
            type: "MTO",
            productNumber: order.product_number,
            scheduleArrival: order.projected_delivery
          }))
        ];
        
        // Sort by timestamp (most recent first) and set default status if missing
        const processedOrders = allOrders
          .map(order => ({
            ...order,
            timestamp: order.timestamp || new Date().toISOString(),
            status: order.status || "pending"
          }))
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        
        setOrders(processedOrders);
      } catch (error) {
        console.error("Error in fetchOrders:", error);
        toast.error("An unexpected error occurred while fetching orders");
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchOrders();
    
    // Set up realtime subscription for order updates
    const ordersChannel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('Orders change received!', payload);
          // Refresh the orders when changes occur
          fetchOrders();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'mto_orders' },
        (payload) => {
          console.log('MTO orders change received!', payload);
          // Refresh the orders when changes occur
          fetchOrders();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  // Filter orders based on all filter criteria
  useEffect(() => {
    let result = [...orders];

    // Apply search filter
    if (searchTerm) {
      const lowerCaseTerm = searchTerm.toLowerCase();
      result = result.filter(order => 
        (order.product_number || order.productNumber || "").toLowerCase().includes(lowerCaseTerm) ||
        (order.description || "").toLowerCase().includes(lowerCaseTerm) ||
        (order.store || "").toLowerCase().includes(lowerCaseTerm) ||
        (order.name || "").toLowerCase().includes(lowerCaseTerm)
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
    
    // Apply status filter
    if (filterStatus !== "all") {
      result = result.filter(order => order.status === filterStatus);
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
  }, [orders, searchTerm, filterStore, filterType, filterStatus, dateRange]);

  const handleOrderClick = (order: any) => {
    setSelectedOrder(order);
  };

  const closeOrderDetail = () => {
    setSelectedOrder(null);
  };

  const handleRefreshOrders = async () => {
    setIsLoading(true);
    try {
      // Fetch regular orders
      const { data: regularOrders, error: regularError } = await supabase
        .from('orders')
        .select('*')
        .order('timestamp', { ascending: false });
        
      if (regularError) throw regularError;
      
      // Fetch MTO orders
      const { data: mtoOrders, error: mtoError } = await supabase
        .from('mto_orders')
        .select('*')
        .order('timestamp', { ascending: false });
        
      if (mtoError) throw mtoError;
      
      // Combine and normalize the orders
      const allOrders = [
        ...(regularOrders || []).map(order => ({
          ...order,
          type: order.order_type || "TRANSFER",
          productNumber: order.product_number,
          scheduleArrival: order.schedule_arrival
        })),
        ...(mtoOrders || []).map(order => ({
          ...order,
          type: "MTO",
          productNumber: order.product_number,
          scheduleArrival: order.projected_delivery
        }))
      ];
      
      // Sort by timestamp (most recent first)
      const processedOrders = allOrders
        .map(order => ({
          ...order,
          timestamp: order.timestamp || new Date().toISOString(),
          status: order.status || "pending"
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setOrders(processedOrders);
      toast.success("Orders refreshed - Found " + processedOrders.length + " orders");
    } catch (error: any) {
      console.error("Error refreshing orders:", error);
      toast.error("Error refreshing orders: " + (error.message || "An unexpected error occurred"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">All Store Orders</h1>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleRefreshOrders}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
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
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[180px] bg-white">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <SelectValue placeholder="Filter by status" />
              </div>
            </SelectTrigger>
            <SelectContent align="end" className="w-[180px]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="ready_to_ship">Ready to Ship</SelectItem>
              <SelectItem value="in_transit">In Transit</SelectItem>
              <SelectItem value="received">Received</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
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
        <OrderDetailView 
          order={selectedOrder} 
          onClose={closeOrderDetail} 
          isAdmin={!!user?.isAdmin}
        />
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
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      Loading orders...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
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
                      <TableCell>{order.product_number || order.productNumber}</TableCell>
                      <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                      <TableCell>{order.quantity}</TableCell>
                      <TableCell>{order.schedule_arrival || order.scheduleArrival}</TableCell>
                      <TableCell>
                        <StatusBadge status={order.status || "pending"} />
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
    </div>
  );
}

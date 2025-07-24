
import { useState, useEffect } from "react";
import { MessageWarehouseDialog } from "@/components/messages/MessageWarehouseDialog";
import { useOrderMessages } from "@/hooks/useOrderMessages";
import { useMemoizedFilter } from "@/hooks/useMemoizedFilter";
import { useDebounce } from "@/hooks/useDebounce";
import { OrdersOverviewFilters } from "./OrdersOverviewFilters";
import { OrdersOverviewTable } from "./OrdersOverviewTable";

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
  
  // Message dialog state
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Message hooks for selected order
  const selectedOrderType = selectedOrder?.source === 'mto' ? 'mto_orders' : 'orders' as 'orders' | 'mto_orders' | 'wheel_orders';
  const { sending, sendMessage } = useOrderMessages(
    selectedOrder?.id || '',
    selectedOrderType
  );

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

  const stores = ["Fort Worth 022", "Grand Prairie 027", "Houston 028", "San Antonio 029", "Oklahoma City 030", 
    "Little Rock 032", "Kansas City 033", "Laredo 035", "Tulsa 036", "Austin 039"];

  // Memoized filtering for better performance
  const filteredOrders = useMemoizedFilter(
    orders,
    debouncedSearchTerm,
    (order, search) => {
      const matchesSearch = 
        order.productNumber.toLowerCase().includes(search) ||
        order.description.toLowerCase().includes(search) ||
        order.store.toLowerCase().includes(search);
      
      const matchesStore = filterStore === "all" || order.store === filterStore;
      const matchesType = filterType === "all" || order.source === filterType;
      
      return matchesSearch && matchesStore && matchesType;
    }
  ).sort((a, b) => {
    if (sortField === "timestamp") {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }
    
    if (a[sortField] < b[sortField]) return sortDirection === "asc" ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const handleSendMessage = (order: Order) => {
    setSelectedOrder(order);
    setShowMessageDialog(true);
  };

  const handleSendMessageSubmit = async (messageText: string): Promise<boolean> => {
    if (!selectedOrder) return false;
    
    const success = await sendMessage(messageText);
    if (success) {
      setShowMessageDialog(false);  
      setSelectedOrder(null);
    }
    return success;
  };

  return (
    <div className="space-y-4">
      <OrdersOverviewFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStore={filterStore}
        setFilterStore={setFilterStore}
        filterType={filterType}
        setFilterType={setFilterType}
        stores={stores}
        filteredOrders={filteredOrders}
      />

      <OrdersOverviewTable
        filteredOrders={filteredOrders}
        sortField={sortField}
        sortDirection={sortDirection}
        setSortField={setSortField}
        setSortDirection={setSortDirection}
        onSendMessage={handleSendMessage}
      />

      {/* Message Dialog */}
      {selectedOrder && (
        <MessageWarehouseDialog
          open={showMessageDialog}
          onOpenChange={setShowMessageDialog}
          orderNumber={String(selectedOrder.id)}
          storeName={selectedOrder.store}
          onSendMessage={handleSendMessageSubmit}
          sending={sending}
        />
      )}
    </div>
  );
}


import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useOrdersManager } from "@/hooks/useOrdersManager";
import { OrderManagementHeader } from "./order-management/components/OrderManagementHeader";
import { OrderManagementControls } from "./order-management/components/OrderManagementControls";
import { OrderManagementTabs } from "./order-management/components/OrderManagementTabs";
import { combineOrders } from "./order-management/utils/orderCombiner";
import { useDebounce } from "@/hooks/useDebounce";

export default function OrderManagement() {
  const { user } = useAuth();
  const { orders, loading, error, refreshAllOrders } = useOrdersManager();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("timestamp");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Debounce search for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center relative" 
        style={{
          backgroundImage: 'url("/lovable-uploads/061bc791-3377-4911-8269-c0fed6642b6a.png")'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="flex items-center justify-center min-h-[400px] relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg font-medium text-white">Loading orders...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center relative" 
        style={{
          backgroundImage: 'url("/lovable-uploads/061bc791-3377-4911-8269-c0fed6642b6a.png")'
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg relative z-10">
          <h3 className="text-red-800 dark:text-red-400 font-medium">Error loading orders</h3>
          <p className="text-red-600 dark:text-red-300">{error.message}</p>
        </div>
      </div>
    );
  }

  // Combine all orders into a unified format
  const allOrders = combineOrders(
    orders.transfer, 
    orders.mto, 
    orders.wheel, 
    orders.warranty
  );

  // Filter orders based on debounced search term
  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = 
      order.productNumber?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      order.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      order.store?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      order.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    
    return matchesSearch;
  });

  // Separate pending and completed orders
  const pendingOrders = filteredOrders.filter(order => !order.completed);
  const completedOrders = filteredOrders.filter(order => order.completed);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative" 
      style={{
        backgroundImage: 'url("/lovable-uploads/061bc791-3377-4911-8269-c0fed6642b6a.png")'
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="container py-8 relative z-10">
        <Card className="p-6 bg-white/90 shadow-lg rounded-xl backdrop-blur-sm border border-gray-200">
          <OrderManagementHeader />
          
          <CardContent className="p-0">
            <OrderManagementControls
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              refreshAllOrders={refreshAllOrders}
              allOrders={allOrders}
            />
            
            <OrderManagementTabs
              pendingOrders={pendingOrders}
              completedOrders={completedOrders}
              sortField={sortField}
              sortDirection={sortDirection}
              handleSort={handleSort}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

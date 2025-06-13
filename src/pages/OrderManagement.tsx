
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useFetchOrders } from "@/hooks/useFetchOrders";
import { useFetchMTOOrders } from "@/hooks/useFetchMTOOrders";
import { useFetchWheelOrders } from "@/hooks/useFetchWheelOrders";
import { useFetchWarrantyOrders } from "@/hooks/useFetchWarrantyOrders";
import { OrderManagementHeader } from "./order-management/components/OrderManagementHeader";
import { OrderManagementControls } from "./order-management/components/OrderManagementControls";
import { OrderManagementTabs } from "./order-management/components/OrderManagementTabs";
import { MessagingHelpBanner } from "./order-management/components/MessagingHelpBanner";
import { MessagingHelpButton } from "./order-management/components/MessagingHelpButton";
import { combineOrders } from "./order-management/utils/orderCombiner";

export default function OrderManagement() {
  const { user } = useAuth();
  
  // Fetch all order types
  const { orders: transferOrders, loading: transferLoading, refreshOrders: refreshTransfer } = useFetchOrders();
  const { orders: mtoOrders, loading: mtoLoading, refreshOrders: refreshMTO } = useFetchMTOOrders();
  const { orders: wheelOrders, loading: wheelLoading, refreshOrders: refreshWheel } = useFetchWheelOrders();
  const { orders: warrantyOrders, loading: warrantyLoading, refreshOrders: refreshWarranty } = useFetchWarrantyOrders();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("timestamp");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const loading = transferLoading || mtoLoading || wheelLoading || warrantyLoading;

  // Combine all orders into a unified format
  const allOrders = combineOrders(transferOrders, mtoOrders, wheelOrders, warrantyOrders);

  // Filter orders based on search term
  const filteredOrders = allOrders.filter(order => {
    const matchesSearch = 
      order.productNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.store?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const refreshAllOrders = () => {
    refreshTransfer();
    refreshMTO();
    refreshWheel();
    refreshWarranty();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center" style={{
        backgroundImage: 'url("/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png")',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backgroundBlendMode: 'overlay'
      }}>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-lg font-medium text-white">Loading orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{
      backgroundImage: 'url("/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png")',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backgroundBlendMode: 'overlay'
    }}>
      <div className="container py-8">
        <Card className="p-6 bg-white/90 shadow-lg rounded-xl backdrop-blur-sm border border-gray-200">
          <OrderManagementHeader />
          
          {/* Messaging Help Banner */}
          <MessagingHelpBanner />
          
          <CardContent className="p-0">
            {/* Help Button in Controls Section */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex-1">
                <OrderManagementControls
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  refreshAllOrders={refreshAllOrders}
                  allOrders={allOrders}
                />
              </div>
              <div className="ml-4">
                <MessagingHelpButton />
              </div>
            </div>
            
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

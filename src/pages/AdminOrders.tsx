
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Search } from "lucide-react";
import { useFetchOrders } from "@/hooks/useFetchOrders";
import { OrderRecord } from "@/types/orders";
import { OrdersTable } from "@/components/pending-orders/OrdersTable";
import { OrderDetailView } from "@/components/orders/OrderDetailView";
import { OrderStatus } from "@/components/orders/StatusBadge";
import { supabase } from "@/integrations/supabase/client";

export default function AdminOrders() {
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<keyof OrderRecord>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [filterType, setFilterType] = useState<string>("all");
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Break the deep type inference chain with explicit typing
  const { 
    orders, 
    loading, 
    error, 
    pagination, 
    goToPage, 
    setPageSize,
    refreshOrders 
  } = useFetchOrders(20); // Fetch more orders per page for admin view
  
  // Find the selected order using explicit typing to avoid deep instantiation
  const selectedOrder = selectedOrderId ? orders.find(order => order.id === selectedOrderId) || null : null;

  const handleOrderClick = (orderId: number) => {
    setSelectedOrderId(orderId);
  };
  
  const handleCloseOrderDetails = () => {
    setSelectedOrderId(null);
  };
  
  const handleStatusChange = async (orderId: number, newStatus: OrderStatus) => {
    try {
      // Update the status in the database
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus,
          status_updated_at: new Date().toISOString(),
          ...(newStatus === 'out_of_stock' ? { out_of_stock: true } : {}),
          ...(newStatus === 'ready_to_ship' ? { 
            ready_to_ship_at: new Date().toISOString(),
            out_of_stock: false 
          } : {}),
          ...(newStatus === 'in_transit' ? { in_transit_at: new Date().toISOString() } : {}),
          ...(newStatus === 'received' ? { received_at: new Date().toISOString() } : {}),
          ...(newStatus === 'completed' ? { 
            completed_at: new Date().toISOString(),
            completed: true 
          } : {})
        })
        .eq('id', orderId);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Status Updated",
        description: `Order status updated to ${newStatus.replace(/_/g, ' ')}`,
      });
      
      // Refresh orders to show the updated status
      refreshOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        title: "Error",
        description: "Failed to update order status. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Filter orders by order type if filter is set
  const filteredOrders = orders.filter(order => {
    // Safety check for null values
    if (!order) return false;
    
    // Search filter
    const matchesSearch = 
      (order.product_number?.toLowerCase().includes(searchTerm.toLowerCase())) || 
      (order.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.store?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Order type filter
    const matchesType = filterType === "all" || 
      (filterType === "regular" && (!order.order_type || order.order_type === "TRANSFER")) ||
      (filterType === "mto" && order.order_type === "MTO") ||
      (filterType === "wheel" && order.order_type === "WHEEL_POWDER_COATING") ||
      (filterType === "cross-dock" && order.cross_dock_type === "Yes");
    
    return matchesSearch && matchesType;
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-6 w-6" />
              Access Restricted
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              This page is only accessible to administrators.
            </p>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white py-8">
      <div className="container mx-auto px-4">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Order Management</h1>
          <p className="text-slate-300">View, search, and manage all orders from a central dashboard.</p>
        </header>

        <div className="space-y-6">
          {/* Search and Filter Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="w-full md:w-1/3">
              <label htmlFor="search" className="block text-sm font-medium text-slate-300 mb-1">
                Search Orders
              </label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Search by product, store, name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
            
            <div className="w-full md:w-auto flex-1">
              <Tabs 
                defaultValue="all" 
                value={filterType}
                onValueChange={setFilterType}
                className="w-full"
              >
                <TabsList className="grid grid-cols-2 md:grid-cols-5 bg-slate-800">
                  <TabsTrigger value="all">All Orders</TabsTrigger>
                  <TabsTrigger value="regular">Regular Orders</TabsTrigger>
                  <TabsTrigger value="mto">MTO Orders</TabsTrigger>
                  <TabsTrigger value="wheel">Wheel Orders</TabsTrigger>
                  <TabsTrigger value="cross-dock">Cross-Dock</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
            {selectedOrder ? (
              <div className="p-4">
                <OrderDetailView 
                  order={selectedOrder} 
                  onClose={handleCloseOrderDetails} 
                  isAdmin={true}
                  onStatusChange={handleStatusChange}
                />
              </div>
            ) : (
              <div>
                <OrdersTable 
                  orders={filteredOrders}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  setSortField={setSortField}
                  setSortDirection={setSortDirection}
                  pagination={pagination}
                  goToPage={goToPage}
                  onRowClick={handleOrderClick}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

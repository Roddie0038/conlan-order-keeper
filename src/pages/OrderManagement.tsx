
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ArrowDownUp, CheckCircle, Trash2, FileText, Loader2 } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useFetchOrders } from "@/hooks/useFetchOrders";
import { useFetchMTOOrders } from "@/hooks/useFetchMTOOrders";
import { useFetchWheelOrders } from "@/hooks/useFetchWheelOrders";
import { useFetchWarrantyOrders } from "@/hooks/useFetchWarrantyOrders";

// Combined order type for unified display
interface CombinedOrder {
  id: string;
  timestamp: string;
  name: string;
  store: string;
  productNumber: string;
  description: string;
  quantity: number;
  scheduleArrival: string;
  notes: string;
  status: string;
  completed: boolean;
  orderType: 'Transfer' | 'MTO' | 'Wheel' | 'Warranty';
  completedAt?: string;
  completedBy?: string;
}

export default function OrderManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  
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
  const combineOrders = (): CombinedOrder[] => {
    const combined: CombinedOrder[] = [];

    // Transfer orders
    transferOrders.forEach(order => {
      combined.push({
        id: `transfer-${order.id}`,
        timestamp: order.timestamp,
        name: order.name,
        store: order.store,
        productNumber: order.product_number,
        description: order.description,
        quantity: order.quantity,
        scheduleArrival: order.schedule_arrival,
        notes: order.notes,
        status: order.status || 'pending',
        completed: order.completed || false,
        orderType: 'Transfer',
        completedAt: order.completed_at,
      });
    });

    // MTO orders
    mtoOrders.forEach(order => {
      combined.push({
        id: `mto-${order.id}`,
        timestamp: order.timestamp,
        name: order.name,
        store: order.store,
        productNumber: order.product_number,
        description: `${order.tire_size} - ${order.tread}`,
        quantity: order.quantity,
        scheduleArrival: order.projected_delivery,
        notes: order.notes,
        status: order.status || 'pending',
        completed: order.completed || false,
        orderType: 'MTO',
      });
    });

    // Wheel orders
    wheelOrders.forEach(order => {
      combined.push({
        id: `wheel-${order.id}`,
        timestamp: order.timestamp,
        name: order.name,
        store: order.store,
        productNumber: order.productnumber,
        description: `${order.wheeltype} - ${order.wheelsize} - ${order.desiredcolor}`,
        quantity: order.quantity,
        scheduleArrival: order.schedulearrival,
        notes: order.notes,
        status: order.status || 'pending',
        completed: order.completed || false,
        orderType: 'Wheel',
      });
    });

    // Warranty orders
    warrantyOrders.forEach(order => {
      combined.push({
        id: `warranty-${order.id}`,
        timestamp: order.created_at,
        name: order.name,
        store: order.store,
        productNumber: order.dot_number,
        description: `${order.tire_type} - ${order.tire_size}`,
        quantity: 1, // Warranty orders are typically single items
        scheduleArrival: 'N/A',
        notes: order.notes,
        status: order.status || 'open',
        completed: order.status === 'completed',
        orderType: 'Warranty',
      });
    });

    return combined;
  };

  const allOrders = combineOrders();

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

  // Sort orders
  const sortOrders = (orders: CombinedOrder[]) => {
    return [...orders].sort((a, b) => {
      let valueA = a[sortField as keyof CombinedOrder];
      let valueB = b[sortField as keyof CombinedOrder];
      
      if (valueA === undefined || valueA === null) valueA = '';
      if (valueB === undefined || valueB === null) valueB = '';
      
      const strA = String(valueA).toLowerCase();
      const strB = String(valueB).toLowerCase();
      
      if (sortField === 'timestamp') {
        try {
          const dateA = new Date(strA);
          const dateB = new Date(strB);
          
          if (sortDirection === 'asc') {
            return dateA.getTime() - dateB.getTime();
          } else {
            return dateB.getTime() - dateA.getTime();
          }
        } catch (e) {
          // Fall back to string comparison
        }
      }
      
      if (sortDirection === 'asc') {
        return strA.localeCompare(strB);
      } else {
        return strB.localeCompare(strA);
      }
    });
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getBadgeColor = (orderType: string) => {
    switch(orderType) {
      case "Transfer": return "bg-blue-500 hover:bg-blue-600";
      case "MTO": return "bg-purple-500 hover:bg-purple-600";
      case "Wheel": return "bg-green-500 hover:bg-green-600";
      case "Warranty": return "bg-orange-500 hover:bg-orange-600";
      default: return "bg-gray-500 hover:bg-gray-600";
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
          <CardHeader className="pb-4 mb-4 border-b border-gray-200">
            <CardTitle className="text-center font-bold text-4xl text-primary">Order Management</CardTitle>
            <p className="text-center text-muted-foreground">
              {user?.isAdmin ? "View and manage all orders" : `View orders for ${user?.store || "your store"}`}
            </p>
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-col w-full md:w-1/3">
                <Label htmlFor="search" className="text-slate-700 mb-1 font-medium">Search Orders</Label>
                <div className="flex">
                  <Input
                    id="search"
                    placeholder="Search by product, store, name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white border-slate-300"
                  />
                  <Button variant="secondary" className="ml-2 bg-slate-200 hover:bg-slate-300">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={refreshAllOrders}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Refresh
                </Button>
                
                <ExportButton 
                  data={allOrders} 
                  filename="all-orders" 
                  variant="default"
                  className="self-end bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Export All Orders
                </ExportButton>
              </div>
            </div>
            
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 p-1 rounded-lg">
                <TabsTrigger value="pending" className="text-base py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Pending Orders ({pendingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-base py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Completed Orders ({completedOrders.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-200">
                      <TableRow>
                        <TableHead 
                          className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
                          onClick={() => handleSort('timestamp')}
                        >
                          <div className="flex items-center">
                            Date <ArrowDownUp className="ml-1 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
                          onClick={() => handleSort('store')}
                        >
                          <div className="flex items-center">
                            Store <ArrowDownUp className="ml-1 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">Type</TableHead>
                        <TableHead className="font-semibold text-slate-700">Product</TableHead>
                        <TableHead className="font-semibold text-slate-700">Description</TableHead>
                        <TableHead className="font-semibold text-slate-700">Quantity</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortOrders(pendingOrders).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                            No pending orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortOrders(pendingOrders).map((order, index) => (
                          <TableRow key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <TableCell>{new Date(order.timestamp).toLocaleDateString()}</TableCell>
                            <TableCell>{order.store}</TableCell>
                            <TableCell>
                              <Badge className={`${getBadgeColor(order.orderType)} text-white`}>
                                {order.orderType}
                              </Badge>
                            </TableCell>
                            <TableCell>{order.productNumber}</TableCell>
                            <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                            <TableCell>{order.quantity}</TableCell>
                            <TableCell>
                              <Badge variant={order.status === 'pending' ? 'secondary' : 'default'}>
                                {order.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="completed">
                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-200">
                      <TableRow>
                        <TableHead className="font-semibold text-slate-700">Date Completed</TableHead>
                        <TableHead className="font-semibold text-slate-700">Store</TableHead>
                        <TableHead className="font-semibold text-slate-700">Type</TableHead>
                        <TableHead className="font-semibold text-slate-700">Product</TableHead>
                        <TableHead className="font-semibold text-slate-700">Description</TableHead>
                        <TableHead className="font-semibold text-slate-700">Quantity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortOrders(completedOrders).length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                            No completed orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortOrders(completedOrders).map((order, index) => (
                          <TableRow key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <TableCell>{order.completedAt ? new Date(order.completedAt).toLocaleString() : 'N/A'}</TableCell>
                            <TableCell>{order.store}</TableCell>
                            <TableCell>
                              <Badge className={`${getBadgeColor(order.orderType)} text-white`}>
                                {order.orderType}
                              </Badge>
                            </TableCell>
                            <TableCell>{order.productNumber}</TableCell>
                            <TableCell className="max-w-xs truncate">{order.description}</TableCell>
                            <TableCell>{order.quantity}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ArrowDownUp, CheckCircle, Trash2, FileText } from "lucide-react";
import { ExportButton } from "@/components/ExportButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Order {
  id: string;
  timestamp: string;
  yourName: string;
  store: string;
  dateReceived: string;
  productNumber: string;
  description: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
  crossDock: string;
}

interface MTOOrder {
  id: string;
  timestamp: string;
  store: string;
  name: string;
  productNumber: string;
  casingGrade: string;
  tireSize: string;
  tireTreadNeeded: string;
  quantity: string;
  scheduleArrival: string;
  notes: string;
}

interface CompletedOrder {
  id: string;
  timestamp: string;
  yourName?: string;
  name?: string;
  store: string;
  dateReceived?: string;
  productNumber: string;
  description?: string;
  tireSize?: string;
  tireTreadNeeded?: string;
  quantity: string;
  scheduleArrival: string;
  notes?: string;
  crossDock?: string;
  completedAt: string;
  completedBy?: string;
}

export default function OrderManagement() {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [mtoOrders, setMtoOrders] = useState<MTOOrder[]>([]);
  const [completedOrders, setCompletedOrders] = useState<CompletedOrder[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("timestamp");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [completedSortField, setCompletedSortField] = useState<string>("completedAt");
  const [completedSortDirection, setCompletedSortDirection] = useState<'asc' | 'desc'>('desc');

  // Load orders from localStorage
  useEffect(() => {
    const loadOrders = () => {
      // Load pending orders
      const savedPendingOrders = localStorage.getItem('pendingOrders');
      const savedMtoOrders = localStorage.getItem('mtoOrders');
      const savedCompletedOrders = localStorage.getItem('completedOrders');

      if (savedPendingOrders) {
        setPendingOrders(JSON.parse(savedPendingOrders));
      }
      if (savedMtoOrders) {
        setMtoOrders(JSON.parse(savedMtoOrders));
      }
      if (savedCompletedOrders) {
        // If user is admin, show all orders; otherwise filter by store
        const allCompletedOrders = JSON.parse(savedCompletedOrders);
        const filteredOrders = user?.isAdmin 
          ? allCompletedOrders 
          : allCompletedOrders.filter((order: CompletedOrder) => order.store === user?.store);
        setCompletedOrders(filteredOrders);
      }
    };

    loadOrders();
    window.addEventListener('storage', loadOrders);
    return () => window.removeEventListener('storage', loadOrders);
  }, [user?.store, user?.isAdmin]);

  // Handle pending order completion
  const handleComplete = (orderId: string, type: 'regular' | 'mto') => {
    if (!user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admin users can complete orders.",
        variant: "destructive"
      });
      return;
    }

    if (type === 'regular') {
      const allPendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
      const orderToComplete = allPendingOrders.find((o: Order) => o.id === orderId);
      if (orderToComplete) {
        const completedOrdersList = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        completedOrdersList.push({
          ...orderToComplete,
          completedAt: new Date().toISOString(),
          completedBy: user.username || 'Admin'
        });
        localStorage.setItem('completedOrders', JSON.stringify(completedOrdersList));
        const updatedPendingOrders = allPendingOrders.filter((o: Order) => o.id !== orderId);
        localStorage.setItem('pendingOrders', JSON.stringify(updatedPendingOrders));
        setPendingOrders(updatedPendingOrders);
        setCompletedOrders(user?.isAdmin ? completedOrdersList : completedOrdersList.filter((order: CompletedOrder) => order.store === user?.store));
      }
    } else {
      const allMtoOrders = JSON.parse(localStorage.getItem('mtoOrders') || '[]');
      const orderToComplete = allMtoOrders.find((o: MTOOrder) => o.id === orderId);
      if (orderToComplete) {
        const completedOrdersList = JSON.parse(localStorage.getItem('completedOrders') || '[]');
        completedOrdersList.push({
          ...orderToComplete,
          completedAt: new Date().toISOString(),
          completedBy: user.username || 'Admin'
        });
        localStorage.setItem('completedOrders', JSON.stringify(completedOrdersList));
        const updatedMtoOrders = allMtoOrders.filter((o: MTOOrder) => o.id !== orderId);
        localStorage.setItem('mtoOrders', JSON.stringify(updatedMtoOrders));
        setMtoOrders(updatedMtoOrders);
        setCompletedOrders(user?.isAdmin ? completedOrdersList : completedOrdersList.filter((order: CompletedOrder) => order.store === user?.store));
      }
    }
    
    toast({
      title: "Order Completed",
      description: "The order has been marked as complete."
    });
  };

  // Handle pending order deletion
  const handleDeletePending = (orderId: string, type: 'regular' | 'mto') => {
    if (!user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admin users can delete orders.",
        variant: "destructive"
      });
      return;
    }

    if (type === 'regular') {
      const updatedOrders = pendingOrders.filter(order => order.id !== orderId);
      localStorage.setItem('pendingOrders', JSON.stringify(updatedOrders));
      setPendingOrders(updatedOrders);
    } else {
      const updatedMtoOrders = mtoOrders.filter(order => order.id !== orderId);
      localStorage.setItem('mtoOrders', JSON.stringify(updatedMtoOrders));
      setMtoOrders(updatedMtoOrders);
    }
    
    toast({
      title: "Order Deleted",
      description: "The order has been successfully deleted."
    });
  };

  // Handle completed order deletion
  const handleDeleteCompleted = (orderId: string) => {
    if (!user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admin users can delete completed orders.",
        variant: "destructive"
      });
      return;
    }

    const allCompletedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
    const updatedOrders = allCompletedOrders.filter((order: CompletedOrder) => order.id !== orderId);
    localStorage.setItem('completedOrders', JSON.stringify(updatedOrders));
    
    // Update displayed orders
    const filteredOrders = user?.isAdmin 
      ? updatedOrders 
      : updatedOrders.filter((order: CompletedOrder) => order.store === user?.store);
    setCompletedOrders(filteredOrders);

    toast({
      title: "Order Deleted",
      description: "The completed order has been successfully deleted."
    });
  };

  // Filter pending orders based on search term
  const filteredPendingOrders = pendingOrders.filter(order => 
    (order.productNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (order.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (order.store?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  const filteredMtoOrders = mtoOrders.filter(order => 
    (order.productNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (order.tireSize?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (order.store?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  // Filter completed orders based on search term
  const filteredCompletedOrders = completedOrders.filter(order => 
    (order.productNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (order.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (order.store?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (order.yourName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (order.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  // Sort pending orders
  const sortedPendingOrders = [...filteredPendingOrders].sort((a, b) => {
    let valueA = a[sortField as keyof Order];
    let valueB = b[sortField as keyof Order];
    
    if (valueA === undefined || valueA === null) valueA = '';
    if (valueB === undefined || valueB === null) valueB = '';
    
    const strA = String(valueA).toLowerCase();
    const strB = String(valueB).toLowerCase();
    
    if (sortField === 'timestamp' || sortField === 'dateReceived') {
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

  // Sort completed orders
  const sortedCompletedOrders = [...filteredCompletedOrders].sort((a, b) => {
    let valueA = a[completedSortField as keyof CompletedOrder];
    let valueB = b[completedSortField as keyof CompletedOrder];
    
    if (valueA === undefined || valueA === null) valueA = '';
    if (valueB === undefined || valueB === null) valueB = '';
    
    const strA = String(valueA).toLowerCase();
    const strB = String(valueB).toLowerCase();
    
    if (completedSortField === 'completedAt' || completedSortField === 'dateReceived' || completedSortField === 'timestamp') {
      try {
        const dateA = new Date(strA);
        const dateB = new Date(strB);
        
        if (completedSortDirection === 'asc') {
          return dateA.getTime() - dateB.getTime();
        } else {
          return dateB.getTime() - dateA.getTime();
        }
      } catch (e) {
        // Fall back to string comparison
      }
    }
    
    if (completedSortDirection === 'asc') {
      return strA.localeCompare(strB);
    } else {
      return strB.localeCompare(strA);
    }
  });

  // Handle sorting for pending orders
  const handlePendingSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle sorting for completed orders
  const handleCompletedSort = (field: string) => {
    if (completedSortField === field) {
      setCompletedSortDirection(completedSortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setCompletedSortField(field);
      setCompletedSortDirection('desc');
    }
  };

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
              
              <ExportButton 
                data={[...pendingOrders, ...mtoOrders, ...completedOrders]} 
                filename="all-orders" 
                variant="default"
                className="self-end bg-blue-600 hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Export All Orders
              </ExportButton>
            </div>
            
            <Tabs defaultValue="pending" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 p-1 rounded-lg">
                <TabsTrigger value="pending" className="text-base py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Pending Orders
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-base py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                  Completed Orders
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pending">
                <Tabs defaultValue="regular" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6 bg-slate-100 p-1 rounded-lg">
                    <TabsTrigger value="regular" className="text-base py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                      Regular Orders
                    </TabsTrigger>
                    <TabsTrigger value="mto" className="text-base py-2 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                      MTO Orders
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="regular">
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <Table>
                        <TableHeader className="bg-slate-200">
                          <TableRow>
                            <TableHead 
                              className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
                              onClick={() => handlePendingSort('dateReceived')}
                            >
                              <div className="flex items-center">
                                Date <ArrowDownUp className="ml-1 h-3 w-3" />
                              </div>
                            </TableHead>
                            <TableHead 
                              className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
                              onClick={() => handlePendingSort('store')}
                            >
                              <div className="flex items-center">
                                Store <ArrowDownUp className="ml-1 h-3 w-3" />
                              </div>
                            </TableHead>
                            <TableHead 
                              className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
                              onClick={() => handlePendingSort('productNumber')}
                            >
                              <div className="flex items-center">
                                Product <ArrowDownUp className="ml-1 h-3 w-3" />
                              </div>
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">Description</TableHead>
                            <TableHead 
                              className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
                              onClick={() => handlePendingSort('quantity')}
                            >
                              <div className="flex items-center">
                                Quantity <ArrowDownUp className="ml-1 h-3 w-3" />
                              </div>
                            </TableHead>
                            <TableHead className="font-semibold text-slate-700">Schedule</TableHead>
                            {user?.isAdmin && <TableHead className="font-semibold text-slate-700">Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedPendingOrders.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={user?.isAdmin ? 7 : 6} className="text-center py-8 text-slate-500">
                                No pending orders found
                              </TableCell>
                            </TableRow>
                          ) : (
                            sortedPendingOrders.map((order, index) => (
                              <TableRow key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <TableCell>{new Date(order.dateReceived).toLocaleDateString()}</TableCell>
                                <TableCell>{order.store}</TableCell>
                                <TableCell>{order.productNumber}</TableCell>
                                <TableCell>{order.description}</TableCell>
                                <TableCell>{order.quantity}</TableCell>
                                <TableCell>{order.scheduleArrival}</TableCell>
                                {user?.isAdmin && (
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="default" 
                                        size="sm" 
                                        onClick={() => handleComplete(order.id, 'regular')}
                                        className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                                      >
                                        <CheckCircle className="w-3 h-3" />
                                        Complete
                                      </Button>
                                      <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        onClick={() => handleDeletePending(order.id, 'regular')}
                                        className="flex items-center gap-1"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        Delete
                                      </Button>
                                    </div>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="mto">
                    <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                      <Table>
                        <TableHeader className="bg-slate-200">
                          <TableRow>
                            <TableHead className="font-semibold text-slate-700">Date</TableHead>
                            <TableHead className="font-semibold text-slate-700">Store</TableHead>
                            <TableHead className="font-semibold text-slate-700">Product</TableHead>
                            <TableHead className="font-semibold text-slate-700">Size</TableHead>
                            <TableHead className="font-semibold text-slate-700">Tread</TableHead>
                            <TableHead className="font-semibold text-slate-700">Quantity</TableHead>
                            <TableHead className="font-semibold text-slate-700">Schedule</TableHead>
                            {user?.isAdmin && <TableHead className="font-semibold text-slate-700">Actions</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredMtoOrders.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={user?.isAdmin ? 8 : 7} className="text-center py-8 text-slate-500">
                                No MTO orders found
                              </TableCell>
                            </TableRow>
                          ) : (
                            filteredMtoOrders.map((order, index) => (
                              <TableRow key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                <TableCell>{order.timestamp}</TableCell>
                                <TableCell>{order.store}</TableCell>
                                <TableCell>{order.productNumber}</TableCell>
                                <TableCell>{order.tireSize}</TableCell>
                                <TableCell>{order.tireTreadNeeded}</TableCell>
                                <TableCell>{order.quantity}</TableCell>
                                <TableCell>{order.scheduleArrival}</TableCell>
                                {user?.isAdmin && (
                                  <TableCell>
                                    <div className="flex gap-2">
                                      <Button 
                                        variant="default" 
                                        size="sm" 
                                        onClick={() => handleComplete(order.id, 'mto')}
                                        className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                                      >
                                        <CheckCircle className="w-3 h-3" />
                                        Complete
                                      </Button>
                                      <Button 
                                        variant="destructive" 
                                        size="sm" 
                                        onClick={() => handleDeletePending(order.id, 'mto')}
                                        className="flex items-center gap-1"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                        Delete
                                      </Button>
                                    </div>
                                  </TableCell>
                                )}
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>

              <TabsContent value="completed">
                <div className="rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-200">
                      <TableRow>
                        <TableHead 
                          className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
                          onClick={() => handleCompletedSort('completedAt')}
                        >
                          <div className="flex items-center">
                            Date Completed <ArrowDownUp className="ml-1 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
                          onClick={() => handleCompletedSort('store')}
                        >
                          <div className="flex items-center">
                            Store <ArrowDownUp className="ml-1 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
                          onClick={() => handleCompletedSort('productNumber')}
                        >
                          <div className="flex items-center">
                            Product <ArrowDownUp className="ml-1 h-3 w-3" />
                          </div>
                        </TableHead>
                        <TableHead className="font-semibold text-slate-700">
                          Description
                        </TableHead>
                        <TableHead 
                          className="font-semibold text-slate-700 cursor-pointer hover:bg-slate-300 transition-colors"
                          onClick={() => handleCompletedSort('quantity')}
                        >
                          <div className="flex items-center">
                            Quantity <ArrowDownUp className="ml-1 h-3 w-3" />
                          </div>
                        </TableHead>
                        {user?.isAdmin && (
                          <TableHead className="font-semibold text-slate-700">
                            Order Type
                          </TableHead>
                        )}
                        {user?.isAdmin && (
                          <TableHead className="font-semibold text-slate-700">
                            Completed By
                          </TableHead>
                        )}
                        {user?.isAdmin && (
                          <TableHead className="text-right font-semibold text-slate-700">
                            Actions
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedCompletedOrders.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={user?.isAdmin ? 8 : 5} className="text-center py-8 text-slate-500">
                            No completed orders found
                          </TableCell>
                        </TableRow>
                      ) : (
                        sortedCompletedOrders.map((order, index) => (
                          <TableRow key={order.id} className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                            <TableCell>{new Date(order.completedAt).toLocaleString()}</TableCell>
                            <TableCell>{order.store}</TableCell>
                            <TableCell>{order.productNumber}</TableCell>
                            <TableCell>{order.description || order.tireSize}</TableCell>
                            <TableCell>{order.quantity}</TableCell>
                            {user?.isAdmin && (
                              <TableCell>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.tireTreadNeeded ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                  {order.tireTreadNeeded ? 'MTO Order' : 'Regular Order'}
                                </span>
                              </TableCell>
                            )}
                            {user?.isAdmin && (
                              <TableCell>
                                {order.completedBy || 'Admin'}
                              </TableCell>
                            )}
                            {user?.isAdmin && (
                              <TableCell className="text-right">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDeleteCompleted(order.id)} 
                                  className="bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900 border-red-200 font-medium"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </TableCell>
                            )}
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

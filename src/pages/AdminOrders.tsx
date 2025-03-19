
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ArrowDownUp, Check, X, Shield } from "lucide-react";
import { useInventoryContext } from "@/contexts/InventoryContext";
import { decreaseInventoryQuantity } from "@/services/inventoryService";

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
  managersEmail?: string;
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
  managersEmail?: string;
}

export default function AdminOrders() {
  const [regularOrders, setRegularOrders] = useState<Order[]>([]);
  const [mtoOrders, setMTOOrders] = useState<MTOOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { inventory, refreshInventory } = useInventoryContext();

  // Redirect non-admin users
  useEffect(() => {
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "This page is only accessible to administrators.",
        variant: "destructive"
      });
      navigate("/dashboard");
    }
  }, [user, navigate, toast]);

  // Load orders from localStorage
  useEffect(() => {
    const loadOrders = () => {
      const savedRegularOrders = localStorage.getItem('pendingOrders');
      const savedMTOOrders = localStorage.getItem('mtoOrders');
      
      if (savedRegularOrders) {
        setRegularOrders(JSON.parse(savedRegularOrders));
      }
      
      if (savedMTOOrders) {
        setMTOOrders(JSON.parse(savedMTOOrders));
      }
    };
    
    loadOrders();
    
    // Listen for changes to localStorage (from other tabs/windows)
    window.addEventListener('storage', loadOrders);
    
    return () => {
      window.removeEventListener('storage', loadOrders);
    };
  }, []);

  // Filter orders based on search term
  const filteredRegularOrders = regularOrders.filter(order => 
    order.productNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.yourName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMTOOrders = mtoOrders.filter(order => 
    order.productNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.tireSize.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.store.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort orders
  const sortOrders = <T extends unknown>(orders: T[], field: keyof T | null): T[] => {
    if (!field) return orders;
    
    return [...orders].sort((a, b) => {
      const valueA = String(a[field]).toLowerCase();
      const valueB = String(b[field]).toLowerCase();
      
      if (sortDirection === 'asc') {
        return valueA.localeCompare(valueB);
      } else {
        return valueB.localeCompare(valueA);
      }
    });
  };

  const sortedRegularOrders = sortOrders(filteredRegularOrders, sortField as keyof Order | null);
  const sortedMTOOrders = sortOrders(filteredMTOOrders, sortField as keyof MTOOrder | null);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending (newest first)
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Complete an order
  const handleComplete = async (orderId: string, type: 'regular' | 'mto') => {
    try {
      if (type === 'regular') {
        const allPendingOrders = JSON.parse(localStorage.getItem('pendingOrders') || '[]');
        const orderToComplete = allPendingOrders.find((o: Order) => o.id === orderId);
        
        if (orderToComplete) {
          // Update inventory quantity
          if (orderToComplete.productNumber) {
            const result = await decreaseInventoryQuantity(
              orderToComplete.productNumber, 
              parseInt(orderToComplete.quantity, 10) || 0
            );
            
            if (result.success) {
              toast({
                title: "Inventory Updated",
                description: `Decreased ${orderToComplete.productNumber} quantity by ${orderToComplete.quantity}`,
              });
              // Refresh inventory data
              refreshInventory();
            } else {
              toast({
                title: "Inventory Update Failed",
                description: result.error || "Failed to update inventory quantity",
                variant: "destructive"
              });
            }
          }
          
          // Move to completed orders
          const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
          completedOrders.push({...orderToComplete, completedAt: new Date().toISOString()});
          localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
          
          // Remove from pending orders
          const updatedPendingOrders = allPendingOrders.filter((o: Order) => o.id !== orderId);
          localStorage.setItem('pendingOrders', JSON.stringify(updatedPendingOrders));
          setRegularOrders(updatedPendingOrders);
        }
      } else {
        // Similar process for MTO orders
        const allMTOOrders = JSON.parse(localStorage.getItem('mtoOrders') || '[]');
        const orderToComplete = allMTOOrders.find((o: MTOOrder) => o.id === orderId);
        
        if (orderToComplete) {
          const completedOrders = JSON.parse(localStorage.getItem('completedOrders') || '[]');
          completedOrders.push({...orderToComplete, completedAt: new Date().toISOString()});
          localStorage.setItem('completedOrders', JSON.stringify(completedOrders));
          
          const updatedMTOOrders = allMTOOrders.filter((o: MTOOrder) => o.id !== orderId);
          localStorage.setItem('mtoOrders', JSON.stringify(updatedMTOOrders));
          setMTOOrders(updatedMTOOrders);
        }
      }
      
      toast({
        title: "Order Completed",
        description: "The order has been marked as complete and moved to completed orders."
      });
    } catch (error) {
      console.error("Error completing order:", error);
      toast({
        title: "Error",
        description: "Failed to complete the order. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Delete an order
  const handleDelete = (orderId: string, type: 'regular' | 'mto') => {
    if (type === 'regular') {
      const updatedOrders = regularOrders.filter(order => order.id !== orderId);
      localStorage.setItem('pendingOrders', JSON.stringify(updatedOrders));
      setRegularOrders(updatedOrders);
    } else {
      const updatedMTOOrders = mtoOrders.filter(order => order.id !== orderId);
      localStorage.setItem('mtoOrders', JSON.stringify(updatedMTOOrders));
      setMTOOrders(updatedMTOOrders);
    }
    
    toast({
      title: "Order Deleted",
      description: "The order has been successfully deleted."
    });
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="mr-2 h-6 w-6" />
              Access Restricted
            </CardTitle>
            <CardDescription>
              This page is only accessible to administrators.
            </CardDescription>
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
    <div className="min-h-screen bg-cover bg-center bg-fixed" style={{
      backgroundImage: 'url("/lovable-uploads/77846306-47a3-456b-89fb-55993d2b09b2.png")',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backgroundBlendMode: 'overlay'
    }}>
      <div className="container py-8">
        <div className="p-6 shadow bg-gray-500 hover:bg-gray-400 rounded-lg">
          <h2 className="mb-4 text-center font-bold text-4xl text-amber-300">Admin Order Management</h2>
          
          <div className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-white">Search Orders</Label>
                <div className="flex mt-1">
                  <Input
                    id="search"
                    placeholder="Search by product, store, name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white"
                  />
                  <Button variant="secondary" className="ml-2">
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <Tabs defaultValue="regular" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="regular">Regular Orders ({filteredRegularOrders.length})</TabsTrigger>
              <TabsTrigger value="mto">MTO Orders ({filteredMTOOrders.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="regular">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="bg-blue-300 hover:bg-blue-200 cursor-pointer"
                      onClick={() => handleSort('dateReceived')}
                    >
                      Date <ArrowDownUp className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead 
                      className="bg-blue-300 hover:bg-blue-200 cursor-pointer"
                      onClick={() => handleSort('store')}
                    >
                      Store <ArrowDownUp className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead 
                      className="bg-blue-300 hover:bg-blue-200 cursor-pointer"
                      onClick={() => handleSort('yourName')}
                    >
                      Requested By <ArrowDownUp className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead 
                      className="bg-blue-300 hover:bg-blue-200 cursor-pointer"
                      onClick={() => handleSort('productNumber')}
                    >
                      Product <ArrowDownUp className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead className="bg-blue-300 hover:bg-blue-200">Description</TableHead>
                    <TableHead 
                      className="bg-blue-300 hover:bg-blue-200 cursor-pointer"
                      onClick={() => handleSort('quantity')}
                    >
                      Quantity <ArrowDownUp className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead 
                      className="bg-blue-300 hover:bg-blue-200 cursor-pointer"
                      onClick={() => handleSort('scheduleArrival')}
                    >
                      Schedule <ArrowDownUp className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead className="bg-blue-400 hover:bg-blue-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedRegularOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-4">
                        No orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedRegularOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell>{new Date(order.dateReceived).toLocaleDateString()}</TableCell>
                        <TableCell>{order.store}</TableCell>
                        <TableCell>{order.yourName}</TableCell>
                        <TableCell>{order.productNumber}</TableCell>
                        <TableCell>{order.description}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>{order.scheduleArrival}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="default" 
                              size="sm" 
                              onClick={() => handleComplete(order.id, 'regular')}
                              className="bg-green-600 hover:bg-green-500"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(order.id, 'regular')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="mto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('timestamp')}
                    >
                      Date <ArrowDownUp className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('store')}
                    >
                      Store <ArrowDownUp className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('name')}
                    >
                      Requested By <ArrowDownUp className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('productNumber')}
                    >
                      Product <ArrowDownUp className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('tireSize')}
                    >
                      Size <ArrowDownUp className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead>Tread</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('quantity')}
                    >
                      Quantity <ArrowDownUp className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('scheduleArrival')}
                    >
                      Schedule <ArrowDownUp className="inline h-3 w-3" />
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMTOOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-4">
                        No MTO orders found
                      </TableCell>
                    </TableRow>
                  ) : (
                    sortedMTOOrders.map(order => (
                      <TableRow key={order.id}>
                        <TableCell>{order.timestamp}</TableCell>
                        <TableCell>{order.store}</TableCell>
                        <TableCell>{order.name}</TableCell>
                        <TableCell>{order.productNumber}</TableCell>
                        <TableCell>{order.tireSize}</TableCell>
                        <TableCell>{order.tireTreadNeeded}</TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>{order.scheduleArrival}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="default" 
                              size="sm" 
                              onClick={() => handleComplete(order.id, 'mto')}
                              className="bg-green-600 hover:bg-green-500"
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              onClick={() => handleDelete(order.id, 'mto')}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

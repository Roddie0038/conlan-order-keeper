
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, ArrowDownUp, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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

export default function CompletedOrders() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<CompletedOrder[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<string>("completedAt");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const savedOrders = localStorage.getItem('completedOrders');
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      // If user is admin, show all orders, otherwise filter by store
      const filteredOrders = user?.isAdmin ? allOrders : allOrders.filter((order: CompletedOrder) => order.store === user?.store);
      setOrders(filteredOrders);
    }
  }, [user?.store, user?.isAdmin]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDelete = (orderId: string) => {
    if (!user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "Only admin users can delete completed orders.",
        variant: "destructive"
      });
      return;
    }

    const savedOrders = localStorage.getItem('completedOrders');
    if (savedOrders) {
      const allOrders = JSON.parse(savedOrders);
      const updatedOrders = allOrders.filter((order: CompletedOrder) => order.id !== orderId);
      localStorage.setItem('completedOrders', JSON.stringify(updatedOrders));
      
      // Update the displayed orders
      const filteredOrders = user?.isAdmin ? updatedOrders : updatedOrders.filter((order: CompletedOrder) => order.store === user?.store);
      setOrders(filteredOrders);

      toast({
        title: "Order Deleted",
        description: "The completed order has been successfully deleted."
      });
    }
  };

  // Filter orders based on search term
  const filteredOrders = orders.filter(order => 
    (order.productNumber?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (order.description?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (order.store?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (order.yourName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
    (order.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
  );

  // Sort orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let valueA = a[sortField as keyof CompletedOrder];
    let valueB = b[sortField as keyof CompletedOrder];
    
    // Handle undefined or null values
    if (valueA === undefined || valueA === null) valueA = '';
    if (valueB === undefined || valueB === null) valueB = '';
    
    // Convert to strings for comparison
    const strA = String(valueA).toLowerCase();
    const strB = String(valueB).toLowerCase();
    
    // For dates, try to compare as dates if possible
    if (sortField === 'completedAt' || sortField === 'dateReceived' || sortField === 'timestamp') {
      try {
        const dateA = new Date(strA);
        const dateB = new Date(strB);
        
        if (sortDirection === 'asc') {
          return dateA.getTime() - dateB.getTime();
        } else {
          return dateB.getTime() - dateA.getTime();
        }
      } catch (e) {
        // Fall back to string comparison if date parsing fails
      }
    }
    
    // String comparison
    if (sortDirection === 'asc') {
      return strA.localeCompare(strB);
    } else {
      return strB.localeCompare(strA);
    }
  });

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      // Toggle direction if same field clicked
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="min-h-screen" style={{
      backgroundImage: "url('/lovable-uploads/310fc0d8-29ad-4965-98d1-a236b46f73e8.png')",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat"
    }}>
      <header className="bg-primary/90 text-primary-foreground py-6 mb-8 backdrop-blur-sm rounded-full">
        <div className="container flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img src="/lovable-uploads/fedbf726-afa3-477f-97ef-fa62b213c003.png" alt="Conlan Tire Logo" className="h-16 object-contain" />
            <h1 className="font-extrabold text-4xl text-center">
              Completed Orders - {user?.isAdmin ? 'Admin View' : user?.store}
            </h1>
          </div>
          <div className="flex gap-4">
            {user?.isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin-orders')}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Order Management
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard')}
              className="bg-gray-700 text-white hover:bg-gray-800"
            >
              Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout} className="bg-black border-orange-500 text-white font-bold hover:bg-orange-500 hover:text-white">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container">
        <div className="p-6 rounded-lg shadow backdrop-blur-sm bg-gray-500 hover:bg-gray-400">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold text-white">Completed Orders</h2>
            
            <div className="flex items-end gap-4">
              <div>
                <Label htmlFor="search" className="text-white">Search Orders</Label>
                <div className="flex">
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
          
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="bg-gray-300 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleSort('completedAt')}
                >
                  Date Completed <ArrowDownUp className="inline h-3 w-3" />
                </TableHead>
                <TableHead 
                  className="bg-slate-300 hover:bg-slate-200 cursor-pointer"
                  onClick={() => handleSort('store')}
                >
                  Store <ArrowDownUp className="inline h-3 w-3" />
                </TableHead>
                <TableHead 
                  className="bg-slate-300 hover:bg-slate-200 cursor-pointer"
                  onClick={() => handleSort('productNumber')}
                >
                  Product <ArrowDownUp className="inline h-3 w-3" />
                </TableHead>
                <TableHead className="bg-slate-300 hover:bg-slate-200">
                  Description
                </TableHead>
                <TableHead 
                  className="bg-slate-300 hover:bg-slate-200 cursor-pointer"
                  onClick={() => handleSort('quantity')}
                >
                  Quantity <ArrowDownUp className="inline h-3 w-3" />
                </TableHead>
                {user?.isAdmin && (
                  <TableHead className="bg-slate-300 hover:bg-slate-200">
                    Order Type
                  </TableHead>
                )}
                {user?.isAdmin && (
                  <TableHead className="bg-slate-300 hover:bg-slate-200">
                    Completed By
                  </TableHead>
                )}
                {user?.isAdmin && (
                  <TableHead className="text-right bg-slate-300 hover:bg-slate-200">
                    Actions
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={user?.isAdmin ? 8 : 5} className="text-center py-4">
                    No completed orders found
                  </TableCell>
                </TableRow>
              ) : (
                sortedOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>{new Date(order.completedAt).toLocaleString()}</TableCell>
                    <TableCell>{order.store}</TableCell>
                    <TableCell>{order.productNumber}</TableCell>
                    <TableCell>{order.description || order.tireSize}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    {user?.isAdmin && (
                      <TableCell>
                        {order.tireTreadNeeded ? 'MTO Order' : 'Regular Order'}
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
                          onClick={() => handleDelete(order.id)} 
                          className="bg-red-600 text-black font-bold hover:bg-red-700 hover:text-white"
                        >
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
      </main>
    </div>
  );
}

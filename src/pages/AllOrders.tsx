
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchAllOrders } from "@/services/orderService";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ArrowDownUp, Shield, FileDown } from "lucide-react";

export default function AllOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string>("Timestamp");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check if user is admin
  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  // Fetch orders from Supabase
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const { orders, error } = await fetchAllOrders();
        if (error) {
          setError("Failed to fetch orders");
          console.error(error);
        } else {
          setOrders(orders);
          setFilteredOrders(orders);
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, []);

  // Filter orders based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredOrders(orders);
      return;
    }

    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    const filtered = orders.filter(order => {
      return (
        String(order["Store"] || "").toLowerCase().includes(lowerCaseSearchTerm) ||
        String(order["Product Number"] || "").toLowerCase().includes(lowerCaseSearchTerm) ||
        String(order["Description"] || "").toLowerCase().includes(lowerCaseSearchTerm) ||
        String(order["Name"] || "").toLowerCase().includes(lowerCaseSearchTerm)
      );
    });

    setFilteredOrders(filtered);
  }, [searchTerm, orders]);

  // Sort orders
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort the filtered orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    const valueA = a[sortField] !== undefined ? String(a[sortField]).toLowerCase() : "";
    const valueB = b[sortField] !== undefined ? String(b[sortField]).toLowerCase() : "";
    
    if (sortDirection === 'asc') {
      return valueA.localeCompare(valueB);
    } else {
      return valueB.localeCompare(valueA);
    }
  });

  // Export orders to CSV
  const exportToCSV = () => {
    const headers = [
      "Store", 
      "Product Number", 
      "Description", 
      "Quantity", 
      "Schedule Arrival", 
      "Notes", 
      "Cross Dock", 
      "Cross Dock Destination", 
      "Name", 
      "Email", 
      "Timestamp",
      "type"
    ];
    
    const csvRows = [];
    csvRows.push(headers.join(','));
    
    for (const order of filteredOrders) {
      const values = headers.map(header => {
        const value = order[header] !== undefined ? order[header] : "";
        // Escape commas and quotes
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <header className="bg-gradient-to-r from-blue-700 to-blue-900 text-white py-6 mb-6 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl md:text-3xl font-bold">Order Management</h1>
          <p className="text-blue-100">View and manage all orders across all stores</p>
        </div>
      </header>

      <main className="container mx-auto px-4 pb-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by store, product, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={exportToCSV}
                variant="outline"
                className="flex items-center gap-2"
              >
                <FileDown className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10">
              <p className="text-red-500">{error}</p>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                className="mt-4"
              >
                Retry
              </Button>
            </div>
          ) : sortedOrders.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500 dark:text-gray-400">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort("Timestamp")}
                    >
                      Date <ArrowDownUp className="inline h-3 w-3 ml-1" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort("Store")}
                    >
                      Store <ArrowDownUp className="inline h-3 w-3 ml-1" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort("Name")}
                    >
                      Name <ArrowDownUp className="inline h-3 w-3 ml-1" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort("Product Number")}
                    >
                      Product <ArrowDownUp className="inline h-3 w-3 ml-1" />
                    </TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort("Quantity")}
                    >
                      Qty <ArrowDownUp className="inline h-3 w-3 ml-1" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort("Schedule Arrival")}
                    >
                      Schedule <ArrowDownUp className="inline h-3 w-3 ml-1" />
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={() => handleSort("type")}
                    >
                      Type <ArrowDownUp className="inline h-3 w-3 ml-1" />
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedOrders.map((order, index) => (
                    <TableRow key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <TableCell>{new Date(order.Timestamp).toLocaleString()}</TableCell>
                      <TableCell>{order.Store}</TableCell>
                      <TableCell>{order.Name}</TableCell>
                      <TableCell>{order["Product Number"]}</TableCell>
                      <TableCell className="max-w-xs truncate">{order.Description}</TableCell>
                      <TableCell>{order.Quantity}</TableCell>
                      <TableCell>{order["Schedule Arrival"]}</TableCell>
                      <TableCell>
                        <Badge 
                          variant="outline" 
                          className={
                            order.type === 'MTO' 
                              ? 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300' 
                              : order.type === 'WHEEL_POWDER_COATING'
                                ? 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300'
                                : 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300'
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
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

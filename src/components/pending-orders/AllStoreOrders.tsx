
import { useFetchOrders, OrderRecord } from "@/hooks/useFetchOrders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { OrdersFilters } from "./OrdersFilters";
import { OrdersTable } from "./OrdersTable";

export function AllStoreOrders() {
  const { orders, loading, error } = useFetchOrders();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStore, setFilterStore] = useState<string>("all");
  const [sortField, setSortField] = useState<keyof OrderRecord>("timestamp");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg font-medium">Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
        <h3 className="text-red-800 dark:text-red-400 font-medium">Error loading orders</h3>
        <p className="text-red-600 dark:text-red-300">{error.message}</p>
      </div>
    );
  }

  // Get unique list of stores for the filter
  const uniqueStores = [...new Set(orders.map(order => order.store))];

  // Filter and sort orders
  const filteredOrders = orders
    .filter(order => {
      const matchesSearch = 
        (order.product_number?.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (order.description?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (order.store?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStore = filterStore === "all" || order.store === filterStore;
      
      return matchesSearch && matchesStore;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (aValue === bValue) return 0;
      
      if (aValue === null || aValue === undefined) return sortDirection === "asc" ? -1 : 1;
      if (bValue === null || bValue === undefined) return sortDirection === "asc" ? 1 : -1;
      
      if (sortField === "timestamp") {
        // Handle timestamp sorting
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      // For other types of values
      return sortDirection === "asc" 
        ? (aValue < bValue ? -1 : 1)
        : (bValue < aValue ? -1 : 1);
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Store Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <OrdersFilters 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStore={filterStore}
          setFilterStore={setFilterStore}
          uniqueStores={uniqueStores}
        />

        {filteredOrders.length === 0 ? (
          <OrdersEmptyState />
        ) : (
          <OrdersTable 
            orders={filteredOrders} 
            sortField={sortField}
            sortDirection={sortDirection}
            setSortField={setSortField}
            setSortDirection={setSortDirection}
          />
        )}
      </CardContent>
    </Card>
  );
}

import { Package, TrendingDown, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryDashboardTable } from "@/components/inventory-dashboard/InventoryDashboardTable";
import { InventoryDashboardFilters } from "@/components/inventory-dashboard/InventoryDashboardFilters";
import { useInventoryCache } from "@/hooks/useInventoryCache";
import { useMemo } from "react";

export default function InventoryDashboard() {
  const {
    inventory,
    loading,
    searchTerm,
    setSearchTerm,
    plantFilter,
    setPlantFilter,
    statusFilter,
    setStatusFilter,
    plants,
    refreshInventory
  } = useInventoryCache();

  // Calculate summary statistics
  const stats = useMemo(() => {
    const allInventory = inventory;
    const totalItems = allInventory.length;
    const outOfStock = allInventory.filter(item => item.quantity === 0).length;
    const lowStock = allInventory.filter(item => item.low_stock && item.quantity > 0).length;
    const available = allInventory.filter(item => item.quantity > 0 && !item.low_stock).length;

    return { totalItems, outOfStock, lowStock, available };
  }, [inventory]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
          <Package className="h-8 w-8" />
          Inventory Dashboard
        </h1>
        <p className="text-muted-foreground">
          Real-time inventory levels across all plants
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-success">
              <CheckCircle2 className="h-4 w-4" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.available}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-warning">
              <AlertTriangle className="h-4 w-4" />
              Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.lowStock}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-destructive">
              <TrendingDown className="h-4 w-4" />
              Out of Stock
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.outOfStock}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <InventoryDashboardFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        plantFilter={plantFilter}
        setPlantFilter={setPlantFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        plants={plants}
        onRefresh={refreshInventory}
      />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
          <CardDescription>
            Showing {inventory.length} item{inventory.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InventoryDashboardTable inventory={inventory} loading={loading} />
        </CardContent>
      </Card>
    </div>
  );
}

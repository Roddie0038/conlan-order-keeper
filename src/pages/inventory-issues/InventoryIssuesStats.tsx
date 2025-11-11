import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, PackageX, PackageOpen, ShoppingCart, TrendingDown } from "lucide-react";
import type { InventoryIssuesStats } from "@/hooks/useInventoryIssues";

interface InventoryIssuesStatsProps {
  stats: InventoryIssuesStats;
}

export function InventoryIssuesStats({ stats }: InventoryIssuesStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-destructive/10 to-destructive/5 border-destructive/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Issues</p>
              <p className="text-2xl font-bold text-destructive">{stats.total_issues}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive/60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.out_of_stock_items}</p>
            </div>
            <PackageX className="h-8 w-8 text-red-500/60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border-yellow-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Low Stock</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.low_stock_items}</p>
            </div>
            <PackageOpen className="h-8 w-8 text-yellow-500/60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Affected Orders</p>
              <p className="text-2xl font-bold text-orange-600">{stats.total_affected_orders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-orange-500/60" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Shortage</p>
              <p className="text-2xl font-bold text-purple-600">{stats.total_quantity_shortage}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-purple-500/60" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

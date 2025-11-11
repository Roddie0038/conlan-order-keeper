import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface InventoryIssuesHeaderProps {
  onRefresh: () => void;
}

export function InventoryIssuesHeader({ onRefresh }: InventoryIssuesHeaderProps) {
  return (
    <CardHeader className="pb-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Inventory Issues</CardTitle>
            <CardDescription className="mt-1">
              Out-of-stock and low-stock items with order impact analysis
            </CardDescription>
          </div>
        </div>
        <Button
          onClick={onRefresh}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
    </CardHeader>
  );
}

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, AlertTriangle, PackageX, PackageOpen } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { InventoryIssue } from "@/hooks/useInventoryIssues";

interface InventoryIssuesTableProps {
  issues: InventoryIssue[];
}

export function InventoryIssuesTable({ issues }: InventoryIssuesTableProps) {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (productNumber: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productNumber)) {
        newSet.delete(productNumber);
      } else {
        newSet.add(productNumber);
      }
      return newSet;
    });
  };

  if (issues.length === 0) {
    return (
      <div className="text-center py-12">
        <PackageOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">No inventory issues found</p>
        <p className="text-sm text-muted-foreground/70">All items are adequately stocked</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-[50px]"></TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Product Number</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Current Stock</TableHead>
            <TableHead className="text-right">Min Threshold</TableHead>
            <TableHead className="text-right">Affected Orders</TableHead>
            <TableHead className="text-right">Total Requested</TableHead>
            <TableHead className="text-right">Shortage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {issues.map((issue) => {
            const isExpanded = expandedRows.has(issue.product_number);
            const shortage = issue.status === 'out_of_stock' 
              ? issue.total_quantity_requested 
              : Math.max(0, issue.total_quantity_requested - issue.quantity);

            return (
              <Collapsible key={issue.product_number} open={isExpanded} asChild>
                <>
                  <TableRow className={issue.status === 'out_of_stock' ? 'bg-red-50/50 dark:bg-red-950/20' : 'bg-yellow-50/50 dark:bg-yellow-950/20'}>
                    <TableCell>
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => toggleRow(issue.product_number)}
                          disabled={issue.affected_orders_count === 0}
                        >
                          {issue.affected_orders_count > 0 && (
                            isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                    </TableCell>
                    <TableCell>
                      {issue.status === 'out_of_stock' ? (
                        <Badge variant="destructive" className="gap-1">
                          <PackageX className="h-3 w-3" />
                          Out of Stock
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1 bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/20">
                          <AlertTriangle className="h-3 w-3" />
                          Low Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-mono font-medium">{issue.product_number}</TableCell>
                    <TableCell className="max-w-xs truncate">{issue.description}</TableCell>
                    <TableCell className="text-right">
                      <span className={issue.quantity === 0 ? "text-red-600 font-bold" : "text-yellow-600 font-semibold"}>
                        {issue.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">{issue.min_threshold}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-semibold">
                        {issue.affected_orders_count}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">{issue.total_quantity_requested}</TableCell>
                    <TableCell className="text-right">
                      <span className="text-red-600 font-bold">{shortage}</span>
                    </TableCell>
                  </TableRow>
                  {issue.affected_orders_count > 0 && (
                    <CollapsibleContent asChild>
                      <TableRow>
                        <TableCell colSpan={9} className="bg-muted/30 p-0">
                          <div className="p-4">
                            <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                              Affected Orders ({issue.affected_orders_count})
                            </h4>
                            <div className="grid gap-2">
                              {issue.affected_orders.map((order) => (
                                <div
                                  key={order.id}
                                  className="flex items-center justify-between p-2 bg-background border rounded text-sm"
                                >
                                  <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="font-mono text-xs">
                                      {order.order_type}
                                    </Badge>
                                    <span className="font-medium">{order.store}</span>
                                    <span className="text-muted-foreground">
                                      {new Date(order.timestamp).toLocaleDateString()}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">Qty:</span>
                                    <span className="font-bold">{order.quantity}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    </CollapsibleContent>
                  )}
                </>
              </Collapsible>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface InventorySyncEvent {
  id: string;
  event_id: string;
  trace_id: string | null;
  product_number: string;
  plant: string;
  old_quantity: number | null;
  new_quantity: number | null;
  sync_type: string;
  synced_at: string;
}

export function InventorySyncMonitor() {
  const [syncEvents, setSyncEvents] = useState<InventorySyncEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSyncEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory_sync_log' as any)
        .select('*')
        .order('synced_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setSyncEvents((data || []) as unknown as InventorySyncEvent[]);
    } catch (error) {
      console.error('Error loading sync events:', error);
      toast.error('Failed to load inventory sync events');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadSyncEvents();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('inventory-sync-changes')
      .on(
        'postgres_changes' as any,
        {
          event: 'INSERT',
          schema: 'public',
          table: 'inventory_sync_log'
        },
        () => {
          loadSyncEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadSyncEvents();
  };

  const getQuantityChange = (oldQty: number | null, newQty: number | null) => {
    const old = oldQty || 0;
    const newVal = newQty || 0;
    const diff = newVal - old;

    if (diff > 0) {
      return {
        icon: <TrendingUp className="h-4 w-4 text-green-600" />,
        text: `+${diff}`,
        className: "text-green-600"
      };
    } else if (diff < 0) {
      return {
        icon: <TrendingDown className="h-4 w-4 text-red-600" />,
        text: `${diff}`,
        className: "text-red-600"
      };
    } else {
      return {
        icon: <Minus className="h-4 w-4 text-muted-foreground" />,
        text: "0",
        className: "text-muted-foreground"
      };
    }
  };

  const getSyncTypeBadge = (syncType: string) => {
    const types: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      inventory_updated: { label: "Updated", variant: "default" },
      out_of_stock: { label: "Out of Stock", variant: "destructive" },
      restocked: { label: "Restocked", variant: "default" }
    };

    const config = types[syncType] || { label: syncType, variant: "outline" as const };

    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inventory Synchronization</CardTitle>
            <CardDescription>
              Real-time inventory updates from OT Platform
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading sync events...
          </div>
        ) : syncEvents.length === 0 ? (
          <div className="text-center py-8">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No inventory sync events yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Events will appear here when inventory updates are received from OT Platform
            </p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product #</TableHead>
                  <TableHead>Plant</TableHead>
                  <TableHead>Sync Type</TableHead>
                  <TableHead>Old Qty</TableHead>
                  <TableHead>New Qty</TableHead>
                  <TableHead>Change</TableHead>
                  <TableHead>Synced At</TableHead>
                  <TableHead>Trace ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncEvents.map((event) => {
                  const change = getQuantityChange(event.old_quantity, event.new_quantity);
                  
                  return (
                    <TableRow key={event.id}>
                      <TableCell className="font-mono text-sm">
                        {event.product_number}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{event.plant}</Badge>
                      </TableCell>
                      <TableCell>
                        {getSyncTypeBadge(event.sync_type)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {event.old_quantity !== null ? event.old_quantity : '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        {event.new_quantity !== null ? event.new_quantity : '-'}
                      </TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${change.className}`}>
                          {change.icon}
                          <span className="font-medium">{change.text}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(event.synced_at), 'MMM d, HH:mm:ss')}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {event.trace_id ? event.trace_id.substring(0, 8) : '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

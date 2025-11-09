import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface EventReceipt {
  id: string;
  event_id: string;
  event_type: string;
  source: string;
  trace_id: string | null;
  status: string;
  received_at: string;
  processed_at: string | null;
  processing_duration_ms: number | null;
  error_message: string | null;
}

export function InboundEventsMonitor() {
  const [events, setEvents] = useState<EventReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = async () => {
    try {
      let query = supabase
        .from('event_receipts' as any)
        .select('*')
        .order('received_at', { ascending: false })
        .limit(50);

      if (sourceFilter !== "all") {
        query = query.eq('source', sourceFilter);
      }

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEvents((data || []) as unknown as EventReceipt[]);
    } catch (error) {
      console.error('Error loading event receipts:', error);
      toast.error('Failed to load event receipts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEvents();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('event-receipts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'event_receipts'
        },
        () => {
          loadEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sourceFilter, statusFilter]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadEvents();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { icon: React.ReactNode; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      received: { icon: <Clock className="h-3 w-3" />, variant: "secondary" },
      processed: { icon: <CheckCircle2 className="h-3 w-3" />, variant: "default" },
      failed: { icon: <XCircle className="h-3 w-3" />, variant: "destructive" },
      ignored: { icon: <AlertCircle className="h-3 w-3" />, variant: "outline" }
    };

    const config = variants[status] || variants.received;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        {config.icon}
        {status}
      </Badge>
    );
  };

  const getSourceBadge = (source: string) => {
    const colors: Record<string, string> = {
      inventory: "bg-blue-500/10 text-blue-700 dark:text-blue-300",
      ot: "bg-purple-500/10 text-purple-700 dark:text-purple-300",
      ordering: "bg-green-500/10 text-green-700 dark:text-green-300"
    };

    return (
      <Badge variant="outline" className={colors[source] || ""}>
        {source}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Inbound Webhook Events</CardTitle>
            <CardDescription>
              Monitor received webhook events from external platforms
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
        <div className="flex gap-4 mb-4">
          <div className="w-48">
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="inventory">Inventory Platform</SelectItem>
                <SelectItem value="ot">OT Platform</SelectItem>
                <SelectItem value="ordering">Ordering Platform</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="processed">Processed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="ignored">Ignored</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No events found
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event ID</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received At</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Trace ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {events.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-xs">
                      {event.event_id.substring(0, 12)}...
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{event.event_type}</span>
                    </TableCell>
                    <TableCell>
                      {getSourceBadge(event.source)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(event.status)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(event.received_at), 'MMM d, HH:mm:ss')}
                    </TableCell>
                    <TableCell className="text-sm">
                      {event.processing_duration_ms ? (
                        <span className="text-muted-foreground">
                          {event.processing_duration_ms}ms
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {event.trace_id ? event.trace_id.substring(0, 8) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

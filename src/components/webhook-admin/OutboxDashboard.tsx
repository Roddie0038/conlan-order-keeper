import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, RefreshCw, AlertCircle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { retryOutboxEvent } from "@/services/webhookOutbox";
import { formatDistanceToNow } from "date-fns";

interface OutboxStats {
  pending: number;
  processing: number;
  delivered: number;
  failed: number;
  total: number;
}

interface OutboxEvent {
  id: string;
  event_id: string;
  event_type: string;
  trace_id: string | null;
  status: string;
  retry_count: number;
  max_retries: number;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  next_retry_at: string | null;
}

export function OutboxDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<OutboxStats>({
    pending: 0,
    processing: 0,
    delivered: 0,
    failed: 0,
    total: 0
  });
  const [failedEvents, setFailedEvents] = useState<OutboxEvent[]>([]);
  const [retrying, setRetrying] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  useEffect(() => {
    loadData();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('webhook_outbox_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'webhook_outbox'
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadStats(), loadFailedEvents()]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_outbox' as any)
        .select('status');

      if (error) throw error;

      const events = ((data || []) as any[]).map(e => ({ status: e.status as string }));
      const newStats = {
        pending: events.filter(e => e.status === 'pending').length,
        processing: events.filter(e => e.status === 'processing').length,
        delivered: events.filter(e => e.status === 'delivered').length,
        failed: events.filter(e => e.status === 'failed').length,
        total: events.length
      };

      setStats(newStats);
    } catch (error) {
      console.error('Error loading outbox stats:', error);
    }
  };

  const loadFailedEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('webhook_outbox' as any)
        .select('*')
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setFailedEvents((data || []) as unknown as OutboxEvent[]);
    } catch (error) {
      console.error('Error loading failed events:', error);
    }
  };

  const handleRetry = async (eventId: string) => {
    setRetrying(prev => new Set(prev).add(eventId));
    
    try {
      const result = await retryOutboxEvent(eventId);
      
      if (result.success) {
        toast({
          title: "Event Queued for Retry",
          description: "The event has been reset and will be retried shortly.",
        });
        await loadData();
      } else {
        toast({
          title: "Retry Failed",
          description: result.error || "Failed to reset the event for retry.",
          variant: "destructive",
        });
      }
    } finally {
      setRetrying(prev => {
        const next = new Set(prev);
        next.delete(eventId);
        return next;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Processing</Badge>;
      case 'delivered':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="w-3 h-3" /> Delivered</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-500">{stats.processing}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-500">{stats.delivered}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Failed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      {/* Failed Events Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Failed Events</CardTitle>
              <CardDescription>
                Events that failed delivery and may need manual intervention
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {failedEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
              <p className="text-lg font-medium">No Failed Events</p>
              <p className="text-sm text-muted-foreground mt-1">
                All webhook events are being delivered successfully
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event Type</TableHead>
                    <TableHead>Event ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Retries</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Error</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {failedEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="font-medium">{event.event_type}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {event.event_id.substring(0, 8)}...
                        </code>
                      </TableCell>
                      <TableCell>{getStatusBadge(event.status)}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {event.retry_count} / {event.max_retries}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
                      </TableCell>
                      <TableCell>
                        {event.error_message ? (
                          <div className="flex items-start gap-2 max-w-md">
                            <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-muted-foreground line-clamp-2">
                              {event.error_message}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">No error message</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRetry(event.event_id)}
                          disabled={retrying.has(event.event_id)}
                        >
                          {retrying.has(event.event_id) ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                              Retrying...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 mr-1" />
                              Retry
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

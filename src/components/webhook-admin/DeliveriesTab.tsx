import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RefreshCw, Eye, RotateCcw } from "lucide-react";
import type { WebhookDelivery, AppWebhook } from "@/types/webhook-admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DeliveriesTab() {
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [webhooks, setWebhooks] = useState<AppWebhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [filterWebhook, setFilterWebhook] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [replaying, setReplaying] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDeliveries();
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('app_webhooks' as any)
        .select('id, name, max_retries')
        .order('name');

      if (error) throw error;
      setWebhooks((data || []) as unknown as AppWebhook[]);
    } catch (error) {
      console.error('Error loading webhooks:', error);
    }
  };

  const loadDeliveries = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('app_webhook_deliveries' as any)
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filterWebhook !== "all") {
        query = query.eq('webhook_id', filterWebhook);
      }

      if (filterStatus === "success") {
        query = query.eq('success', true);
      } else if (filterStatus === "failed") {
        query = query.eq('success', false);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDeliveries((data || []) as unknown as WebhookDelivery[]);
    } catch (error: any) {
      toast({
        title: "Error loading deliveries",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeliveries();
  }, [filterWebhook, filterStatus]);

  const handleReplay = async (delivery: WebhookDelivery) => {
    if (!delivery.webhook_id) {
      toast({
        title: "Error",
        description: "Cannot replay: webhook not found",
        variant: "destructive",
      });
      return;
    }

    // Check if retries are available
    const webhook = webhooks.find(w => w.id === delivery.webhook_id);
    if (webhook && delivery.retry_count >= webhook.max_retries) {
      toast({
        title: "Cannot Replay",
        description: "Maximum retry attempts reached",
        variant: "destructive",
      });
      return;
    }

    setReplaying(delivery.id);
    try {
      const { data, error } = await supabase.functions.invoke("webhook-config", {
        body: {
          action: "replay-delivery",
          delivery_id: delivery.id,
        },
      });

      if (error) throw error;

      toast({
        title: data.success ? "Replay successful" : "Replay failed",
        description: data.message,
        variant: data.success ? "default" : "destructive",
      });

      loadDeliveries();
    } catch (error: any) {
      toast({
        title: "Error replaying delivery",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setReplaying(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const filteredDeliveries = deliveries;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Webhook Deliveries</h2>
            <p className="text-muted-foreground">
              View recent webhook delivery attempts and replay failed deliveries
            </p>
          </div>
          <Button onClick={loadDeliveries} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <Select value={filterWebhook} onValueChange={setFilterWebhook}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by webhook" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Webhooks</SelectItem>
                {webhooks.map((webhook) => (
                  <SelectItem key={webhook.id} value={webhook.id}>
                    {webhook.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Deliveries</CardTitle>
            <CardDescription>Last 100 webhook delivery attempts</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Delivery ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeliveries.map((delivery) => {
                  const webhook = webhooks.find(w => w.id === delivery.webhook_id);
                  const canReplay = !delivery.success && webhook && delivery.retry_count < webhook.max_retries;
                  
                  return (
                    <TableRow key={delivery.id}>
                      <TableCell className="font-mono text-xs">
                        {delivery.event_type}
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[200px] truncate">
                        {delivery.idempotency_key || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={delivery.success ? "default" : "destructive"}>
                          {delivery.response_status || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell>{delivery.duration_ms || 0}ms</TableCell>
                      <TableCell>
                        <Badge variant="outline">{delivery.retry_count}</Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(delivery.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setDetailsOpen(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canReplay && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReplay(delivery)}
                              disabled={replaying === delivery.id}
                            >
                              {replaying === delivery.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <RotateCcw className="h-4 w-4" />
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
            <DialogDescription>
              Full details of the webhook delivery attempt
            </DialogDescription>
          </DialogHeader>

          {selectedDelivery && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Event Type</Label>
                  <p className="text-sm font-mono">{selectedDelivery.event_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant={selectedDelivery.success ? "default" : "destructive"}>
                    {selectedDelivery.response_status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <p className="text-sm">{selectedDelivery.duration_ms || 0}ms</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Retry Count</Label>
                  <p className="text-sm">{selectedDelivery.retry_count}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Delivery ID</Label>
                  <p className="text-xs font-mono break-all">{selectedDelivery.idempotency_key || 'N/A'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Timestamp</Label>
                  <p className="text-sm">{new Date(selectedDelivery.request_timestamp).toLocaleString()}</p>
                </div>
              </div>

              {selectedDelivery.hmac_signature && (
                <div>
                  <Label className="text-sm font-medium">HMAC Signature</Label>
                  <code className="block mt-1 p-2 bg-muted rounded text-xs break-all">
                    {selectedDelivery.hmac_signature}
                  </code>
                </div>
              )}

              {selectedDelivery.request_headers && (
                <div>
                  <Label className="text-sm font-medium">Request Headers</Label>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto">
                    {JSON.stringify(selectedDelivery.request_headers, null, 2)}
                  </pre>
                </div>
              )}

              {selectedDelivery.request_body && (
                <div>
                  <Label className="text-sm font-medium">Request Body</Label>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto max-h-60">
                    {JSON.stringify(selectedDelivery.request_body, null, 2)}
                  </pre>
                </div>
              )}

              {selectedDelivery.response_body && (
                <div>
                  <Label className="text-sm font-medium">Response Body</Label>
                  <pre className="mt-1 p-2 bg-muted rounded text-xs overflow-x-auto max-h-60">
                    {selectedDelivery.response_body}
                  </pre>
                </div>
              )}

              {selectedDelivery.error_message && (
                <div>
                  <Label className="text-sm font-medium text-destructive">Error Message</Label>
                  <p className="mt-1 text-sm text-destructive">{selectedDelivery.error_message}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

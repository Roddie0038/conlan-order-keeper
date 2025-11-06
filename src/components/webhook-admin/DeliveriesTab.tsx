import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WebhookDelivery } from "@/types/webhook-admin";

export function DeliveriesTab() {
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDelivery, setSelectedDelivery] = useState<WebhookDelivery | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDeliveries();
  }, []);

  async function loadDeliveries() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("webhook_deliveries" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

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
  }

  async function handleReplay(deliveryId: string) {
    try {
      const { data, error } = await supabase.functions.invoke("webhook-config", {
        body: { action: "replay-delivery", delivery_id: deliveryId },
      });

      if (error) throw error;

      toast({
        title: "Webhook replayed",
        description: data.success ? "Successfully replayed" : "Replay failed",
        variant: data.success ? "default" : "destructive",
      });
      loadDeliveries();
    } catch (error: any) {
      toast({
        title: "Error replaying webhook",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recent Deliveries</h2>
        <Button variant="outline" size="sm" onClick={loadDeliveries}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {deliveries.map((delivery) => (
          <Card key={delivery.id} className="hover:bg-accent/50 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={delivery.success ? "default" : "destructive"}>
                      {delivery.success ? "Success" : "Failed"}
                    </Badge>
                    <span className="font-medium">{delivery.webhook_type}</span>
                    <Badge variant="outline">{delivery.response_status}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {delivery.duration_ms}ms
                    </span>
                    {delivery.retry_count > 0 && (
                      <Badge variant="secondary">Retry {delivery.retry_count}</Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(delivery.created_at), { addSuffix: true })}
                  </div>
                  {delivery.error_message && (
                    <div className="text-sm text-destructive">{delivery.error_message}</div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedDelivery(delivery);
                      setShowDetailDialog(true);
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReplay(delivery.id)}
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Delivery Details</DialogTitle>
            <DialogDescription>
              Complete request and response information
            </DialogDescription>
          </DialogHeader>

          {selectedDelivery && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Request Body</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  {JSON.stringify(selectedDelivery.request_body, null, 2)}
                </pre>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Response Body</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-xs">
                  {selectedDelivery.response_body}
                </pre>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">URL:</span>
                  <div className="text-muted-foreground break-all">
                    {selectedDelivery.webhook_url}
                  </div>
                </div>
                <div>
                  <span className="font-semibold">Status:</span>{" "}
                  {selectedDelivery.response_status}
                </div>
                <div>
                  <span className="font-semibold">Duration:</span> {selectedDelivery.duration_ms}ms
                </div>
                <div>
                  <span className="font-semibold">Retry Count:</span> {selectedDelivery.retry_count}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

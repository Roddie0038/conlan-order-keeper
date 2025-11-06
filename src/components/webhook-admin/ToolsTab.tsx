import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { AppWebhook } from "@/types/webhook-admin";
import { EVENT_TYPES } from "@/types/webhook-admin";

const EVENT_PAYLOAD_TEMPLATES: Record<typeof EVENT_TYPES[number], any> = {
  'order.created': {
    event_type: 'order.created',
    order_id: 'ORD-20250106-000001',
    store: 'Store 123',
    plant: 'Plant ABC',
    product: 'Product XYZ',
    quantity: 10,
  },
  'order.updated': {
    event_type: 'order.updated',
    order_id: 'ORD-20250106-000001',
    status: 'processing',
  },
  'order.completed': {
    event_type: 'order.completed',
    order_id: 'ORD-20250106-000001',
  },
  'mto.created': {
    event_type: 'mto.created',
    mto_id: 'MTO-20250106-000001',
    store: 'Store 123',
  },
  'mto.updated': {
    event_type: 'mto.updated',
    mto_id: 'MTO-20250106-000001',
    status: 'in_progress',
  },
  'wheel.created': {
    event_type: 'wheel.created',
    wheel_id: 'WHEEL-20250106-000001',
    store: 'Store 123',
  },
  'warranty.created': {
    event_type: 'warranty.created',
    warranty_id: 'WAR-20250106-000001',
    store: 'Store 123',
  },
  'user.sync': {
    event_type: 'user.sync',
    user_id: 'user-123',
    email: 'user@example.com',
  },
  'cross_dock.created': {
    event_type: 'cross_dock.created',
    cross_dock_id: 'CD-20250106-000001',
    store: 'Store 123',
  },
};

export function ToolsTab() {
  const [webhooks, setWebhooks] = useState<AppWebhook[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<typeof EVENT_TYPES[number]>("order.created");
  const [testPayload, setTestPayload] = useState(
    JSON.stringify(EVENT_PAYLOAD_TEMPLATES['order.created'], null, 2)
  );
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('app_webhooks' as any)
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      const webhookList = (data || []) as unknown as AppWebhook[];
      setWebhooks(webhookList);
      
      if (webhookList.length > 0) {
        setSelectedWebhook(webhookList[0].id);
      }
    } catch (error) {
      console.error('Error loading webhooks:', error);
    }
  };

  const handleEventChange = (event: typeof EVENT_TYPES[number]) => {
    setSelectedEvent(event);
    setTestPayload(JSON.stringify(EVENT_PAYLOAD_TEMPLATES[event], null, 2));
  };

  async function handleTestSend() {
    if (!selectedWebhook) {
      toast({
        title: "Error",
        description: "Please select a webhook",
        variant: "destructive",
      });
      return;
    }

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(testPayload);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your test payload format",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Generate unified headers
      const timestamp = Math.floor(Date.now() / 1000);
      const deliveryId = crypto.randomUUID();
      
      const { data, error } = await supabase.functions.invoke("webhook-config", {
        body: {
          action: "test-webhook",
          webhook_id: selectedWebhook,
          event_type: selectedEvent,
          test_payload: parsedPayload,
          timestamp,
          delivery_id: deliveryId,
        },
      });

      if (error) throw error;

      setTestResult(data);
      toast({
        title: data.success ? "Test successful" : "Test failed",
        description: data.success 
          ? `Response: ${data.status} in ${data.duration_ms}ms`
          : `Error: ${data.error_message}`,
        variant: data.success ? "default" : "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error sending test",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  }

  const webhook = webhooks.find(w => w.id === selectedWebhook);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Testing & Utilities</h2>
          <p className="text-muted-foreground">
            Test webhook deliveries and verify connectivity
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadWebhooks}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Test Webhook Delivery</CardTitle>
          <CardDescription>
            Send a test webhook with unified headers (x-cto-signature, x-cto-timestamp, x-cto-delivery-id)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Select Webhook Endpoint</Label>
            <Select value={selectedWebhook} onValueChange={setSelectedWebhook}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a webhook..." />
              </SelectTrigger>
              <SelectContent>
                {webhooks.map((webhook) => (
                  <SelectItem key={webhook.id} value={webhook.id}>
                    {webhook.name} - {webhook.endpoint_url}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {webhook && (
              <p className="text-xs text-muted-foreground">
                Endpoint: <code className="px-1 py-0.5 bg-muted rounded">{webhook.endpoint_url}</code>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select value={selectedEvent} onValueChange={(v) => handleEventChange(v as typeof EVENT_TYPES[number])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((event) => (
                  <SelectItem key={event} value={event}>
                    {event}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Test Payload (JSON)</Label>
            <Textarea
              className="font-mono text-xs"
              rows={12}
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Edit the payload as needed. The system will automatically add unified headers.
            </p>
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              📋 Headers will include: <code>x-cto-signature</code> (HMAC-SHA256), 
              <code>x-cto-timestamp</code>, <code>x-cto-delivery-id</code>
            </p>
          </div>

          <Button onClick={handleTestSend} disabled={testing || !selectedWebhook} className="w-full">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Test Webhook...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test Webhook
              </>
            )}
          </Button>

          {testResult && (
            <div className="mt-4 space-y-3">
              <h3 className="font-semibold">Test Result</h3>
              <div className="bg-muted p-4 rounded-lg space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Status:</span>
                  <span className={testResult.success ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                    {testResult.success ? "✓ Success" : "✗ Failed"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">HTTP Status:</span>
                  <span>{testResult.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">Duration:</span>
                  <span>{testResult.duration_ms}ms</span>
                </div>
                {testResult.delivery_id && (
                  <div>
                    <span className="font-medium">Delivery ID:</span>
                    <code className="ml-2 px-2 py-1 bg-background rounded text-xs">
                      {testResult.delivery_id}
                    </code>
                  </div>
                )}
                {testResult.signature && (
                  <div>
                    <span className="font-medium">Signature:</span>
                    <code className="ml-2 px-2 py-1 bg-background rounded text-xs break-all">
                      {testResult.signature}
                    </code>
                  </div>
                )}
                {testResult.error_message && (
                  <div className="pt-2 border-t">
                    <span className="font-medium text-red-600">Error:</span>
                    <p className="mt-1 text-red-600">{testResult.error_message}</p>
                  </div>
                )}
                {testResult.response_body && (
                  <div className="pt-2 border-t">
                    <span className="font-medium">Response:</span>
                    <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto max-h-40">
                      {testResult.response_body}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

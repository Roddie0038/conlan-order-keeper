import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { enqueueWebhookEvent, type WebhookEventType } from "@/services/webhookOutbox";

interface PlatformLink {
  id: string;
  platform_id: string;
  webhook_type: string;
  webhook_url: string;
  webhook_secret: string;
  is_active: boolean;
  platform_name?: string;
}

interface OutboxEvent {
  id: string;
  event_id: string;
  event_type: string;
  status: 'pending' | 'processing' | 'delivered' | 'failed';
  retry_count: number;
  max_retries: number;
  error_message?: string;
  delivered_at?: string;
  created_at: string;
}

interface DeliveryLog {
  id: string;
  event_type: string;
  request_url: string;
  response_status: number;
  success: boolean;
  duration_ms: number;
  error_message?: string;
  request_timestamp: string;
}

const EVENT_TEMPLATES: Record<WebhookEventType, any> = {
  'OrderPlaced': {
    order_id: 'TEST-001',
    order_number: `TEST-ORD-${Date.now()}`,
    store: 'Test Store 123',
    plant: 'Grand Prairie 97',
    product_number: 'PROD-001',
    description: 'Test Product',
    quantity: 10,
    schedule_arrival: new Date().toISOString(),
    status: 'open',
    submitted_by_name: 'Test User',
    submitted_by_email: 'test@example.com',
    order_type: 'TRANSFER'
  },
  'OrderCancelled': {
    order_id: 'TEST-001',
    order_number: `TEST-ORD-${Date.now()}`,
    cancellation_reason: 'Test cancellation',
    store: 'Test Store 123',
    plant: 'Grand Prairie 97'
  },
  'OrderModified': {
    order_id: 'TEST-001',
    order_number: `TEST-ORD-${Date.now()}`,
    store: 'Test Store 123',
    plant: 'Grand Prairie 97',
    changes: {
      quantity: { old: 10, new: 15 }
    }
  },
  'MTOOrderPlaced': {
    order_id: `MTO-TEST-${Date.now()}`,
    order_number: `TEST-MTO-${Date.now()}`,
    mto_number: `TEST-MTO-${Date.now()}`,
    store: 'Test Store 123',
    plant: 'Grand Prairie 97',
    product_number: 'MTO-TEST',
    tread: 'R284E',
    tire_size: '11R24.5',
    casing_grade: 'Grade A',
    quantity: 4,
    status: 'open'
  },
  'WheelOrderPlaced': {
    order_id: `WHEEL-TEST-${Date.now()}`,
    order_number: `TEST-WHEEL-${Date.now()}`,
    wheel_number: `TEST-WHEEL-${Date.now()}`,
    store: 'Test Store 123',
    plant: 'Grand Prairie 97',
    product_number: 'WHEEL-COATING',
    wheel_color: 'Black',
    wheel_size: '22.5',
    quantity: 4,
    status: 'open'
  },
  'WarrantySubmitted': {
    order_id: `WAR-TEST-${Date.now()}`,
    order_number: `TEST-WAR-${Date.now()}`,
    warranty_number: `TEST-WAR-${Date.now()}`,
    store: 'Test Store 123',
    plant: 'Grand Prairie 97',
    tire_serial: 'SN123456',
    complaint_type: 'Tread separation',
    status: 'submitted'
  },
  'CrossDockRequested': {
    order_id: `CD-TEST-${Date.now()}`,
    order_number: `TEST-CD-${Date.now()}`,
    request_number: `TEST-CD-${Date.now()}`,
    requesting_store: 'Test Store 123',
    sending_store: 'Test Store 456',
    plant: 'Grand Prairie 97',
    status: 'pending'
  }
};

export function WebhookTestPanel() {
  const [platformLinks, setPlatformLinks] = useState<PlatformLink[]>([]);
  const [selectedEventType, setSelectedEventType] = useState<WebhookEventType>('OrderPlaced');
  const [testPayload, setTestPayload] = useState(JSON.stringify(EVENT_TEMPLATES['OrderPlaced'], null, 2));
  const [testing, setTesting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [testEventId, setTestEventId] = useState<string | null>(null);
  const [outboxStatus, setOutboxStatus] = useState<OutboxEvent | null>(null);
  const [deliveryLogs, setDeliveryLogs] = useState<DeliveryLog[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadPlatformLinks();
  }, []);

  useEffect(() => {
    if (testEventId) {
      const interval = setInterval(() => {
        checkEventStatus(testEventId);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [testEventId]);

  const loadPlatformLinks = async () => {
    try {
      const { data: links, error: linksError } = await supabase
        .from('app_platform_links' as any)
        .select('*')
        .eq('is_active', true);

      if (linksError) throw linksError;

      const { data: platforms, error: platformsError } = await supabase
        .from('app_platforms' as any)
        .select('id, platform_name');

      if (platformsError) throw platformsError;

      const platformMap = new Map(platforms?.map((p: any) => [p.id, p.platform_name]) || []);
      
      const enrichedLinks = (links || []).map((link: any) => ({
        ...link,
        platform_name: platformMap.get(link.platform_id) || 'Unknown'
      }));

      setPlatformLinks(enrichedLinks);
    } catch (error) {
      console.error('Error loading platform links:', error);
      toast({
        title: "Error",
        description: "Failed to load webhook configurations",
        variant: "destructive"
      });
    }
  };

  const handleEventTypeChange = (eventType: WebhookEventType) => {
    setSelectedEventType(eventType);
    setTestPayload(JSON.stringify(EVENT_TEMPLATES[eventType], null, 2));
  };

  const checkEventStatus = async (eventId: string) => {
    try {
      const { data: outbox, error: outboxError } = await supabase
        .from('webhook_outbox' as any)
        .select('*')
        .eq('event_id', eventId)
        .single();

      if (!outboxError && outbox) {
        setOutboxStatus(outbox as unknown as OutboxEvent);
      }

      const { data: logs, error: logsError } = await supabase
        .from('app_webhook_deliveries' as any)
        .select('*')
        .eq('idempotency_key', eventId)
        .order('created_at', { ascending: false });

      if (!logsError && logs) {
        setDeliveryLogs(logs as unknown as DeliveryLog[]);
      }
    } catch (error) {
      console.error('Error checking event status:', error);
    }
  };

  const handleSendTest = async () => {
    let parsedPayload;
    try {
      parsedPayload = JSON.parse(testPayload);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your test payload format",
        variant: "destructive"
      });
      return;
    }

    setTesting(true);
    setOutboxStatus(null);
    setDeliveryLogs([]);

    try {
      const traceId = `test-${Date.now()}`;
      const result = await enqueueWebhookEvent({
        event_type: selectedEventType,
        trace_id: traceId,
        payload: {
          ...parsedPayload,
          timestamp: new Date().toISOString(),
          source: 'ordering',
          test: true
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to enqueue event');
      }

      setTestEventId(result.event_id || null);
      
      toast({
        title: "Test Event Enqueued",
        description: `Event ID: ${result.event_id}. Click "Trigger Publisher" to process.`
      });

      // Wait a moment and check status
      setTimeout(() => {
        if (result.event_id) {
          checkEventStatus(result.event_id);
        }
      }, 500);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
    }
  };

  const handleTriggerPublisher = async () => {
    setPublishing(true);

    try {
      const { data, error } = await supabase.functions.invoke('webhook-outbound-publisher', {
        body: {}
      });

      if (error) throw error;

      toast({
        title: "Publisher Triggered",
        description: `Processed: ${data?.results?.processed || 0}, Delivered: ${data?.results?.delivered || 0}`
      });

      // Refresh status after a moment
      if (testEventId) {
        setTimeout(() => {
          checkEventStatus(testEventId);
        }, 1000);
      }
    } catch (error: any) {
      toast({
        title: "Publisher Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setPublishing(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const activeLinks = platformLinks.filter(link => 
    link.webhook_type === selectedEventType
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Webhook Test Panel</h2>
          <p className="text-muted-foreground">
            Test webhook delivery to configured platforms
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadPlatformLinks}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          This panel creates real webhook events in the outbox. Events are queued and processed by the webhook-outbound-publisher function.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Configure Test Event</CardTitle>
          <CardDescription>
            Select event type and customize the payload
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Event Type</Label>
            <Select value={selectedEventType} onValueChange={(v) => handleEventTypeChange(v as WebhookEventType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OrderPlaced">OrderPlaced</SelectItem>
                <SelectItem value="OrderCancelled">OrderCancelled</SelectItem>
                <SelectItem value="OrderModified">OrderModified</SelectItem>
                <SelectItem value="MTOOrderPlaced">MTOOrderPlaced</SelectItem>
                <SelectItem value="WheelOrderPlaced">WheelOrderPlaced</SelectItem>
                <SelectItem value="WarrantySubmitted">WarrantySubmitted</SelectItem>
                <SelectItem value="CrossDockRequested">CrossDockRequested</SelectItem>
              </SelectContent>
            </Select>
            
            {activeLinks.length > 0 ? (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-muted-foreground">
                  {activeLinks.length} active webhook(s) configured for this event type
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-destructive">
                  No active webhooks configured for this event type
                </span>
              </div>
            )}
          </div>

          {activeLinks.length > 0 && (
            <div className="space-y-2">
              <Label>Active Webhook Endpoints</Label>
              <div className="space-y-2">
                {activeLinks.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{link.platform_name}</p>
                      <p className="text-xs text-muted-foreground truncate">{link.webhook_url}</p>
                    </div>
                    <Badge variant="outline">Active</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Test Payload (JSON)</Label>
            <Textarea
              className="font-mono text-xs"
              rows={12}
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSendTest}
              disabled={testing || activeLinks.length === 0}
              className="flex-1"
            >
              {testing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enqueueing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enqueue Test Event
                </>
              )}
            </Button>

            <Button
              onClick={handleTriggerPublisher}
              disabled={publishing || !testEventId}
              variant="secondary"
            >
              {publishing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Triggering...
                </>
              ) : (
                'Trigger Publisher'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {(outboxStatus || deliveryLogs.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Real-Time Status</CardTitle>
            <CardDescription>
              Live updates for event: {testEventId}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {outboxStatus && (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(outboxStatus.status)}
                    <div>
                      <p className="font-medium text-sm">Outbox Status</p>
                      <p className="text-xs text-muted-foreground">
                        Retry: {outboxStatus.retry_count}/{outboxStatus.max_retries}
                      </p>
                    </div>
                  </div>
                  <Badge variant={
                    outboxStatus.status === 'delivered' ? 'default' :
                    outboxStatus.status === 'failed' ? 'destructive' : 'secondary'
                  }>
                    {outboxStatus.status}
                  </Badge>
                </div>

                {outboxStatus.error_message && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{outboxStatus.error_message}</AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {deliveryLogs.length > 0 && (
              <div className="space-y-2">
                <Label>Delivery Logs</Label>
                {deliveryLogs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {log.success ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-destructive" />
                        )}
                        <span className="font-medium text-sm">{log.event_type}</span>
                      </div>
                      <Badge variant={log.success ? 'default' : 'destructive'}>
                        {log.response_status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>URL: {log.request_url}</p>
                      <p>Duration: {log.duration_ms}ms</p>
                      <p>Time: {new Date(log.request_timestamp).toLocaleString()}</p>
                      {log.error_message && (
                        <p className="text-destructive">Error: {log.error_message}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

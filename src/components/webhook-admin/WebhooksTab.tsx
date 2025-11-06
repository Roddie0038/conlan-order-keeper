import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Settings, Zap, Key, RefreshCw } from "lucide-react";
import type { AppWebhook, WebhookEventSubscription } from "@/types/webhook-admin";
import { ConnectionDetailsDialog } from "./ConnectionDetailsDialog";
import { EventSubscriptionsDialog } from "./EventSubscriptionsDialog";
import { WebhookConfigDialog } from "./WebhookConfigDialog";
import { ReceivingCredentialsHeader } from "./ReceivingCredentialsHeader";

export function WebhooksTab() {
  const [webhooks, setWebhooks] = useState<AppWebhook[]>([]);
  const [subscriptions, setSubscriptions] = useState<Record<string, WebhookEventSubscription[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedWebhook, setSelectedWebhook] = useState<AppWebhook | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);
  const [showEventsDialog, setShowEventsDialog] = useState(false);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [userRole, setUserRole] = useState<'super_admin' | 'ops_manager' | null>(null);
  const [firstPlatform, setFirstPlatform] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadWebhooks();
    loadUserRole();
    loadAndEnsurePlatform();
  }, []);

  const loadAndEnsurePlatform = async () => {
    try {
      // Load existing platforms
      const { data: platforms, error } = await supabase
        .from('app_platforms' as any)
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!platforms || platforms.length === 0) {
        // Auto-create default platform
        const { data: { user } } = await supabase.auth.getUser();
        const defaultPlatform = {
          platform_name: 'Ordering Platform Default',
          platform_key: 'ordering-platform',
          webhook_secret: crypto.randomUUID(),
          is_active: true,
          rate_limit_per_minute: 100,
          description: 'Default webhook receiver for Ordering Platform',
          created_by: user?.id,
        };

        const { data: newPlatform, error: insertError } = await supabase
          .from('app_platforms' as any)
          .insert(defaultPlatform)
          .select()
          .single();

        if (insertError) throw insertError;
        if (!newPlatform) throw new Error('Failed to create platform');

        // Log audit
        await supabase.from('app_platform_audit' as any).insert({
          platform_id: (newPlatform as any).id,
          user_id: user?.id,
          user_email: user?.email,
          action: 'platform_created',
          new_values: defaultPlatform,
          metadata: { auto_created: true },
        });

        setFirstPlatform(newPlatform);
        toast({
          title: "Default Platform Created",
          description: "A default webhook receiver platform has been set up for you.",
        });
      } else {
        setFirstPlatform(platforms[0]);
      }
    } catch (error: any) {
      console.error('Error loading/creating platform:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setUserRole((data as any)?.role || null);
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadWebhooks = async () => {
    try {
      const { data, error } = await supabase
        .from('app_webhooks' as any)
        .select('*')
        .order('name');

      if (error) throw error;
      setWebhooks((data || []) as unknown as AppWebhook[]);

      // Load subscriptions for each webhook
      const subsMap: Record<string, WebhookEventSubscription[]> = {};
      for (const webhook of (data || []) as unknown as AppWebhook[]) {
        const { data: subs } = await supabase
          .from('webhook_event_subscriptions' as any)
          .select('*')
          .eq('webhook_id', webhook.id);
        subsMap[webhook.id] = (subs || []) as unknown as WebhookEventSubscription[];
      }
      setSubscriptions(subsMap);
    } catch (error: any) {
      toast({
        title: "Error loading webhooks",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (webhook: AppWebhook) => {
    try {
      const { error } = await supabase
        .from('app_webhooks' as any)
        .update({ is_active: !webhook.is_active })
        .eq('id', webhook.id);

      if (error) throw error;

      // Log audit
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('app_webhook_audit' as any).insert({
        webhook_id: webhook.id,
        user_id: user?.id,
        user_email: user?.email,
        action: 'webhook_toggled',
        old_values: { is_active: webhook.is_active },
        new_values: { is_active: !webhook.is_active },
      });

      toast({
        title: "Success",
        description: `Webhook ${!webhook.is_active ? 'enabled' : 'disabled'}`,
      });

      loadWebhooks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openConnectionDialog = (webhook: AppWebhook) => {
    setSelectedWebhook(webhook);
    setShowConnectionDialog(true);
  };

  const openEventsDialog = (webhook: AppWebhook) => {
    setSelectedWebhook(webhook);
    setShowEventsDialog(true);
  };

  const openConfigDialog = (webhook: AppWebhook) => {
    setSelectedWebhook(webhook);
    setShowConfigDialog(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Receiving Credentials Header */}
        <ReceivingCredentialsHeader 
          platform={firstPlatform} 
          onPlatformUpdated={() => loadAndEnsurePlatform()}
        />

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Webhook Endpoints</h2>
            <p className="text-muted-foreground">
              Manage webhook configurations for OT, Inventory, Management, and Fleet platforms
            </p>
          </div>
          <Button onClick={() => { loadWebhooks(); loadAndEnsurePlatform(); }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="grid gap-4">
          {webhooks.map((webhook) => {
            const webhookSubs = subscriptions[webhook.id] || [];
            const enabledSubs = webhookSubs.filter(s => s.is_enabled).length;

            return (
              <Card key={webhook.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle>{webhook.name}</CardTitle>
                        <Badge variant={webhook.is_active ? "default" : "secondary"}>
                          {webhook.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <CardDescription>{webhook.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Badge variant="outline">{enabledSubs} / {webhookSubs.length} events</Badge>
                    <span>•</span>
                    <span>Rate: {webhook.rate_limit_per_minute}/min</span>
                    <span>•</span>
                    <span>Timeout: {webhook.timeout_seconds}s</span>
                    <span>•</span>
                    <span>Retries: {webhook.retry_enabled ? webhook.max_retries : 'Disabled'}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConnectionDialog(webhook)}
                    >
                      <Key className="h-4 w-4 mr-2" />
                      Connection Details
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEventsDialog(webhook)}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Event Subscriptions
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConfigDialog(webhook)}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>

                    <Button
                      variant={webhook.is_active ? "secondary" : "default"}
                      size="sm"
                      onClick={() => handleToggleActive(webhook)}
                    >
                      {webhook.is_active ? "Disable" : "Enable"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <ConnectionDetailsDialog
        webhook={selectedWebhook}
        open={showConnectionDialog}
        onOpenChange={setShowConnectionDialog}
        onUpdate={loadWebhooks}
        userRole={userRole}
      />

      <EventSubscriptionsDialog
        webhook={selectedWebhook}
        open={showEventsDialog}
        onOpenChange={setShowEventsDialog}
      />

      <WebhookConfigDialog
        webhook={selectedWebhook}
        open={showConfigDialog}
        onOpenChange={setShowConfigDialog}
        onUpdate={loadWebhooks}
      />
    </>
  );
}

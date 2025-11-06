import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { AppWebhook, WebhookEventSubscription } from "@/types/webhook-admin";
import { Badge } from "@/components/ui/badge";

interface EventSubscriptionsDialogProps {
  webhook: AppWebhook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EVENT_DESCRIPTIONS: Record<string, string> = {
  'order.created': 'New order submitted',
  'order.updated': 'Order status or details changed',
  'order.completed': 'Order marked as completed',
  'mto.created': 'New MTO order created',
  'mto.updated': 'MTO order updated',
  'wheel.created': 'New wheel order created',
  'warranty.created': 'New warranty claim created',
  'user.sync': 'User data synchronization',
  'cross_dock.created': 'New cross dock request created',
};

export function EventSubscriptionsDialog({ webhook, open, onOpenChange }: EventSubscriptionsDialogProps) {
  const [subscriptions, setSubscriptions] = useState<WebhookEventSubscription[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (webhook && open) {
      loadSubscriptions();
    }
  }, [webhook, open]);

  const loadSubscriptions = async () => {
    if (!webhook) return;

    try {
      const { data, error } = await supabase
        .from('webhook_event_subscriptions' as any)
        .select('*')
        .eq('webhook_id', webhook.id)
        .order('event_type');

      if (error) throw error;
      setSubscriptions((data || []) as unknown as WebhookEventSubscription[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleToggleSubscription = async (eventType: string, isEnabled: boolean) => {
    if (!webhook) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('webhook_event_subscriptions' as any)
        .update({ is_enabled: isEnabled })
        .eq('webhook_id', webhook.id)
        .eq('event_type', eventType);

      if (error) throw error;

      // Log audit
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('app_webhook_audit' as any).insert({
        webhook_id: webhook.id,
        user_id: user?.id,
        user_email: user?.email,
        action: 'event_subscription_updated',
        old_values: { event_type: eventType, is_enabled: !isEnabled },
        new_values: { event_type: eventType, is_enabled: isEnabled },
      });

      setSubscriptions(prev =>
        prev.map(sub =>
          sub.event_type === eventType ? { ...sub, is_enabled: isEnabled } : sub
        )
      );

      toast({
        title: "Updated",
        description: `Event subscription ${isEnabled ? 'enabled' : 'disabled'}`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!webhook) return null;

  const enabledCount = subscriptions.filter(s => s.is_enabled).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Event Subscriptions - {webhook.name}</DialogTitle>
          <DialogDescription>
            Control which events trigger this webhook
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-1 mb-4">
          <Badge variant="secondary">
            {enabledCount} of {subscriptions.length} events enabled
          </Badge>
        </div>

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {subscriptions.map(subscription => (
            <div
              key={subscription.id}
              className="flex items-start justify-between p-4 border rounded-lg"
            >
              <div className="flex-1">
                <Label className="text-base font-medium">
                  {subscription.event_type}
                </Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {EVENT_DESCRIPTIONS[subscription.event_type] || 'Event description not available'}
                </p>
              </div>
              <Switch
                checked={subscription.is_enabled}
                onCheckedChange={(checked) =>
                  handleToggleSubscription(subscription.event_type, checked)
                }
                disabled={loading}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

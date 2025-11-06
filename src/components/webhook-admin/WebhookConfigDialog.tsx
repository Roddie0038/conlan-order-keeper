import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { AppWebhook } from "@/types/webhook-admin";

interface WebhookConfigDialogProps {
  webhook: AppWebhook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
}

export function WebhookConfigDialog({ 
  webhook, 
  open, 
  onOpenChange, 
  onUpdate 
}: WebhookConfigDialogProps) {
  const [formData, setFormData] = useState<Partial<AppWebhook>>(webhook || {});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('app_webhooks' as any)
        .update({
          name: formData.name,
          description: formData.description,
          endpoint_url: formData.endpoint_url,
          rate_limit_per_minute: formData.rate_limit_per_minute,
          timeout_seconds: formData.timeout_seconds,
          retry_enabled: formData.retry_enabled,
          max_retries: formData.max_retries,
          is_active: formData.is_active,
          hmac_enabled: formData.hmac_enabled,
        })
        .eq('id', webhook?.id);

      if (error) throw error;

      // Log audit
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('app_webhook_audit' as any).insert({
        webhook_id: webhook?.id,
        user_id: user?.id,
        user_email: user?.email,
        action: 'webhook_updated',
        old_values: webhook,
        new_values: formData,
      });

      toast({
        title: "Success",
        description: "Webhook configuration updated",
      });

      onUpdate();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!webhook) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configure Webhook</DialogTitle>
          <DialogDescription>
            Update webhook settings, rate limits, and retry policies
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endpoint_url">Endpoint URL</Label>
            <Input
              id="endpoint_url"
              type="url"
              value={formData.endpoint_url || ''}
              onChange={(e) => setFormData({ ...formData, endpoint_url: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rate_limit">Rate Limit (per minute)</Label>
              <Input
                id="rate_limit"
                type="number"
                min="1"
                max="1000"
                value={formData.rate_limit_per_minute || 60}
                onChange={(e) => setFormData({ ...formData, rate_limit_per_minute: parseInt(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                min="5"
                max="120"
                value={formData.timeout_seconds || 30}
                onChange={(e) => setFormData({ ...formData, timeout_seconds: parseInt(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>HMAC Signature Verification</Label>
              <p className="text-sm text-muted-foreground">
                Sign requests with HMAC-SHA256
              </p>
            </div>
            <Switch
              checked={formData.hmac_enabled ?? true}
              onCheckedChange={(checked) => setFormData({ ...formData, hmac_enabled: checked })}
            />
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Enable Retries</Label>
              <p className="text-sm text-muted-foreground">
                Automatically retry failed deliveries
              </p>
            </div>
            <Switch
              checked={formData.retry_enabled ?? true}
              onCheckedChange={(checked) => setFormData({ ...formData, retry_enabled: checked })}
            />
          </div>

          {formData.retry_enabled && (
            <div className="space-y-2">
              <Label htmlFor="max_retries">Maximum Retries</Label>
              <Input
                id="max_retries"
                type="number"
                min="0"
                max="10"
                value={formData.max_retries || 3}
                onChange={(e) => setFormData({ ...formData, max_retries: parseInt(e.target.value) })}
              />
            </div>
          )}

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <Label>Active</Label>
              <p className="text-sm text-muted-foreground">
                Enable or disable webhook deliveries
              </p>
            </div>
            <Switch
              checked={formData.is_active ?? true}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

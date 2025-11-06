import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, RotateCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { AppWebhook } from "@/types/webhook-admin";

interface ConnectionDetailsDialogProps {
  webhook: AppWebhook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  userRole: 'super_admin' | 'ops_manager' | null;
}

export function ConnectionDetailsDialog({ 
  webhook, 
  open, 
  onOpenChange, 
  onUpdate,
  userRole 
}: ConnectionDetailsDialogProps) {
  const [showSecret, setShowSecret] = useState(false);
  const [showPreviousSecret, setShowPreviousSecret] = useState(false);
  const [rotating, setRotating] = useState(false);
  const { toast } = useToast();

  if (!webhook) return null;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleRotateSecret = async () => {
    if (userRole !== 'super_admin') {
      toast({
        title: "Access Denied",
        description: "Only Super Admins can rotate secrets",
        variant: "destructive",
      });
      return;
    }

    setRotating(true);
    try {
      const newSecret = crypto.randomUUID();
      
      const { error } = await supabase
        .from('app_webhooks' as any)
        .update({
          previous_secret: webhook.webhook_secret,
          webhook_secret: newSecret,
          secret_rotated_at: new Date().toISOString(),
        })
        .eq('id', webhook.id);

      if (error) throw error;

      // Log audit
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('app_webhook_audit' as any).insert({
        webhook_id: webhook.id,
        user_id: user?.id,
        user_email: user?.email,
        action: 'secret_rotated',
        old_values: { webhook_secret: '***' },
        new_values: { webhook_secret: '***' },
      });

      toast({
        title: "Secret Rotated",
        description: "Webhook secret has been rotated successfully. Update your external platforms with the new secret.",
      });
      
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRotating(false);
    }
  };

  const maskSecret = (secret: string) => {
    return secret.slice(0, 8) + '•'.repeat(24);
  };

  const canRevealSecrets = userRole === 'super_admin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Connection Details - {webhook.name}</DialogTitle>
          <DialogDescription>
            Copy these details to configure webhook connections in OT, Inventory, Management, or Fleet platforms
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Endpoint URL */}
          <div className="space-y-2">
            <Label>Webhook Endpoint URL</Label>
            <div className="flex gap-2">
              <Input value={webhook.endpoint_url} readOnly className="font-mono text-xs" />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(webhook.endpoint_url, "Endpoint URL")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Use this URL when configuring webhook endpoints in external platforms
            </p>
          </div>

          {/* Unified Headers Documentation */}
          <div className="p-4 bg-muted rounded-lg space-y-3">
            <h4 className="font-semibold text-sm">Required Headers</h4>
            <div className="space-y-2 text-xs">
              <div>
                <code className="px-2 py-1 bg-background rounded">x-cto-signature</code>
                <p className="mt-1 text-muted-foreground">
                  HMAC-SHA256 signature computed over: <code>timestamp.raw_body</code>
                </p>
              </div>
              <div>
                <code className="px-2 py-1 bg-background rounded">x-cto-timestamp</code>
                <p className="mt-1 text-muted-foreground">
                  Unix timestamp (seconds). Must be within 5 minutes of server time.
                </p>
              </div>
              <div>
                <code className="px-2 py-1 bg-background rounded">x-cto-delivery-id</code>
                <p className="mt-1 text-muted-foreground">
                  Unique delivery ID (UUID) for idempotency checking.
                </p>
              </div>
            </div>
          </div>

          {/* HMAC Signature Algorithm */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-semibold text-sm">HMAC Signature Algorithm</h4>
            <div className="text-xs space-y-2 text-muted-foreground">
              <p>1. Concatenate: <code className="px-1 py-0.5 bg-background rounded">timestamp + "." + raw_body</code></p>
              <p>2. Compute: <code className="px-1 py-0.5 bg-background rounded">HMAC-SHA256(secret, data)</code></p>
              <p>3. Encode as hex and set in header: <code className="px-1 py-0.5 bg-background rounded">x-cto-signature</code></p>
              <p className="pt-2 font-medium">⏰ Timestamp Tolerance: 5 minutes</p>
              <p>🔒 Idempotency: Duplicate delivery IDs within 24 hours are rejected</p>
            </div>
          </div>

          {/* Current Secret */}
          <div className="space-y-2">
            <Label>Current Webhook Secret</Label>
            <div className="flex gap-2">
              <Input
                type={showSecret ? "text" : "password"}
                value={showSecret ? webhook.webhook_secret : maskSecret(webhook.webhook_secret)}
                readOnly
              />
              {canRevealSecrets && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowSecret(!showSecret)}
                >
                  {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              )}
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(webhook.webhook_secret, "Webhook Secret")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {!canRevealSecrets && (
              <p className="text-xs text-muted-foreground">
                Only Super Admins can reveal the full secret
              </p>
            )}
          </div>

          {/* Previous Secret */}
          {webhook.previous_secret && (
            <div className="space-y-2">
              <Label>Previous Secret (for migration)</Label>
              <div className="flex gap-2">
                <Input
                  type={showPreviousSecret ? "text" : "password"}
                  value={showPreviousSecret ? webhook.previous_secret : maskSecret(webhook.previous_secret)}
                  readOnly
                />
                {canRevealSecrets && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowPreviousSecret(!showPreviousSecret)}
                  >
                    {showPreviousSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(webhook.previous_secret!, "Previous Secret")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              {webhook.secret_rotated_at && (
                <p className="text-xs text-muted-foreground">
                  Rotated: {new Date(webhook.secret_rotated_at).toLocaleString()}
                </p>
              )}
            </div>
          )}

          {/* Rotate Secret Button */}
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleRotateSecret}
              disabled={rotating || userRole !== 'super_admin'}
              className="w-full"
            >
              <RotateCw className={`h-4 w-4 mr-2 ${rotating ? 'animate-spin' : ''}`} />
              Rotate Secret
            </Button>
            {userRole !== 'super_admin' && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Only Super Admins can rotate secrets
              </p>
            )}
          </div>

          {/* Integration Instructions */}
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <h4 className="font-medium text-sm">Integration Instructions:</h4>
            <ol className="text-xs space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Copy the Endpoint URL and Webhook Secret above</li>
              <li>In your external platform (OT, Inventory, Management, Fleet), navigate to webhook configuration</li>
              <li>Add a new webhook endpoint with the copied URL</li>
              <li>Set the secret for HMAC signature verification</li>
              <li>Configure the required headers: <code className="px-1 py-0.5 bg-background rounded">x-cto-signature</code>, <code className="px-1 py-0.5 bg-background rounded">x-cto-timestamp</code>, <code className="px-1 py-0.5 bg-background rounded">x-cto-delivery-id</code></li>
              <li>Select the events you want to subscribe to</li>
              <li>Test the connection using the Tools tab's test payload generator</li>
            </ol>
          </div>

          {/* Secret Rotation Info */}
          {webhook.previous_secret && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                ⚠️ <strong>Secret rotation active:</strong> Both current and previous secrets are valid during the migration period. 
                Update your external platforms with the new secret, then the previous secret will be automatically expired.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

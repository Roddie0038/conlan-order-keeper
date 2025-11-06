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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Connection Details - {webhook.name}</DialogTitle>
          <DialogDescription>
            Copy these details to configure webhook connections in OT, Inventory, Management, or Fleet platforms
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Endpoint URL */}
          <div className="space-y-2">
            <Label>Webhook Endpoint URL</Label>
            <div className="flex gap-2">
              <Input value={webhook.endpoint_url} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(webhook.endpoint_url, "Endpoint URL")}
              >
                <Copy className="h-4 w-4" />
              </Button>
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
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Copy the Endpoint URL and Webhook Secret above</li>
              <li>In your external platform, navigate to webhook configuration</li>
              <li>Add a new webhook endpoint with the copied URL</li>
              <li>Set the secret for HMAC signature verification</li>
              <li>Configure the header: <code className="px-1 py-0.5 bg-background rounded">x-cto-signature</code></li>
              <li>Test the connection using the test payload generator</li>
            </ol>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

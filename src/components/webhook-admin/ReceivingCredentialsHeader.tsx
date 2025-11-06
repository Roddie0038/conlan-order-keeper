import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Server, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Platform {
  id: string;
  platform_key: string;
  platform_name: string;
  webhook_secret: string;
}

interface ReceivingCredentialsHeaderProps {
  platform: Platform | null;
  onPlatformUpdated?: () => void;
}

const PROJECT_REF = "cyzywykgdravxfnhskzq";
const BASE_URL = `https://${PROJECT_REF}.supabase.co/functions/v1/webhook-receiver/webhook`;

export function ReceivingCredentialsHeader({ platform, onPlatformUpdated }: ReceivingCredentialsHeaderProps) {
  const { toast } = useToast();
  const [showRotateDialog, setShowRotateDialog] = useState(false);
  const [rotating, setRotating] = useState(false);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const fullUrl = platform ? `${BASE_URL}/${platform.platform_key}` : BASE_URL;

  const handleRotateSecret = async () => {
    if (!platform) return;
    
    setRotating(true);
    try {
      const newSecret = crypto.randomUUID();
      const now = new Date().toISOString();

      // Update platform with new secret
      const { error: updateError } = await supabase
        .from('app_platforms' as any)
        .update({
          webhook_secret: newSecret,
          updated_at: now,
        })
        .eq('id', platform.id);

      if (updateError) throw updateError;

      // Log audit
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('app_platform_audit' as any).insert({
        platform_id: platform.id,
        user_id: user?.id,
        user_email: user?.email,
        action: 'secret_rotated',
        old_values: { webhook_secret: platform.webhook_secret },
        new_values: { webhook_secret: newSecret },
        metadata: { rotated_at: now },
      });

      toast({
        title: "Secret Rotated",
        description: "Webhook secret has been regenerated successfully",
      });

      setShowRotateDialog(false);
      onPlatformUpdated?.();
    } catch (error: any) {
      console.error('Error rotating secret:', error);
      toast({
        title: "Rotation Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setRotating(false);
    }
  };

  return (
    <>
    <Card className="bg-gradient-to-br from-primary/5 via-primary/3 to-background border-primary/20">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Server className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl">Ordering Platform Receiving Credentials</CardTitle>
            <CardDescription className="mt-1">
              Use these credentials to configure external platforms (OT, Inventory, Management, Fleet) to send webhooks to this Ordering Platform
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Base Webhook URL */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold">Base Webhook URL</Label>
          <div className="flex gap-2">
            <Input 
              value={BASE_URL} 
              readOnly 
              className="font-mono text-xs bg-muted"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(BASE_URL, "Base URL")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Append your platform key to this base URL: <code className="px-1 py-0.5 bg-muted rounded">{`{base_url}/{platform_key}`}</code>
          </p>
        </div>

        {/* First Platform Details */}
        {platform && (
          <div className="p-4 rounded-lg border bg-card space-y-4">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              First Platform Details
            </h4>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Platform Key</Label>
                <div className="flex gap-2">
                  <Input 
                    value={platform.platform_key} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(platform.platform_key, "Platform Key")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Full Webhook URL</Label>
                <div className="flex gap-2">
                  <Input 
                    value={fullUrl} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(fullUrl, "Full URL")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Webhook Secret</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRotateDialog(true)}
                  disabled={rotating}
                  className="h-7 text-xs"
                >
                  <RefreshCw className={`h-3 w-3 mr-1 ${rotating ? 'animate-spin' : ''}`} />
                  Rotate Secret
                </Button>
              </div>
              <div className="flex gap-2">
                <Input 
                  value={platform.webhook_secret} 
                  readOnly 
                  type="text"
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyToClipboard(platform.webhook_secret, "Webhook Secret")}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Setup Instructions */}
        <div className="p-4 rounded-lg bg-muted/50 space-y-3">
          <h4 className="font-semibold text-sm">Quick Setup Instructions</h4>
          <ol className="text-xs space-y-2 list-decimal list-inside text-muted-foreground pl-2">
            <li>Copy the <strong>Platform Key</strong>, <strong>Full Webhook URL</strong>, and <strong>Webhook Secret</strong> above</li>
            <li>In your external platform (OT, Inventory, Management, Fleet), navigate to webhook configuration</li>
            <li>Add a new outbound webhook endpoint with the copied Full URL</li>
            <li>Set the webhook secret for HMAC signature verification</li>
            <li>Configure the required headers:
              <ul className="list-disc list-inside pl-4 mt-1 space-y-1">
                <li><code className="px-1 py-0.5 bg-background rounded">x-cto-signature</code>: HMAC-SHA256 over <code>timestamp.raw_body</code></li>
                <li><code className="px-1 py-0.5 bg-background rounded">x-cto-timestamp</code>: Unix timestamp (must be within 5 minutes)</li>
                <li><code className="px-1 py-0.5 bg-background rounded">x-cto-delivery-id</code>: Unique UUID for idempotency</li>
              </ul>
            </li>
            <li>Select the events you want to forward to this platform</li>
            <li>Test the connection using your platform's test webhook feature</li>
            <li>Monitor delivery logs in the <strong>Deliveries</strong> tab to verify successful integration</li>
          </ol>
        </div>

        {!platform && (
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              ℹ️ No platforms configured yet. A default platform will be created automatically when you refresh this page.
            </p>
          </div>
        )}
      </CardContent>
    </Card>

      <AlertDialog open={showRotateDialog} onOpenChange={setShowRotateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rotate Webhook Secret?</AlertDialogTitle>
            <AlertDialogDescription>
              This will generate a new webhook secret for the <strong>{platform?.platform_name}</strong> platform.
              <br /><br />
              <strong className="text-destructive">Warning:</strong> External platforms using the old secret will stop working until you update them with the new secret.
              <br /><br />
              This action will be logged in the audit trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={rotating}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRotateSecret}
              disabled={rotating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {rotating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Rotating...
                </>
              ) : (
                "Rotate Secret"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

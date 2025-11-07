import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Eye, EyeOff, RotateCw, CheckCircle, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Platform {
  id: string;
  platform_name: string;
  platform_key: string;
  webhook_secret: string | null;
  is_active: boolean;
  description: string | null;
}

interface InboundPlatformsSectionProps {
  platforms: Platform[];
  onPlatformUpdated: () => void;
  userRole: string | null;
}

export function InboundPlatformsSection({ platforms, onPlatformUpdated, userRole }: InboundPlatformsSectionProps) {
  const [revealedSecrets, setRevealedSecrets] = useState<Set<string>>(new Set());
  const [rotatingSecret, setRotatingSecret] = useState<string | null>(null);
  const [confirmRotateId, setConfirmRotateId] = useState<string | null>(null);

  const baseUrl = "https://cyzywykgdravxfnhskzq.supabase.co/functions/v1/webhook-receiver/webhook";

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const toggleSecretVisibility = (platformId: string) => {
    const newRevealed = new Set(revealedSecrets);
    if (newRevealed.has(platformId)) {
      newRevealed.delete(platformId);
    } else {
      newRevealed.add(platformId);
    }
    setRevealedSecrets(newRevealed);
  };

  const handleRotateSecret = async (platform: Platform) => {
    if (userRole !== 'super_admin') {
      toast.error("Only super admins can rotate webhook secrets");
      return;
    }

    setRotatingSecret(platform.id);
    try {
      const newSecret = crypto.randomUUID();
      
      const { error: updateError } = await supabase
        .from('app_platforms' as any)
        .update({
          webhook_secret: newSecret,
          updated_at: new Date().toISOString()
        })
        .eq('id', platform.id);

      if (updateError) throw updateError;

      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('app_platform_audit' as any).insert({
        platform_id: platform.id,
        user_id: user?.id,
        user_email: user?.email,
        action: 'secret_rotated',
        old_values: { webhook_secret: platform.webhook_secret },
        new_values: { webhook_secret: newSecret },
        metadata: { platform_key: platform.platform_key }
      });

      toast.success("Webhook secret rotated successfully");
      setConfirmRotateId(null);
      onPlatformUpdated();
    } catch (error) {
      console.error('Error rotating secret:', error);
      toast.error("Failed to rotate webhook secret");
    } finally {
      setRotatingSecret(null);
    }
  };

  const maskSecret = (secret: string) => {
    if (secret.length <= 8) return '••••••••';
    return secret.substring(0, 4) + '••••••••' + secret.substring(secret.length - 4);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Inbound Webhook Receivers</h2>
        <p className="text-muted-foreground">
          Configure platforms that can send events to this Ordering Platform
        </p>
      </div>

      <div className="grid gap-4">
        {platforms.map((platform) => {
          const fullUrl = `${baseUrl}/${platform.platform_key}`;
          const isRevealed = revealedSecrets.has(platform.id);
          const canReveal = userRole === 'super_admin';

          return (
            <Card key={platform.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold">{platform.platform_name}</h3>
                    <Badge variant={platform.is_active ? "default" : "secondary"}>
                      {platform.is_active ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Inactive
                        </>
                      )}
                    </Badge>
                  </div>
                  {platform.description && (
                    <p className="text-sm text-muted-foreground">{platform.description}</p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {/* Platform Key */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1">
                    Platform Key
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                      {platform.platform_key}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(platform.platform_key, "Platform key")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Webhook URL */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1">
                    Webhook Endpoint URL
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono break-all">
                      {fullUrl}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(fullUrl, "Webhook URL")}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Webhook Secret */}
                <div>
                  <label className="text-sm font-medium text-muted-foreground block mb-1">
                    Webhook Secret (HMAC Signing Key)
                  </label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                      {platform.webhook_secret ? (
                        isRevealed ? platform.webhook_secret : maskSecret(platform.webhook_secret)
                      ) : (
                        <span className="text-destructive">No secret configured</span>
                      )}
                    </code>
                    {canReveal && platform.webhook_secret && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleSecretVisibility(platform.id)}
                      >
                        {isRevealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    )}
                    {platform.webhook_secret && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(platform.webhook_secret!, "Webhook secret")}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {canReveal && (
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setConfirmRotateId(platform.id)}
                      disabled={rotatingSecret === platform.id}
                    >
                      <RotateCw className={`w-4 h-4 mr-2 ${rotatingSecret === platform.id ? 'animate-spin' : ''}`} />
                      Rotate Secret
                    </Button>
                  </div>
                )}
              </div>

              <AlertDialog open={confirmRotateId === platform.id} onOpenChange={(open) => !open && setConfirmRotateId(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Rotate Webhook Secret?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will generate a new secret for {platform.platform_name}. The old secret will be invalidated immediately.
                      Make sure to update the secret in the sending platform to avoid delivery failures.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleRotateSecret(platform)}>
                      Rotate Secret
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </Card>
          );
        })}

        {platforms.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No inbound webhook platforms configured yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

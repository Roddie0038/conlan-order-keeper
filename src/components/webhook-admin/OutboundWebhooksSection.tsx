import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Settings, CheckCircle, XCircle, Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";

interface Platform {
  id: string;
  platform_name: string;
  platform_key: string;
}

interface WebhookLink {
  id: string;
  webhook_type: string;
  webhook_url: string;
  platform_id: string;
  is_active: boolean;
  hmac_enabled: boolean;
  rate_limit_per_minute: number | null;
  timeout_seconds: number | null;
  retry_enabled: boolean | null;
  max_retries: number | null;
  platform?: Platform;
}

interface OutboundWebhooksSectionProps {
  webhookLinks: WebhookLink[];
  platforms: Platform[];
}

export function OutboundWebhooksSection({ webhookLinks, platforms }: OutboundWebhooksSectionProps) {
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard`);
    } catch (err) {
      toast.error("Failed to copy to clipboard");
    }
  };

  const getPlatformName = (platformId: string) => {
    const platform = platforms.find(p => p.id === platformId);
    return platform?.platform_name || 'Unknown Platform';
  };

  const formatWebhookType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Outbound Webhook Configurations</h2>
        <p className="text-muted-foreground">
          Webhooks sent from Ordering Platform to external systems
        </p>
      </div>

      <div className="grid gap-4">
        {webhookLinks.map((link) => (
          <Card key={link.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold">{formatWebhookType(link.webhook_type)}</h3>
                  <Badge variant={link.is_active ? "default" : "secondary"}>
                    {link.is_active ? (
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
                  <Badge variant="outline">
                    {link.hmac_enabled ? (
                      <>
                        <Shield className="w-3 h-3 mr-1" />
                        HMAC Enabled
                      </>
                    ) : (
                      <>
                        <ShieldOff className="w-3 h-3 mr-1" />
                        No HMAC
                      </>
                    )}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Target: {getPlatformName(link.platform_id)}
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configure
              </Button>
            </div>

            <div className="space-y-4">
              {/* Destination URL */}
              <div>
                <label className="text-sm font-medium text-muted-foreground block mb-1">
                  Destination URL
                </label>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono break-all">
                    {link.webhook_url}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(link.webhook_url, "Webhook URL")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(link.webhook_url, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Configuration Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Rate Limit
                  </label>
                  <p className="text-sm font-medium">
                    {link.rate_limit_per_minute || 'Unlimited'} /min
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Timeout
                  </label>
                  <p className="text-sm font-medium">
                    {link.timeout_seconds || 30}s
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Retries
                  </label>
                  <p className="text-sm font-medium">
                    {link.retry_enabled ? `${link.max_retries || 3} attempts` : 'Disabled'}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">
                    Security
                  </label>
                  <p className="text-sm font-medium">
                    {link.hmac_enabled ? 'HMAC SHA-256' : 'None'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {webhookLinks.length === 0 && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No outbound webhooks configured yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

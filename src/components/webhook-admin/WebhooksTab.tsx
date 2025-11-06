import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AppPlatform, AppPlatformLink } from "@/types/webhook-admin";

interface Platform extends AppPlatform {
  app_platform_links: AppPlatformLink[];
}

export function WebhooksTab() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingLink, setEditingLink] = useState<AppPlatformLink | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPlatforms();
  }, []);

  async function loadPlatforms() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("app_platforms" as any)
        .select("*, app_platform_links(*)")
        .order("platform_name");

      if (error) throw error;
      setPlatforms((data || []) as unknown as Platform[]);
    } catch (error: any) {
      toast({
        title: "Error loading platforms",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveLink() {
    if (!editingLink) return;

    try {
      const { error } = await supabase
        .from("app_platform_links" as any)
        .update({
          webhook_url: editingLink.webhook_url,
          webhook_secret: editingLink.webhook_secret,
          hmac_enabled: editingLink.hmac_enabled,
          rate_limit_per_minute: editingLink.rate_limit_per_minute,
          timeout_seconds: editingLink.timeout_seconds,
          is_active: editingLink.is_active,
        })
        .eq("id", editingLink.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Webhook configuration updated successfully",
      });
      setShowEditDialog(false);
      loadPlatforms();
    } catch (error: any) {
      toast({
        title: "Error updating webhook",
        description: error.message,
        variant: "destructive",
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {platforms.map((platform) => (
        <Card key={platform.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{platform.platform_name}</CardTitle>
                <CardDescription>{platform.description}</CardDescription>
              </div>
              <Switch checked={platform.is_active} disabled />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platform.app_platform_links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{link.webhook_type}</span>
                      <Switch checked={link.is_active} disabled />
                    </div>
                    <div className="text-sm text-muted-foreground break-all">
                      {link.webhook_url}
                    </div>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span>HMAC: {link.hmac_enabled ? "✓" : "✗"}</span>
                      <span>Rate Limit: {link.rate_limit_per_minute}/min</span>
                      <span>Timeout: {link.timeout_seconds}s</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingLink(link);
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Webhook Configuration</DialogTitle>
            <DialogDescription>
              Update the webhook endpoint and security settings
            </DialogDescription>
          </DialogHeader>

          {editingLink && (
            <div className="space-y-4">
              <div>
                <Label>Webhook Type</Label>
                <Input value={editingLink.webhook_type} disabled />
              </div>

              <div>
                <Label>Webhook URL</Label>
                <Input
                  value={editingLink.webhook_url}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, webhook_url: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Webhook Secret (for HMAC)</Label>
                <Input
                  type="password"
                  value={editingLink.webhook_secret || ""}
                  onChange={(e) =>
                    setEditingLink({ ...editingLink, webhook_secret: e.target.value })
                  }
                  placeholder="Leave empty to disable HMAC"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Enable HMAC Signatures</Label>
                <Switch
                  checked={editingLink.hmac_enabled}
                  onCheckedChange={(checked) =>
                    setEditingLink({ ...editingLink, hmac_enabled: checked })
                  }
                />
              </div>

              <div>
                <Label>Rate Limit (per minute)</Label>
                <Input
                  type="number"
                  value={editingLink.rate_limit_per_minute}
                  onChange={(e) =>
                    setEditingLink({
                      ...editingLink,
                      rate_limit_per_minute: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div>
                <Label>Timeout (seconds)</Label>
                <Input
                  type="number"
                  value={editingLink.timeout_seconds}
                  onChange={(e) =>
                    setEditingLink({
                      ...editingLink,
                      timeout_seconds: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={editingLink.is_active}
                  onCheckedChange={(checked) =>
                    setEditingLink({ ...editingLink, is_active: checked })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLink}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

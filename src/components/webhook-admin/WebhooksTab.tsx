import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { InboundPlatformsSection } from "./InboundPlatformsSection";
import { OutboundWebhooksSection } from "./OutboundWebhooksSection";
import { PlatformInitializer } from "./PlatformInitializer";

interface Platform {
  id: string;
  platform_name: string;
  platform_key: string;
  webhook_secret: string | null;
  is_active: boolean;
  description: string | null;
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
}

export function WebhooksTab() {
  const [loading, setLoading] = useState(true);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [webhookLinks, setWebhookLinks] = useState<WebhookLink[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadUserRole(),
        loadPlatforms(),
        loadWebhookLinks()
      ]);
    } finally {
      setLoading(false);
    }
  };

  const loadUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: roleData } = await supabase
        .from('user_roles' as any)
        .select('role')
        .eq('user_id', user.id)
        .single();

      setUserRole((roleData as any)?.role || null);
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  };

  const loadPlatforms = async () => {
    try {
      const { data, error } = await supabase
        .from('app_platforms' as any)
        .select('id, platform_name, platform_key, webhook_secret, is_active, description')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setPlatforms((data || []) as unknown as Platform[]);
    } catch (error) {
      console.error('Error loading platforms:', error);
    }
  };

  const loadWebhookLinks = async () => {
    try {
      const { data, error } = await supabase
        .from('app_platform_links' as any)
        .select(`
          id,
          webhook_type,
          webhook_url,
          platform_id,
          is_active,
          hmac_enabled,
          rate_limit_per_minute,
          timeout_seconds,
          retry_enabled,
          max_retries
        `)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setWebhookLinks((data || []) as unknown as WebhookLink[]);
    } catch (error) {
      console.error('Error loading webhook links:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PlatformInitializer onInitialized={loadData} />
      
      <InboundPlatformsSection 
        platforms={platforms}
        onPlatformUpdated={loadPlatforms}
        userRole={userRole}
      />
      
      <OutboundWebhooksSection 
        webhookLinks={webhookLinks}
        platforms={platforms}
      />
    </div>
  );
}

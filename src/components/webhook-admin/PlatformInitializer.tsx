import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function PlatformInitializer({ onInitialized }: { onInitialized: () => void }) {
  const [isInitializing, setIsInitializing] = useState(false);
  const [needsInit, setNeedsInit] = useState(false);

  useEffect(() => {
    checkIfNeedsInit();
  }, []);

  const checkIfNeedsInit = async () => {
    try {
      const { data: platforms } = await supabase
        .from('app_platforms' as any)
        .select('platform_key')
        .in('platform_key', ['ot-platform', 'inventory-platform']);

      const hasOT = platforms?.some((p: any) => p.platform_key === 'ot-platform');
      const hasInventory = platforms?.some((p: any) => p.platform_key === 'inventory-platform');

      setNeedsInit(!hasOT || !hasInventory);
    } catch (error) {
      console.error('Error checking platforms:', error);
    }
  };

  const initializePlatforms = async () => {
    setIsInitializing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // Check which platforms are missing
      const { data: existingPlatforms } = await supabase
        .from('app_platforms' as any)
        .select('platform_key')
        .in('platform_key', ['ot-platform', 'inventory-platform']);

      const hasOT = existingPlatforms?.some((p: any) => p.platform_key === 'ot-platform');
      const hasInventory = existingPlatforms?.some((p: any) => p.platform_key === 'inventory-platform');

      const platformsToCreate = [];

      if (!hasOT) {
        platformsToCreate.push({
          platform_name: 'OT Platform',
          platform_key: 'ot-platform',
          webhook_secret: crypto.randomUUID(),
          description: 'Receives events from OT Platform (inventory updates, order fulfillment, stock changes)',
          is_active: true,
          rate_limit_per_minute: 100,
          created_by: user?.id
        });
      }

      if (!hasInventory) {
        platformsToCreate.push({
          platform_name: 'Inventory Platform',
          platform_key: 'inventory-platform',
          webhook_secret: crypto.randomUUID(),
          description: 'Receives real-time inventory changes, stock updates, and count adjustments',
          is_active: true,
          rate_limit_per_minute: 100,
          created_by: user?.id
        });
      }

      if (platformsToCreate.length > 0) {
        const { error: insertError } = await supabase
          .from('app_platforms' as any)
          .insert(platformsToCreate);

        if (insertError) throw insertError;
      }

      // Update Zapier if it has no secret
      const { data: zapier } = await supabase
        .from('app_platforms' as any)
        .select('id, webhook_secret')
        .eq('platform_key', 'zapier')
        .single();

      if (zapier && !(zapier as any).webhook_secret) {
        const { error: updateError } = await supabase
          .from('app_platforms' as any)
          .update({ webhook_secret: crypto.randomUUID() })
          .eq('id', (zapier as any).id);

        if (updateError) throw updateError;
      }

      toast.success("Webhook platforms initialized successfully");
      setNeedsInit(false);
      onInitialized();
    } catch (error) {
      console.error('Error initializing platforms:', error);
      toast.error("Failed to initialize webhook platforms");
    } finally {
      setIsInitializing(false);
    }
  };

  if (!needsInit) return null;

  return (
    <Card className="p-6 mb-6 border-warning">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold mb-1">Webhook Platforms Not Configured</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Required webhook platforms (OT Platform, Inventory Platform) need to be initialized before you can receive events.
          </p>
          <Button 
            onClick={initializePlatforms} 
            disabled={isInitializing}
            size="sm"
          >
            {isInitializing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Initialize Webhook Platforms
          </Button>
        </div>
      </div>
    </Card>
  );
}

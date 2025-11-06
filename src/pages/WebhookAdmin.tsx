import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebhooksTab } from "@/components/webhook-admin/WebhooksTab";
import { DeliveriesTab } from "@/components/webhook-admin/DeliveriesTab";
import { AnalyticsTab } from "@/components/webhook-admin/AnalyticsTab";
import { ToolsTab } from "@/components/webhook-admin/ToolsTab";
import { ConditionalSidebar } from "@/components/ConditionalSidebar";

export default function WebhookAdmin() {
  const [activeTab, setActiveTab] = useState("webhooks");

  return (
    <ConditionalSidebar>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Webhook Administration</h1>
          <p className="text-muted-foreground">
            Manage webhook endpoints, view delivery logs, and monitor analytics
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="webhooks" className="mt-6">
            <WebhooksTab />
          </TabsContent>

          <TabsContent value="deliveries" className="mt-6">
            <DeliveriesTab />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="tools" className="mt-6">
            <ToolsTab />
          </TabsContent>
        </Tabs>
      </div>
    </ConditionalSidebar>
  );
}

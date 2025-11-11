import { WebhookTestPanel } from "./WebhookTestPanel";
import { WebhookIntegrationTests } from "./WebhookIntegrationTests";

export function ToolsTab() {
  return (
    <div className="space-y-6">
      <WebhookTestPanel />
      <WebhookIntegrationTests />
    </div>
  );
}

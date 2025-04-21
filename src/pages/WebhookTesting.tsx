
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WebhookTester } from "@/components/webhook-test/WebhookTester";

const WebhookTesting = () => {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Webhook Testing Panel</CardTitle>
        </CardHeader>
        <CardContent>
          <WebhookTester />
        </CardContent>
      </Card>
    </div>
  );
};

export default WebhookTesting;

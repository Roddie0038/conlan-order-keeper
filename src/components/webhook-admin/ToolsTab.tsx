import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function ToolsTab() {
  const [testUrl, setTestUrl] = useState("");
  const [testSecret, setTestSecret] = useState("");
  const [hmacEnabled, setHmacEnabled] = useState(false);
  const [testPayload, setTestPayload] = useState(
    JSON.stringify(
      {
        test: true,
        timestamp: new Date().toISOString(),
        data: {
          message: "Test webhook delivery",
        },
      },
      null,
      2
    )
  );
  const [testResult, setTestResult] = useState<any>(null);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  async function handleTestSend() {
    if (!testUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive",
      });
      return;
    }

    let parsedPayload;
    try {
      parsedPayload = JSON.parse(testPayload);
    } catch (error) {
      toast({
        title: "Invalid JSON",
        description: "Please check your test payload format",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("webhook-config", {
        body: {
          action: "test-webhook",
          webhook_url: testUrl,
          webhook_secret: testSecret,
          hmac_enabled: hmacEnabled,
          test_payload: parsedPayload,
        },
      });

      if (error) throw error;

      setTestResult(data);
      toast({
        title: data.success ? "Test successful" : "Test failed",
        description: `Response: ${data.status} in ${data.duration_ms}ms`,
        variant: data.success ? "default" : "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Error sending test",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Webhook Sender</CardTitle>
          <CardDescription>
            Send a test webhook to verify your endpoint configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Webhook URL</Label>
            <Input
              placeholder="https://example.com/webhook"
              value={testUrl}
              onChange={(e) => setTestUrl(e.target.value)}
            />
          </div>

          <div>
            <Label>Webhook Secret (for HMAC)</Label>
            <Input
              type="password"
              placeholder="Optional - for HMAC signature testing"
              value={testSecret}
              onChange={(e) => setTestSecret(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Enable HMAC Signature</Label>
            <Switch checked={hmacEnabled} onCheckedChange={setHmacEnabled} />
          </div>

          <div>
            <Label>Test Payload (JSON)</Label>
            <Textarea
              className="font-mono text-sm"
              rows={10}
              value={testPayload}
              onChange={(e) => setTestPayload(e.target.value)}
            />
          </div>

          <Button onClick={handleTestSend} disabled={testing} className="w-full">
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test Webhook
              </>
            )}
          </Button>

          {testResult && (
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold">Test Result</h3>
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  <span className={testResult.success ? "text-green-600" : "text-red-600"}>
                    {testResult.success ? "Success" : "Failed"}
                  </span>
                </div>
                <div>
                  <span className="font-medium">HTTP Status:</span> {testResult.status}
                </div>
                <div>
                  <span className="font-medium">Duration:</span> {testResult.duration_ms}ms
                </div>
                {testResult.response_body && (
                  <div>
                    <span className="font-medium">Response:</span>
                    <pre className="mt-2 p-2 bg-background rounded text-xs overflow-x-auto">
                      {testResult.response_body}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { testWebhook } from "@/services/webhook/utils";
import { WEBHOOK_URLS } from "@/services/webhook/config";

export const WebhookTester = () => {
  const { toast } = useToast();
  const [customUrl, setCustomUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  
  const runTest = async (url: string, label: string) => {
    setIsLoading(true);
    setTestResults(null);
    
    try {
      const result = await testWebhook(url);
      console.log(`Webhook test result for ${label}:`, result);
      setTestResults({ url, label, ...result });
      
      toast({
        title: result.success ? "Webhook Test Successful" : "Webhook Test Failed",
        description: `The ${label} webhook test ${result.success ? "was successful" : "failed"}`,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error(`Error testing ${label} webhook:`, error);
      setTestResults({ 
        url, 
        label, 
        success: false, 
        error: String(error) 
      });
      
      toast({
        title: "Webhook Test Error",
        description: `Error testing the ${label} webhook: ${error}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Webhook Tester</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Predefined Webhooks</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              onClick={() => runTest(WEBHOOK_URLS.ORDERS, "Orders")}
              disabled={isLoading}
            >
              Test Orders Webhook
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => runTest(WEBHOOK_URLS.WHEEL_ORDERS, "Wheel Orders")}
              disabled={isLoading}
            >
              Test Wheel Orders Webhook
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => runTest(WEBHOOK_URLS.MTO_ORDERS, "MTO Orders")}
              disabled={isLoading}
            >
              Test MTO Orders Webhook
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-lg font-medium">Custom Webhook URL</h3>
          
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Enter webhook URL to test"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              disabled={isLoading}
              className="flex-1"
            />
            
            <Button 
              onClick={() => runTest(customUrl, "Custom")}
              disabled={isLoading || !customUrl}
            >
              Test
            </Button>
          </div>
        </div>
        
        {isLoading && (
          <div className="p-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-sm text-muted-foreground">Testing webhook connectivity...</p>
          </div>
        )}
        
        {testResults && (
          <div className="mt-4 border rounded-md p-4 bg-muted/20">
            <div className="flex items-center mb-2">
              {testResults.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              )}
              <h3 className="font-medium">{testResults.label} Webhook Test Result</h3>
            </div>
            
            <div className="space-y-2 mt-2 text-sm">
              <div><span className="font-medium">URL:</span> {testResults.url}</div>
              <div><span className="font-medium">Status:</span> {testResults.status || "Unknown"}</div>
              {testResults.response && (
                <div>
                  <span className="font-medium">Response:</span> {testResults.response}
                </div>
              )}
              {testResults.error && (
                <div className="text-red-500">
                  <span className="font-medium">Error:</span> {testResults.error}
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-4 text-xs text-muted-foreground">
        <div>
          This tool tests webhook connectivity by sending a simple test payload.
        </div>
      </CardFooter>
    </Card>
  );
};

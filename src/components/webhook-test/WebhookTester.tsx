
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, CheckCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { submitToWebhook } from "@/services/webhook/utils";
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
      const testData = {
        test: true,
        timestamp: new Date().toISOString(),
        message: `Test request from Lovable webhook system for ${label}`
      };
      
      const result = await submitToWebhook(url, testData);
      
      setTestResults({ 
        url, 
        label, 
        success: result 
      });
      
      toast({
        title: result ? "Webhook Test Successful" : "Webhook Test Failed",
        description: `The ${label} webhook test ${result ? "was successful" : "failed"}`,
        variant: result ? "default" : "destructive",
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

        {testResults && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-900">
            <h3 className="text-lg font-medium flex items-center">
              {testResults.success ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
                  <span>Test Successful</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                  <span>Test Failed</span>
                </>
              )}
            </h3>
            <div className="mt-2 text-sm">
              <div><strong>Webhook:</strong> {testResults.label}</div>
              <div><strong>URL:</strong> {testResults.url}</div>
              {testResults.error && (
                <div className="text-red-500 mt-2">
                  <strong>Error:</strong> {testResults.error}
                </div>
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2">Testing webhook...</span>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="border-t p-4 text-xs text-muted-foreground">
        This tool tests webhook connectivity by sending a simple test payload.
      </CardFooter>
    </Card>
  );
};

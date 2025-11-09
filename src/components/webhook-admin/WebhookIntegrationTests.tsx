import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, PlayCircle, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  publishOrderPlaced, 
  publishMTOOrderPlaced, 
  publishWheelOrderPlaced 
} from "@/services/webhookOutbox";

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'failed';
  message: string;
  data?: any;
  timestamp: string;
}

interface TestRun {
  id: string;
  testType: string;
  status: 'running' | 'completed' | 'failed';
  results: TestResult[];
  startTime: string;
  endTime?: string;
}

export function WebhookIntegrationTests() {
  const [running, setRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<TestRun | null>(null);
  const { toast } = useToast();

  const createTestResult = (step: string, status: TestResult['status'], message: string, data?: any): TestResult => ({
    step,
    status,
    message,
    data,
    timestamp: new Date().toISOString()
  });

  const runOrderPlacedTest = async () => {
    setRunning(true);
    const testRun: TestRun = {
      id: `test-${Date.now()}`,
      testType: 'OrderPlaced',
      status: 'running',
      results: [],
      startTime: new Date().toISOString()
    };
    setCurrentTest(testRun);

    try {
      // Step 1: Create test order data
      testRun.results.push(createTestResult(
        'Prepare Test Data',
        'success',
        'Generated test order payload',
        { order_number: `TEST-ORDER-${Date.now()}` }
      ));
      setCurrentTest({ ...testRun });

      const testOrderData = {
        order_id: `test-${Date.now()}`,
        order_number: `TEST-ORDER-${Date.now()}`,
        store: "Test Store 001",
        plant: "Test Plant",
        product_number: "TEST-PRODUCT-001",
        description: "Integration Test Order",
        quantity: 5,
        schedule_arrival: new Date().toISOString(),
        status: "open",
        submitted_by_name: "Test User",
        submitted_by_email: "test@example.com",
        order_type: "TRANSFER",
        metadata: {
          test: true,
          test_run_id: testRun.id
        }
      };

      // Step 2: Enqueue to outbox
      testRun.results.push(createTestResult(
        'Enqueue to Outbox',
        'pending',
        'Calling publishOrderPlaced...'
      ));
      setCurrentTest({ ...testRun });

      const traceId = `test-${testRun.id}`;
      const enqueueResult = await publishOrderPlaced(testOrderData, traceId);

      if (!enqueueResult.success) {
        throw new Error(`Enqueue failed: ${enqueueResult.error}`);
      }

      testRun.results[testRun.results.length - 1] = createTestResult(
        'Enqueue to Outbox',
        'success',
        'Event enqueued successfully',
        { event_id: enqueueResult.event_id, trace_id: traceId }
      );
      setCurrentTest({ ...testRun });

      // Step 3: Verify outbox entry
      await new Promise(resolve => setTimeout(resolve, 500));
      testRun.results.push(createTestResult(
        'Verify Outbox Entry',
        'pending',
        'Checking webhook_outbox table...'
      ));
      setCurrentTest({ ...testRun });

      const { data: outboxEntry, error: outboxError } = await supabase
        .from('webhook_outbox' as any)
        .select('*')
        .eq('event_id', enqueueResult.event_id!)
        .single();

      if (outboxError) {
        throw new Error(`Outbox verification failed: ${outboxError.message}`);
      }

      testRun.results[testRun.results.length - 1] = createTestResult(
        'Verify Outbox Entry',
        'success',
        'Outbox entry verified',
        { 
          status: (outboxEntry as any).status,
          retry_count: (outboxEntry as any).retry_count,
          created_at: (outboxEntry as any).created_at
        }
      );
      setCurrentTest({ ...testRun });

      // Step 4: Trigger webhook publisher
      testRun.results.push(createTestResult(
        'Trigger Webhook Publisher',
        'pending',
        'Invoking webhook-outbound-publisher function...'
      ));
      setCurrentTest({ ...testRun });

      const { data: publishResult, error: publishError } = await supabase.functions.invoke(
        'webhook-outbound-publisher',
        { body: {} }
      );

      if (publishError) {
        testRun.results[testRun.results.length - 1] = createTestResult(
          'Trigger Webhook Publisher',
          'failed',
          `Publisher invocation failed: ${publishError.message}`,
          publishError
        );
      } else {
        testRun.results[testRun.results.length - 1] = createTestResult(
          'Trigger Webhook Publisher',
          'success',
          'Publisher function invoked',
          publishResult
        );
      }
      setCurrentTest({ ...testRun });

      // Step 5: Wait and check delivery status
      await new Promise(resolve => setTimeout(resolve, 2000));
      testRun.results.push(createTestResult(
        'Check Delivery Status',
        'pending',
        'Checking updated outbox status...'
      ));
      setCurrentTest({ ...testRun });

      const { data: updatedOutboxEntry, error: checkError } = await supabase
        .from('webhook_outbox' as any)
        .select('*')
        .eq('event_id', enqueueResult.event_id!)
        .single();

      if (checkError) {
        throw new Error(`Status check failed: ${checkError.message}`);
      }

      testRun.results[testRun.results.length - 1] = createTestResult(
        'Check Delivery Status',
        (updatedOutboxEntry as any).status === 'delivered' ? 'success' : 'failed',
        `Outbox status: ${(updatedOutboxEntry as any).status}`,
        {
          status: (updatedOutboxEntry as any).status,
          retry_count: (updatedOutboxEntry as any).retry_count,
          error_message: (updatedOutboxEntry as any).error_message,
          delivered_at: (updatedOutboxEntry as any).delivered_at
        }
      );
      setCurrentTest({ ...testRun });

      // Step 6: Check delivery logs (if app_webhook_deliveries exists)
      testRun.results.push(createTestResult(
        'Check Delivery Logs',
        'pending',
        'Querying delivery logs...'
      ));
      setCurrentTest({ ...testRun });

      const { data: deliveryLogs, error: logsError } = await supabase
        .from('app_webhook_deliveries' as any)
        .select('*')
        .eq('idempotency_key', enqueueResult.event_id!)
        .order('created_at', { ascending: false });

      if (logsError) {
        testRun.results[testRun.results.length - 1] = createTestResult(
          'Check Delivery Logs',
          'failed',
          `Logs query failed: ${logsError.message}`
        );
      } else {
        testRun.results[testRun.results.length - 1] = createTestResult(
          'Check Delivery Logs',
          deliveryLogs && deliveryLogs.length > 0 ? 'success' : 'failed',
          deliveryLogs ? `Found ${deliveryLogs.length} delivery log(s)` : 'No delivery logs found',
          deliveryLogs
        );
      }
      setCurrentTest({ ...testRun });

      // Final status
      const allSuccess = testRun.results.every(r => r.status === 'success');
      testRun.status = allSuccess ? 'completed' : 'failed';
      testRun.endTime = new Date().toISOString();
      setCurrentTest({ ...testRun });

      toast({
        title: allSuccess ? "Test Completed Successfully" : "Test Completed with Failures",
        description: `${testRun.results.filter(r => r.status === 'success').length}/${testRun.results.length} steps passed`,
        variant: allSuccess ? "default" : "destructive"
      });

    } catch (error) {
      testRun.results.push(createTestResult(
        'Test Execution',
        'failed',
        error instanceof Error ? error.message : String(error)
      ));
      testRun.status = 'failed';
      testRun.endTime = new Date().toISOString();
      setCurrentTest({ ...testRun });

      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setRunning(false);
    }
  };

  const runMTOTest = async () => {
    setRunning(true);
    toast({
      title: "MTO Test",
      description: "Running MTO order webhook test..."
    });

    try {
      const testData = {
        order_id: `mto-test-${Date.now()}`,
        order_number: `TEST-MTO-${Date.now()}`,
        store: "Test Store 001",
        plant: "Test Plant",
        product_number: "MTO-TEST",
        description: "MTO Integration Test",
        quantity: 1,
        status: "open",
        submitted_by_name: "Test User",
        submitted_by_email: "test@example.com",
        order_type: "MTO",
        metadata: {
          test: true,
          tread: "Test Tread",
          tire_size: "11R24.5"
        }
      };

      const result = await publishMTOOrderPlaced(testData, `mto-test-${Date.now()}`);
      
      if (result.success) {
        toast({
          title: "MTO Test Successful",
          description: `Event ${result.event_id} enqueued successfully`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "MTO Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setRunning(false);
    }
  };

  const runWheelTest = async () => {
    setRunning(true);
    toast({
      title: "Wheel Test",
      description: "Running wheel order webhook test..."
    });

    try {
      const testData = {
        order_id: `wheel-test-${Date.now()}`,
        order_number: `TEST-WHEEL-${Date.now()}`,
        store: "Test Store 001",
        plant: "Test Plant",
        product_number: "WHEEL-COATING",
        description: "Wheel Coating Test",
        quantity: 4,
        status: "open",
        submitted_by_name: "Test User",
        submitted_by_email: "test@example.com",
        order_type: "WHEEL_POWDER_COATING",
        metadata: {
          test: true,
          wheel_color: "Black",
          wheel_size: "22.5"
        }
      };

      const result = await publishWheelOrderPlaced(testData, `wheel-test-${Date.now()}`);
      
      if (result.success) {
        toast({
          title: "Wheel Test Successful",
          description: `Event ${result.event_id} enqueued successfully`
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Wheel Test Failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setRunning(false);
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Tests</CardTitle>
        <CardDescription>
          Test the complete webhook flow from order submission to delivery logging
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            These tests create real entries in the webhook_outbox table and attempt actual webhook deliveries.
            Use with caution in production environments.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="order" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="order">Order Test</TabsTrigger>
            <TabsTrigger value="mto">MTO Test</TabsTrigger>
            <TabsTrigger value="wheel">Wheel Test</TabsTrigger>
          </TabsList>

          <TabsContent value="order" className="space-y-4">
            <Button
              onClick={runOrderPlacedTest}
              disabled={running}
              className="w-full"
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Test...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Run Complete Order Flow Test
                </>
              )}
            </Button>

            {currentTest && currentTest.testType === 'OrderPlaced' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Test Results</h3>
                  <Badge variant={
                    currentTest.status === 'completed' ? 'default' :
                    currentTest.status === 'failed' ? 'destructive' : 'secondary'
                  }>
                    {currentTest.status}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {currentTest.results.map((result, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(result.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{result.step}</span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(result.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                          {result.data && (
                            <details className="mt-2">
                              <summary className="text-xs text-muted-foreground cursor-pointer">
                                View Details
                              </summary>
                              <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
                                {JSON.stringify(result.data, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="mto" className="space-y-4">
            <Button
              onClick={runMTOTest}
              disabled={running}
              className="w-full"
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running MTO Test...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Run MTO Order Test
                </>
              )}
            </Button>
          </TabsContent>

          <TabsContent value="wheel" className="space-y-4">
            <Button
              onClick={runWheelTest}
              disabled={running}
              className="w-full"
            >
              {running ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Running Wheel Test...
                </>
              ) : (
                <>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Run Wheel Order Test
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

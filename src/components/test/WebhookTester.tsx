
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { submitToGoogleSheets } from "@/services/sheets";
import { getManagerEmail } from "@/components/order-form/formConfig";

export const WebhookTester = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [webhookType, setWebhookType] = useState<'regular' | 'mto' | 'wheel'>('regular');

  const generateSampleRegularOrderData = () => {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      store: "Fort Worth 22",
      yourName: "Test User",
      dateReceived: new Date().toISOString(),
      productNumber: "TEST-PRODUCT-123",
      description: "Test Product Description",
      quantity: "5",
      scheduleArrival: "Monday",
      notes: "This is a test order for webhook verification",
      crossDock: "no",
      crossDockDestination: "",
      managersEmail: getManagerEmail("Fort Worth 22"),
      triggered_from: window.location.origin,
      orderId: crypto.randomUUID()
    };
  };

  const generateSampleMTOOrderData = () => {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      store: "Fort Worth 22",
      name: "Test MTO User",
      productNumber: "TEST-MTO-123",
      casingGrade: ["A", "B"],
      tireSize: "315/80R22.5",
      tireTreadNeeded: "Test Tread",
      quantity: "3",
      scheduleArrival: "Wednesday",
      notes: "This is a test MTO order for webhook verification",
      type: "MTO" as const,
      managersEmail: getManagerEmail("Fort Worth 22"),
      triggered_from: window.location.origin
    };
  };

  const generateSampleWheelOrderData = () => {
    return {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      store: "Fort Worth 22",
      storeName: "Fort Worth 22",
      storeId: "22",
      yourName: "Test Wheel User",
      name: "Test Wheel User",
      dateReceived: new Date().toISOString(),
      productNumber: "WHEEL-COATING",
      description: "Wheel coating - Silver - 22.5",
      quantity: "4",
      qtyWheels: "4",
      scheduleArrival: "Friday",
      notes: "Customer: Test Customer, Material: Aluminum, Type: Standard, Hand Holes: 8",
      crossDock: "no",
      customerName: "Test Customer",
      wheelMaterial: "Aluminum",
      wheelType: "Standard",
      handHoles: "8",
      wheelSize: "22.5",
      wheelColor: "Silver",
      type: "WHEEL_POWDER_COATING" as const,
      managersEmail: getManagerEmail("Fort Worth 22"),
      triggered_from: window.location.origin
    };
  };

  const handleSendTestWebhook = async () => {
    setIsSubmitting(true);
    
    try {
      let testData;
      
      switch (webhookType) {
        case 'regular':
          testData = generateSampleRegularOrderData();
          break;
        case 'mto':
          testData = generateSampleMTOOrderData();
          break;
        case 'wheel':
          testData = generateSampleWheelOrderData();
          break;
      }

      console.log(`Sending test ${webhookType} webhook:`, testData);
      
      const result = await submitToGoogleSheets(testData);
      
      if (result.status === 'success' || result.status === 'partial_success') {
        toast({
          title: "Test Webhook Sent",
          description: `Successfully sent test ${webhookType} order webhook.`,
        });
      } else {
        throw new Error("Failed to send test webhook");
      }
    } catch (error) {
      console.error("Error sending test webhook:", error);
      toast({
        title: "Error",
        description: "Failed to send test webhook. See console for details.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto bg-white shadow-lg">
      <CardHeader className="bg-blue-50">
        <CardTitle className="text-xl font-bold text-blue-700">Webhook Testing Tool</CardTitle>
        <CardDescription>Send test webhook data to verify your integration</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Webhook Type
            </label>
            <div className="flex flex-wrap gap-3">
              <Button 
                type="button"
                variant={webhookType === 'regular' ? "default" : "outline"}
                onClick={() => setWebhookType('regular')}
                className="flex-1"
              >
                Regular Order
              </Button>
              <Button 
                type="button"
                variant={webhookType === 'mto' ? "default" : "outline"}
                onClick={() => setWebhookType('mto')}
                className="flex-1"
              >
                MTO Order
              </Button>
              <Button 
                type="button"
                variant={webhookType === 'wheel' ? "default" : "outline"}
                onClick={() => setWebhookType('wheel')}
                className="flex-1"
              >
                Wheel Order
              </Button>
            </div>
          </div>
          
          <div className="rounded-md bg-blue-50 p-4 mt-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">
              Sample Data Preview ({webhookType} order):
            </h4>
            <div className="text-xs text-blue-700 overflow-auto max-h-40 bg-white p-2 rounded border border-blue-100">
              <pre>
                {webhookType === 'regular' 
                  ? JSON.stringify(generateSampleRegularOrderData(), null, 2)
                  : webhookType === 'mto'
                    ? JSON.stringify(generateSampleMTOOrderData(), null, 2)
                    : JSON.stringify(generateSampleWheelOrderData(), null, 2)
                }
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 flex justify-end">
        <Button
          onClick={handleSendTestWebhook}
          disabled={isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? "Sending..." : "Send Test Webhook"}
        </Button>
      </CardFooter>
    </Card>
  );
};

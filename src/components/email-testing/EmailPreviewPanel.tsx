
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Eye, Code } from "lucide-react";

interface EmailPreviewPanelProps {
  templateType: string;
}

const EMAIL_TEMPLATES = {
  "transfer-request": "Transfer Request Confirmation",
  "mto-order": "MTO Order Confirmation", 
  "wheel-order": "Wheel Order Confirmation",
  "warranty-claim": "Warranty Tire Claim Receipt",
  "customer-complaint": "Customer Complaint Acknowledgment",
  "pull-sheet": "Pull Sheet Ready Notification",
  "order-completion": "Order Completion Notification",
  "out-of-stock": "Out-of-Stock Item Notification",
  "direct-message": "Direct Message from Order Management",
  "message-receipt": "Order Message Receipt Confirmation"
};

export function EmailPreviewPanel({ templateType }: EmailPreviewPanelProps) {
  const [viewMode, setViewMode] = useState<"html" | "text">("html");

  const getEmailHTML = (type: string) => {
    const baseTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <header style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #1f2937; margin: 0;">Conlan Tire Warehouse</h1>
            <div style="width: 50px; height: 3px; background-color: #3b82f6; margin: 10px auto;"></div>
          </header>
          
          <main>
            <h2 style="color: #374151; margin-bottom: 20px;">
              ${EMAIL_TEMPLATES[type as keyof typeof EMAIL_TEMPLATES]}
            </h2>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Store:</strong> [store_name]</p>
              <p><strong>Order ID:</strong> [order_id]</p>
              <p><strong>Manager:</strong> [manager_name]</p>
              <p><strong>Status:</strong> [status]</p>
            </div>
            
            ${getTemplateSpecificContent(type)}
          </main>
          
          <footer style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
            <p>[email_signature]</p>
            <p style="font-size: 12px;">This is an automated message from the Conlan Tire Ordering Platform</p>
          </footer>
        </div>
      </div>
    `;
    return baseTemplate;
  };

  const getTemplateSpecificContent = (type: string) => {
    switch (type) {
      case "transfer-request":
        return `
          <p>Your transfer request has been successfully submitted and is being processed.</p>
          <p>You will receive updates as your order progresses through our fulfillment process.</p>
        `;
      case "mto-order":
        return `
          <p>Your MTO (Made to Order) request has been received and forwarded to our production team.</p>
          <p>Expected processing time: 3-5 business days.</p>
        `;
      case "wheel-order":
        return `
          <p>Your wheel refurbishment order has been confirmed.</p>
          <p>Our technicians will begin processing your wheel order shortly.</p>
        `;
      case "warranty-claim":
        return `
          <p>We have received your warranty claim and it is under review.</p>
          <p>Our warranty team will process your claim within 2-3 business days.</p>
        `;
      case "customer-complaint":
        return `
          <p>Thank you for bringing this matter to our attention.</p>
          <p>Your complaint has been logged and assigned to our customer service team for resolution.</p>
          <p><strong>Complaint Summary:</strong> [complaint_summary]</p>
        `;
      default:
        return `<p>Your [order_type] has been processed successfully.</p>`;
    }
  };

  const getEmailText = (type: string) => {
    return `
CONLAN TIRE WAREHOUSE
${EMAIL_TEMPLATES[type as keyof typeof EMAIL_TEMPLATES]}

Store: [store_name]
Order ID: [order_id]
Manager: [manager_name]
Status: [status]

${getTemplateSpecificContent(type).replace(/<[^>]*>/g, '')}

[email_signature]

This is an automated message from the Conlan Tire Ordering Platform
    `.trim();
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Email Preview
          </CardTitle>
          <Badge variant="outline">
            {EMAIL_TEMPLATES[templateType as keyof typeof EMAIL_TEMPLATES]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "html" | "text")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="html">HTML Preview</TabsTrigger>
            <TabsTrigger value="text">Text Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="html" className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <div dangerouslySetInnerHTML={{ __html: getEmailHTML(templateType) }} />
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {getEmailText(templateType)}
              </pre>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-700">
            <Code className="inline h-4 w-4 mr-1" />
            Dynamic fields like [store_name], [order_id], etc. will be replaced with actual values when sent
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

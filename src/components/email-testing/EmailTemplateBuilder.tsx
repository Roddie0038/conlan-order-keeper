
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Send, Mail } from "lucide-react";

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

interface EmailTemplateBuilderProps {
  selectedTemplate: string;
  onTemplateChange: (template: string) => void;
  onEmailSent: (logEntry: any) => void;
}

export function EmailTemplateBuilder({ selectedTemplate, onTemplateChange, onEmailSent }: EmailTemplateBuilderProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sending, setSending] = useState(false);
  const [templateData, setTemplateData] = useState({
    store_name: "Fort Worth 22",
    order_id: "ORD-2024-001",
    manager_name: "John Smith",
    order_type: "Transfer Request",
    status: "Confirmed",
    complaint_summary: "Sample complaint summary",
    email_signature: "Best regards, Conlan Tire Warehouse Team"
  });

  const handleSendTestEmail = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "No admin email found",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    try {
      console.log("🧪 EMAIL TEST - Sending to admin:", user.email);
      console.log("📧 EMAIL TEST - Template:", selectedTemplate);
      console.log("📊 EMAIL TEST - Data:", templateData);

      const { data, error } = await supabase.functions.invoke('email-testing', {
        body: {
          templateType: selectedTemplate,
          templateData,
          recipientEmail: user.email,
          isTestMode: true
        }
      });

      if (error) throw error;

      // Log the email send
      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        emailType: EMAIL_TEMPLATES[selectedTemplate as keyof typeof EMAIL_TEMPLATES],
        routeStatus: "Success",
        recipientEmail: user.email,
        renderedSubject: `Confirmation – ${templateData.order_type} for Store ${templateData.store_name}`,
        renderedBody: "Email sent successfully"
      };

      onEmailSent(logEntry);

      toast({
        title: "Test Email Sent!",
        description: `Email sent to ${user.email} successfully`
      });

    } catch (error) {
      console.error("❌ EMAIL TEST - Error:", error);
      
      const logEntry = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        emailType: EMAIL_TEMPLATES[selectedTemplate as keyof typeof EMAIL_TEMPLATES],
        routeStatus: "Failed",
        recipientEmail: user.email,
        renderedSubject: `Confirmation – ${templateData.order_type} for Store ${templateData.store_name}`,
        renderedBody: `Error: ${error}`
      };

      onEmailSent(logEntry);

      toast({
        title: "Email Send Failed",
        description: "Check debug logs for details",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Template Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template-select">Email Template</Label>
            <Select value={selectedTemplate} onValueChange={onTemplateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select template" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(EMAIL_TEMPLATES).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label htmlFor="store_name">Store Name</Label>
              <Input
                id="store_name"
                value={templateData.store_name}
                onChange={(e) => setTemplateData(prev => ({ ...prev, store_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="order_id">Order ID</Label>
              <Input
                id="order_id"
                value={templateData.order_id}
                onChange={(e) => setTemplateData(prev => ({ ...prev, order_id: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="manager_name">Manager Name</Label>
              <Input
                id="manager_name"
                value={templateData.manager_name}
                onChange={(e) => setTemplateData(prev => ({ ...prev, manager_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="order_type">Order Type</Label>
              <Input
                id="order_type"
                value={templateData.order_type}
                onChange={(e) => setTemplateData(prev => ({ ...prev, order_type: e.target.value }))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white/95 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Test Email Delivery</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <strong>Test Recipient:</strong> {user?.email}
            </p>
            <p className="text-xs text-blue-600 mt-1">
              All test emails will be sent to the currently logged-in admin user
            </p>
          </div>

          <Button 
            onClick={handleSendTestEmail} 
            disabled={sending}
            className="w-full"
            size="lg"
          >
            <Send className="mr-2 h-4 w-4" />
            {sending ? "Sending Test Email..." : "Send Test Email"}
          </Button>

          <div className="text-xs text-gray-500 text-center">
            This will send a test email using the selected template and data above
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

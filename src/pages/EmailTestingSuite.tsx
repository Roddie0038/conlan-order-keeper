
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { EmailTemplateBuilder } from "@/components/email-testing/EmailTemplateBuilder";
import { EmailPreviewPanel } from "@/components/email-testing/EmailPreviewPanel";
import { EmailDebugLog } from "@/components/email-testing/EmailDebugLog";
import { SafetyBanner } from "@/components/email-testing/SafetyBanner";
import { Shield, Mail } from "lucide-react";

export default function EmailTestingSuite() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState("transfer-request");
  const [emailLogs, setEmailLogs] = useState<any[]>([]);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate("/dashboard");
      toast({
        title: "Access Denied",
        description: "Only admin users can access the Email Testing Suite.",
        variant: "destructive"
      });
    }
  }, [user, navigate, toast]);

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center mb-4">
              <Shield className="mr-2 h-6 w-6 text-red-500" />
              <h2 className="text-xl font-bold">Access Restricted</h2>
            </div>
            <p className="mb-4">
              This page is only accessible to administrators.
            </p>
            <Button onClick={() => navigate("/dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEmailSent = (logEntry: any) => {
    setEmailLogs(prev => [logEntry, ...prev]);
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-no-repeat relative" 
      style={{
        backgroundImage: 'url("/lovable-uploads/061bc791-3377-4911-8269-c0fed6642b6a.png")'
      }}
    >
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="container py-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <SafetyBanner />
          
          <Card className="mt-6 bg-white/90 shadow-lg rounded-xl backdrop-blur-sm border border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Mail className="h-8 w-8 text-blue-600" />
                📧 Email Testing Suite
              </CardTitle>
              <p className="text-gray-600">
                Internal email template testing and preview system
              </p>
            </CardHeader>
            
            <CardContent className="p-6">
              <Tabs defaultValue="templates" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="templates">Template Builder</TabsTrigger>
                  <TabsTrigger value="preview">Email Preview</TabsTrigger>
                  <TabsTrigger value="logs">Debug Logs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="templates" className="space-y-4">
                  <EmailTemplateBuilder 
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={setSelectedTemplate}
                    onEmailSent={handleEmailSent}
                  />
                </TabsContent>
                
                <TabsContent value="preview" className="space-y-4">
                  <EmailPreviewPanel 
                    templateType={selectedTemplate}
                  />
                </TabsContent>
                
                <TabsContent value="logs" className="space-y-4">
                  <EmailDebugLog logs={emailLogs} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}


import { WebhookTester } from "@/components/test/WebhookTester";
import { useAuth } from "@/contexts/AuthContext";
import { LogoutButton } from "@/components/LogoutButton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function TestWebhooks() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Only admins should access this page
  useEffect(() => {
    if (user && !user.isAdmin) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-6xl mx-auto px-4">
        <LogoutButton />
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Webhook Testing Tool</h1>
          <p className="text-gray-600">
            Use this page to send test webhooks to verify your integration
          </p>
        </div>
        
        <Alert variant="warning" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Important</AlertTitle>
          <AlertDescription>
            This is a testing tool for sending sample data to your webhook integrations.
            No actual orders will be created, but webhook triggers will be sent with sample data.
          </AlertDescription>
        </Alert>
        
        <WebhookTester />
        
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

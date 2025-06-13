
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, MessageSquare } from "lucide-react";

export function MessagingHelpBanner() {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleOpenGuide = () => {
    window.open("/resources/Ordering_Platform_Conlan_Tire_Messaging_Guide.pdf", "_blank");
  };

  if (isDismissed) {
    return null;
  }

  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200 relative">
      <MessageSquare className="h-4 w-4 text-blue-600" />
      <AlertDescription className="text-blue-800 pr-8">
        <strong>New!</strong> You can now send messages about your orders.{" "}
        <button 
          onClick={handleOpenGuide}
          className="text-blue-600 underline hover:text-blue-800 font-medium"
        >
          Learn how to use it here
        </button>
        .
      </AlertDescription>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDismissed(true)}
        className="absolute top-2 right-2 h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100"
      >
        <X className="h-4 w-4" />
      </Button>
    </Alert>
  );
}

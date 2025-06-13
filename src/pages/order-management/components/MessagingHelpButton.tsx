
import { Button } from "@/components/ui/button";
import { ExternalLink, HelpCircle } from "lucide-react";

export function MessagingHelpButton() {
  const handleOpenGuide = () => {
    window.open("/resources/Ordering_Platform_Conlan_Tire_Messaging_Guide.pdf", "_blank");
  };

  return (
    <Button
      variant="outline"
      onClick={handleOpenGuide}
      className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
    >
      <HelpCircle className="h-4 w-4" />
      How to Use the Messaging Feature
      <ExternalLink className="h-4 w-4" />
    </Button>
  );
}

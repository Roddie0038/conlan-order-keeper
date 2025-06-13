
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { MessagingGuideDialog } from "@/components/shared/MessagingGuideDialog";

export function MessagingHelpButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleOpenGuide = () => {
    setIsDialogOpen(true);
  };

  return (
    <>
      <Button
        variant="outline"
        onClick={handleOpenGuide}
        className="flex items-center gap-2 bg-white hover:bg-gray-50 border-gray-300"
      >
        <HelpCircle className="h-4 w-4" />
        How to Use the Messaging Feature
      </Button>
      
      <MessagingGuideDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
      />
    </>
  );
}

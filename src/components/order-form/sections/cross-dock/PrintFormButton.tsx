
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintFormButtonProps {
  onPrintForm?: () => void;
}

export function PrintFormButton({ onPrintForm }: PrintFormButtonProps) {
  return (
    <Button 
      type="button" 
      variant="outline" 
      className="flex items-center"
      onClick={onPrintForm}
    >
      <Printer className="h-4 w-4 mr-2" />
      Print Cross Dock Form
    </Button>
  );
}

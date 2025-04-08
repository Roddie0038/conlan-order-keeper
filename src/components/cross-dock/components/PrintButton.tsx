
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  onPrintClick: () => Promise<void>;
}

export const PrintButton = ({ onPrintClick }: PrintButtonProps) => {
  return (
    <Button 
      onClick={onPrintClick} 
      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-[1.01]"
    >
      <Printer className="w-4 h-4 mr-2" />
      Print PDF
    </Button>
  );
};

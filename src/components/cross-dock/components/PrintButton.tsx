
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";

interface PrintButtonProps {
  onPrintClick: () => Promise<void>;
}

export const PrintButton = ({ onPrintClick }: PrintButtonProps) => {
  const [isPrinting, setIsPrinting] = useState(false);

  const handlePrintClick = async () => {
    setIsPrinting(true);
    
    try {
      await onPrintClick();
    } catch (error) {
      console.error("Print error:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Button 
      onClick={handlePrintClick} 
      disabled={isPrinting}
      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 transform hover:scale-[1.01]"
    >
      <Printer className="w-4 h-4 mr-2" />
      {isPrinting ? "Generating PDF..." : "Print PDF"}
    </Button>
  );
};

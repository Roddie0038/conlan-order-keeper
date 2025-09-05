import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, RotateCcw, Printer, Loader2 } from "lucide-react";
import { CrossDockFormData, openPrintDialog } from "@/services/crossDockPdfService";
import { useToast } from "@/hooks/use-toast";

interface CrossDockFormStatusProps {
  formData: CrossDockFormData | null;
  isOutdated: boolean;
  onRegenerate: () => void;
}

export function CrossDockFormStatus({ 
  formData, 
  isOutdated, 
  onRegenerate 
}: CrossDockFormStatusProps) {
  const { toast } = useToast();
  const [isPrinting, setIsPrinting] = useState(false);
  
  if (!formData) {
    return null;
  }

  const handleViewPrint = async () => {
    setIsPrinting(true);
    try {
      await openPrintDialog(formData.pdfUrl);
    } catch (error) {
      console.error('Failed to open print dialog:', error);
      toast({
        title: "Failed to Open Form",
        description: "Could not access the saved form. Try regenerating a new one.",
        variant: "destructive"
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
      <Badge variant="secondary" className="flex items-center gap-1">
        <FileText className="h-3 w-3" />
        Form #{formData.id}
      </Badge>
      
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleViewPrint}
          disabled={isPrinting}
          className="flex items-center gap-1"
        >
          {isPrinting ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : (
            <Printer className="h-3 w-3" />
          )}
          View/Print
        </Button>
        
        {isOutdated && (
          <>
            <Badge variant="destructive" className="text-xs">
              Form out of date
            </Badge>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRegenerate}
              className="flex items-center gap-1 text-orange-600 border-orange-300 hover:bg-orange-50"
            >
              <RotateCcw className="h-3 w-3" />
              Regenerate
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
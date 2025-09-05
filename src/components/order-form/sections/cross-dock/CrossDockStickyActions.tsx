import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Loader2 } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../order-form-schema";
import { useToast } from "@/hooks/use-toast";
import { 
  generateCrossDockPDF, 
  validateCrossDockFields, 
  openPrintDialog,
  CrossDockFormData 
} from "@/services/crossDockPdfService";

interface CrossDockStickyActionsProps {
  form: UseFormReturn<OrderFormValues>;
  onAddToOrder: () => void;
  onFormGenerated: (formData: CrossDockFormData) => void;
}

export function CrossDockStickyActions({ 
  form, 
  onAddToOrder, 
  onFormGenerated 
}: CrossDockStickyActionsProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateAndAdd = async () => {
    setIsGenerating(true);
    
    try {
      // Validate required fields
      const formValues = form.getValues();
      const validationErrors = validateCrossDockFields(formValues);
      
      if (validationErrors.length > 0) {
        toast({
          title: "Missing Required Fields",
          description: validationErrors.join(", "),
          variant: "destructive"
        });
        return;
      }

      // Generate PDF
      const formData = await generateCrossDockPDF(formValues);
      
      // Open print dialog immediately
      openPrintDialog(formData.pdfUrl);
      
      // Auto-add to order
      onAddToOrder();
      
      // Update parent component with form data
      onFormGenerated(formData);
      
      toast({
        title: "Cross-Dock Form Created",
        description: "Cross-Dock Form created and line added. Don't forget to place the printed form with the tires."
      });
      
    } catch (error) {
      console.error('Failed to generate cross-dock form:', error);
      toast({
        title: "Failed to Generate Form",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/50">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-center gap-3 px-4 py-4">
        <Button
          type="button"
          onClick={handleGenerateAndAdd}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold px-8 py-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <FileText className="h-4 w-4" />
              <Plus className="h-4 w-4" />
            </>
          )}
          Generate & Print Cross-Dock Form + Add Line
        </Button>
        
        <div className="text-sm text-muted-foreground">
          Creates PDF, opens print dialog, and adds line to order
        </div>
      </div>
    </div>
  );
}
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

      // Generate PDF (this now prints immediately from blob)
      const formData = await generateCrossDockPDF(formValues);
      
      // Auto-add to order
      onAddToOrder();
      
      // Update parent component with form data
      onFormGenerated(formData);
      
      toast({
        title: "Cross-Dock Form Created & Printed",
        description: "Form printed successfully and line added to order. The form is being saved to cloud storage."
      });
      
    } catch (error) {
      console.error('Failed to generate cross-dock form:', error);
      
      // Check if it's a storage/upload error vs generation error
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      
      if (errorMessage.includes("upload") || errorMessage.includes("storage")) {
        toast({
          title: "Form Printed, Cloud Save Failed",
          description: "Your form was printed successfully, but saving to cloud storage failed. You can regenerate later if needed.",
          variant: "warning"
        });
        
        // Still add to order since printing worked
        onAddToOrder();
      } else {
        toast({
          title: "Failed to Generate Form",
          description: errorMessage,
          variant: "destructive"
        });
      }
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
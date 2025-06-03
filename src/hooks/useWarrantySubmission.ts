
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { uploadFileToSupabase, uploadMultipleFiles } from "@/services/storageService";
import { submitRetreadWarranty } from "@/services/warrantyService";
import { validateWarrantyForm } from "@/utils/warrantyValidation";
import { RetreadWarrantyFormData } from "./useRetreadWarrantyForm";

export const useWarrantySubmission = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const submitWarranty = async (
    form: RetreadWarrantyFormData,
    setLoading: (loading: boolean) => void,
    resetForm: () => void
  ) => {
    // Validation
    const validation = validateWarrantyForm(form);
    if (!validation.isValid) {
      toast({ 
        variant: "destructive", 
        title: "Validation Error",
        description: validation.errors[0]
      });
      return;
    }

    setLoading(true);
    try {
      console.log("🚀 Starting warranty claim submission...");
      
      // Upload invoice file
      const invoiceUrl = await uploadFileToSupabase(
        form.invoiceFile!, 
        "warranty-docs", 
        user?.id
      );
      
      // Upload photo files if any
      const photoUrls = form.photoFiles.length > 0 
        ? await uploadMultipleFiles(form.photoFiles, "warranty-photos", user?.id)
        : [];

      // Submit warranty claim - removed user_id to avoid UUID error
      await submitRetreadWarranty({
        plant: user?.plant || "Grand Prairie 97",
        store: user?.storeName || "",
        tire_type: "Retread",
        dot_number: form.dotNumber,
        condition: form.condition,
        notes: form.notes,
        customer_name: form.customerName,
        work_order: form.workOrder,
        tire_size: form.tireSize,
        invoice_url: invoiceUrl,
        photo_urls: photoUrls,
        email: user?.email || "",
        name: user?.name || "",
      });

      toast({ 
        title: "Success!",
        description: "Warranty claim submitted. You will be notified once credit is processed." 
      });
      
      resetForm();
      
    } catch (error) {
      console.error("❌ Warranty submission error:", error);
      toast({ 
        variant: "destructive", 
        title: "Submission Failed",
        description: "Error submitting warranty claim. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return { submitWarranty };
};

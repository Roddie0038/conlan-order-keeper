
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { uploadFileToSupabase, uploadMultipleFiles } from "@/services/storageService";
import { submitRetreadWarranty } from "@/services/warrantyService";
import { validateWarrantyForm } from "@/utils/warrantyValidation";
import { getFirstManagerEmail } from "@/services/dynamicEmailService";
import { RetreadWarrantyFormData } from "./useRetreadWarrantyForm";
import { normalizeStoreForSubmission } from "@/utils/storeNormalization";

export const useWarrantySubmission = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const submitWarranty = async (
    form: RetreadWarrantyFormData,
    setLoading: (loading: boolean) => void,
    resetForm: () => void,
    setErrors: (errors: Record<string, string>) => void
  ) => {
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!form.destinationPlant) {
      newErrors.destinationPlant = "Please select a destination plant";
    }

    const validation = validateWarrantyForm(form);
    if (!validation.isValid) {
      newErrors.general = validation.errors[0];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast({ 
        variant: "destructive", 
        title: "Validation Error",
        description: "Please complete all required fields"
      });
      return;
    }

    setLoading(true);
    try {
      console.log("🚀 Starting warranty claim submission for plant:", form.destinationPlant);
      
      const normalizedStore = normalizeStoreForSubmission(user?.store || "");
      const managerEmail = await getFirstManagerEmail(normalizedStore);
      const storeName = normalizedStore;
      const submitterName = user?.name || "Store Manager";
      
      console.log("✅ WARRANTY FORM - Using selected plant:", form.destinationPlant);
      
      // Upload invoice file if provided
      let invoiceUrl = "";
      if (form.invoiceFile) {
        invoiceUrl = await uploadFileToSupabase(
          form.invoiceFile, 
          "warranty-docs", 
          user?.id
        );
      }
      
      // Upload photo files if any
      const photoUrls = form.photoFiles.length > 0 
        ? await uploadMultipleFiles(form.photoFiles, "warranty-photos", user?.id)
        : [];

      // Submit warranty claim using the selected plant directly
      const result = await submitRetreadWarranty({
        plant: form.destinationPlant, // ✅ Use selected plant directly
        store: normalizedStore,
        tire_type: "Retread",
        dot_number: form.dotNumber,
        condition: form.condition,
        notes: form.notes,
        customer_name: form.customerName,
        work_order: form.workOrder,
        tire_size: form.tireSize,
        invoice_url: invoiceUrl,
        photo_urls: photoUrls,
        email: managerEmail,
        name: submitterName,
      });

      if (result.error) {
        throw result.error;
      }

      console.log("✅ WARRANTY FORM - Submitted to plant:", form.destinationPlant);

      toast({ 
        title: "Success!",
        description: `Warranty claim submitted successfully to ${form.destinationPlant}. You will be notified once credit is processed.` 
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

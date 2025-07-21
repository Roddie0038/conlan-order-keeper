
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { uploadFileToSupabase, uploadMultipleFiles } from "@/services/storageService";
import { submitRetreadWarranty } from "@/services/warrantyService";
import { validateWarrantyForm } from "@/utils/warrantyValidation";
import { getFirstManagerEmail } from "@/services/dynamicEmailService";
import { RetreadWarrantyFormData } from "./useRetreadWarrantyForm";
import { getPlantForStore } from "@/utils/plantMapping";
import { normalizeStoreForSubmission } from "@/utils/storeNormalization";

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
      
      // CRITICAL: Normalize store to "Store XX" format BEFORE any processing
      const normalizedStore = normalizeStoreForSubmission(user?.store || "");
      console.log("🔄 WARRANTY STORE NORMALIZATION:", {
        original: user?.store,
        normalized: normalizedStore
      });
      
      // Get the proper manager email and store name using normalized store
      const managerEmail = await getFirstManagerEmail(normalizedStore);
      const storeName = normalizedStore;
      const submitterName = user?.name || "Store Manager";
      
      console.log("📧 WARRANTY SUBMISSION - Using email:", managerEmail, "for normalized store:", storeName);
      
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

      // Submit warranty claim with proper email and normalized store information
      const result = await submitRetreadWarranty({
        plant: getPlantForStore(normalizedStore) || "Grand Prairie 097",
        store: normalizedStore, // ✅ Normalized
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

      toast({ 
        title: "Success!",
        description: "Warranty claim submitted successfully. You will be notified once credit is processed." 
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

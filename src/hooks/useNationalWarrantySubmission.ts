
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { uploadFileToSupabase, uploadMultipleFiles } from "@/services/storageService";
import { submitNationalWarranty } from "@/services/warrantyService";
import { validateNationalWarrantyForm } from "@/utils/warrantyValidation";
import { NationalWarrantyFormData } from "./useNationalWarrantyForm";

export const useNationalWarrantySubmission = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const submitWarranty = async (
    form: NationalWarrantyFormData,
    setLoading: (loading: boolean) => void,
    resetForm: () => void
  ) => {
    // Validation
    const validation = validateNationalWarrantyForm(form);
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
      console.log("🚀 Starting National Account warranty claim submission...");
      
      // Upload signature file
      const signatureUrl = await uploadFileToSupabase(
        form.signatureFile!, 
        "warranty-docs", 
        user?.id
      );
      
      // Upload photo files if any
      const photoUrls = form.photoFiles.length > 0 
        ? await uploadMultipleFiles(form.photoFiles, "warranty-photos", user?.id)
        : [];

      // Submit warranty claim - removed user_id to avoid UUID error
      await submitNationalWarranty({
        plant: user?.plant || "Grand Prairie 97",
        store: user?.storeName || "",
        tire_type: "National Account",
        customer_name: form.customerName,
        work_order: form.workOrder,
        vehicle_make: form.vehicleMake,
        vin_or_unit: form.vinOrUnit,
        model_year: form.modelYear,
        purchase_date: form.purchaseDate,
        wheel_position: form.wheelPosition,
        dot_number: form.dotNumber,
        tire_size: form.tireSize,
        load_range: form.loadRange,
        wear_percentage: form.wearPercentage,
        mileage_on_tire: form.mileageOnTire,
        condition: form.reasonForAdjustment,
        excise_tax_collected: form.exciseTaxCollected,
        replacement_product_code: form.replacementProductCode,
        notes: form.notes,
        signature_url: signatureUrl,
        photo_urls: photoUrls,
        email: user?.email || "",
        name: user?.name || "",
      });

      toast({ 
        title: "Success!",
        description: "National Account warranty claim submitted. The Continental Rep team will review your claim." 
      });
      
      resetForm();
      
    } catch (error) {
      console.error("❌ National warranty submission error:", error);
      toast({ 
        variant: "destructive", 
        title: "Submission Failed",
        description: "Error submitting National Account warranty claim. Please try again." 
      });
    } finally {
      setLoading(false);
    }
  };

  return { submitWarranty };
};

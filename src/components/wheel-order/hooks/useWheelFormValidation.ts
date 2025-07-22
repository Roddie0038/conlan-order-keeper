
import { WheelFormData } from "../types";
import { useToast } from "@/components/ui/use-toast";

export function useWheelFormValidation() {
  const { toast } = useToast();

  const validateForm = (formData: WheelFormData, isAdmin: boolean | undefined) => {
    const missingFields: string[] = [];

    console.log("🔍 WHEEL VALIDATION - Starting validation with data:", {
      yourName: formData.yourName,
      storeId: formData.storeId,
      storeName: formData.storeName,
      userStore: formData.userStore,
      qtyWheels: formData.qtyWheels,
      customerName: formData.customerName,
      wheelMaterial: formData.wheelMaterial,
      wheelType: formData.wheelType,
      handHoles: formData.handHoles,
      wheelSize: formData.wheelSize,
      wheelColor: formData.wheelColor,
      isAdmin: isAdmin
    });

    if (!formData.yourName) {
      missingFields.push("Your Name");
    }

    if (!formData.storeId) {
      missingFields.push("Store");
      console.warn("🚨 WHEEL VALIDATION - Missing storeId");
    }

    // Fix: Check if user is not admin and the store name doesn't match the user's store
    if (!isAdmin && formData.storeName !== formData.userStore) {
      toast({
        title: "Unauthorized",
        description: "You can only submit orders for your own store.",
        variant: "destructive",
      });
      console.warn("🚨 WHEEL VALIDATION - Store mismatch:", {
        storeName: formData.storeName,
        userStore: formData.userStore
      });
      return false;
    }

    if (!formData.qtyWheels) {
      missingFields.push("Quantity of Wheels");
    }

    if (!formData.customerName) {
      missingFields.push("Customer Name");
    }

    // CRITICAL: Validate all wheel specification fields
    if (!formData.wheelMaterial) {
      missingFields.push("Wheel Material");
    }

    if (!formData.wheelType) {
      missingFields.push("Wheel Type");
    }

    if (!formData.handHoles) {
      missingFields.push("Hand Holes");
    }

    if (!formData.wheelSize) {
      missingFields.push("Wheel Size");
    }

    if (!formData.wheelColor) {
      missingFields.push("Wheel Color");
    }

    // Show comprehensive validation feedback
    if (missingFields.length > 0) {
      console.warn("🚨 WHEEL VALIDATION - Missing fields:", missingFields);
      
      if (missingFields.length === 1) {
        toast({
          title: "Missing Required Field",
          description: `Please fill in: ${missingFields[0]}`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Missing Required Fields",
          description: `Please fill in: ${missingFields.join(", ")}`,
          variant: "destructive",
        });
      }
      return false;
    }

    console.log("✅ WHEEL VALIDATION - All fields valid");
    return true;
  };

  return { validateForm };
}

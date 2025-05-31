
import { WheelFormData } from "../types";
import { useToast } from "@/components/ui/use-toast";

export function useWheelFormValidation() {
  const { toast } = useToast();

  const validateForm = (formData: WheelFormData, isAdmin: boolean | undefined) => {
    if (!formData.yourName) {
      toast({
        title: "Missing Name",
        description: "Please enter your name.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.storeId) {
      toast({
        title: "Missing Store",
        description: "Please select a store.",
        variant: "destructive",
      });
      return false;
    }

    // Fix: Check if user is not admin and the store name doesn't match the user's store
    if (!isAdmin && formData.storeName !== formData.userStore) {
      toast({
        title: "Unauthorized",
        description: "You can only submit orders for your own store.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.qtyWheels) {
      toast({
        title: "Missing Quantity",
        description: "Please enter quantity of wheels.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.customerName) {
      toast({
        title: "Missing Customer Name",
        description: "Please enter the customer name.",
        variant: "destructive",
      });
      return false;
    }

    // CRITICAL: Validate all wheel specification fields
    if (!formData.wheelMaterial) {
      toast({
        title: "Missing Wheel Material",
        description: "Please select the wheel material.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.wheelType) {
      toast({
        title: "Missing Wheel Type",
        description: "Please select the wheel type.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.handHoles) {
      toast({
        title: "Missing Hand Holes",
        description: "Please enter the number of hand holes.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.wheelSize) {
      toast({
        title: "Missing Wheel Size",
        description: "Please select the wheel size.",
        variant: "destructive",
      });
      return false;
    }

    if (!formData.wheelColor) {
      toast({
        title: "Missing Wheel Color",
        description: "Please select the desired wheel color.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { validateForm };
}

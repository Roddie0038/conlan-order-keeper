
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

    if (!isAdmin && formData.storeName !== isAdmin?.store) {
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

    return true;
  };

  return { validateForm };
}

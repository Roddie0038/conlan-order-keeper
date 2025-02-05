import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { MTOFormFields } from "./MTOFormFields";
import { useSubmitMTOOrder } from "./useSubmitMTOOrder";
import { initialMTOFormData } from "./types";
import type { MTOFormData } from "./types";

export const MTOOrderForm = () => {
  const { user } = useAuth();
  const { submitOrder, isSubmitting } = useSubmitMTOOrder();
  const [formData, setFormData] = useState<MTOFormData>({
    ...initialMTOFormData,
    store: user?.store || "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await submitOrder(formData);
    
    if (success) {
      setFormData({
        ...initialMTOFormData,
        store: user?.store || "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <MTOFormFields 
        formData={formData}
        handleChange={handleChange}
      />

      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        Submit MTO Order
      </Button>
    </form>
  );
};
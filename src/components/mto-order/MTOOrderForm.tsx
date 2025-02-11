
import { Button } from "@/components/ui/button";
import { MTOFormFields } from "./MTOFormFields";
import { useMTOForm } from "./hooks/useMTOForm";
import { useSubmitMTOOrder } from "./hooks/useSubmitMTOOrder";

export const MTOOrderForm = () => {
  const {
    formData,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    resetForm,
    toast
  } = useMTOForm();

  const handleSubmit = useSubmitMTOOrder({
    formData,
    setIsSubmitting,
    resetForm,
    toast
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
      <MTOFormFields 
        formData={formData}
        onChange={handleChange}
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

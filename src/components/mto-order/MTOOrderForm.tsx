
import { Button } from "@/components/ui/button";
import { MTOFormFields } from "./MTOFormFields";
import { useMTOForm } from "./hooks/useMTOForm";
import { useSubmitMTOOrder } from "./hooks/useSubmitMTOOrder";
import { MTOTemplates } from "./MTOTemplates";
import { MTOFormData } from "./mto-form-config";

export const MTOOrderForm = () => {
  const {
    formData,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    setFormData,
    resetForm,
    toast,
    isAdmin
  } = useMTOForm();

  const handleSubmit = useSubmitMTOOrder({
    formData,
    setIsSubmitting,
    resetForm,
    toast
  });

  const handleLoadTemplate = (templateData: MTOFormData) => {
    setFormData(prev => ({
      ...templateData,
      store: prev.store, // Preserve current store
      managerEmail: prev.managerEmail, // Preserve current manager email
      timestamp: new Date().toLocaleString(), // Update timestamp
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 rounded-lg shadow bg-slate-500 hover:bg-slate-400">
      <MTOTemplates 
        currentFormData={formData}
        onLoadTemplate={handleLoadTemplate}
      />

      <MTOFormFields 
        formData={formData} 
        onChange={handleChange} 
        isAdmin={isAdmin}
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Submit MTO Order
      </Button>
    </form>
  );
};


import { Button } from "@/components/ui/button";
import { MTOFormFields } from "./MTOFormFields";
import { useMTOForm } from "./hooks/useMTOForm";
import { useSubmitMTOOrder } from "./hooks/useSubmitMTOOrder";
import { OrderTemplate } from "../order-templates/OrderTemplate";
import { InventoryProvider } from "@/contexts/InventoryContext";
import { InventorySearch } from "../order-form/InventorySearch";
import { InventoryItem } from "@/types/inventory";

export const MTOOrderForm = () => {
  const {
    formData,
    isSubmitting,
    setIsSubmitting,
    handleChange,
    resetForm,
    toast,
    isAdmin,
    setFormData
  } = useMTOForm();

  const handleSubmit = useSubmitMTOOrder({
    formData,
    setIsSubmitting,
    resetForm,
    toast
  });

  const handleLoadTemplate = (templateData: any) => {
    setFormData({
      ...templateData,
      timestamp: new Date().toLocaleString() // Always use current timestamp
    });
    toast({
      title: "Template Loaded",
      description: "The template has been loaded successfully."
    });
  };

  const handleSelectInventoryItem = (item: InventoryItem) => {
    setFormData(prev => ({
      ...prev,
      productNumber: item.product_number,
      description: item.description
    }));

    toast({
      title: "Item Selected",
      description: `${item.product_number} has been added to the form.`
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 rounded-lg shadow bg-slate-500 hover:bg-slate-400">
      <div className="mb-6">
        <h3 className="mb-4 px-[180px] text-3xl text-blue-300 font-bold">Order Templates</h3>
        <OrderTemplate type="mto" currentData={formData} onLoadTemplate={handleLoadTemplate} />
      </div>
      
      <InventoryProvider>
        <InventorySearch onSelectItem={handleSelectInventoryItem} />
        <MTOFormFields formData={formData} onChange={handleChange} isAdmin={isAdmin} />
      </InventoryProvider>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        Submit MTO Order
      </Button>
    </form>
  );
};

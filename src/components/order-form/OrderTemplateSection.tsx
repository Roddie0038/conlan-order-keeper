
import { useToast } from "@/components/ui/use-toast";
import { OrderTemplate } from "../order-templates/OrderTemplate";
import { FormData } from "./formConfig";

interface OrderTemplateSectionProps {
  formData: FormData;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

export const OrderTemplateSection = ({ formData, setFormData }: OrderTemplateSectionProps) => {
  const { toast } = useToast();
  
  const handleLoadTemplate = (templateData: FormData) => {
    setFormData({
      ...templateData,
      dateReceived: new Date().toLocaleString() // Always use current date
    });
    toast({
      title: "Template Loaded",
      description: "The template has been loaded successfully."
    });
  };

  return (
    <div className="mb-6">
      <h3 className="mb-4 text-slate-50 text-center font-bold text-2xl">Order Templates</h3>
      <OrderTemplate 
        type="regular" 
        currentData={formData} 
        onLoadTemplate={handleLoadTemplate} 
      />
    </div>
  );
};

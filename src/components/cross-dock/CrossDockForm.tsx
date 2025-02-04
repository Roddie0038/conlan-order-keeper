import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FormField } from "@/components/order-form/FormField";
import { stores } from "@/components/order-form/formConfig";
import { Button } from "@/components/ui/button";
import { submitToGoogleDocs } from "@/services/docs";

interface CrossDockData {
  date: string;
  fromStore: string;
  toStore: string;
  receiverNo: string;
  productCode: string;
  description: string;
  quantity: string;
}

const initialFormData: CrossDockData = {
  date: new Date().toISOString().split('T')[0],
  fromStore: "",
  toStore: "",
  receiverNo: "",
  productCode: "",
  description: "",
  quantity: "",
};

export const CrossDockForm = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<CrossDockData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: keyof CrossDockData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await submitToGoogleDocs(formData);
      
      toast({
        title: "Success",
        description: "Cross dock paperwork has been generated successfully.",
      });
      
      setFormData(initialFormData);
      
      // Open the Google Doc in a new tab
      window.open("https://docs.google.com/document/d/1n6SYt0gILrQ1CI3Y2deM_6_8B7dzUIrfJ4pUrKER3GI/edit?tab=t.0", "_blank");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate cross dock paperwork. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      <FormField
        label="Date"
        type="date"
        value={formData.date}
        onChange={(value) => handleChange("date", value)}
        required
      />
      
      <FormField
        label="From Store"
        value={formData.fromStore}
        onChange={(value) => handleChange("fromStore", value)}
        options={stores}
        required
      />
      
      <FormField
        label="To Store"
        value={formData.toStore}
        onChange={(value) => handleChange("toStore", value)}
        options={stores}
        required
      />
      
      <FormField
        label="Receiver No (MaddenCo)"
        value={formData.receiverNo}
        onChange={(value) => handleChange("receiverNo", value)}
        required
      />
      
      <FormField
        label="Product Code"
        value={formData.productCode}
        onChange={(value) => handleChange("productCode", value)}
        required
      />
      
      <FormField
        label="Description"
        value={formData.description}
        onChange={(value) => handleChange("description", value)}
        required
      />
      
      <FormField
        label="Quantity"
        type="number"
        value={formData.quantity}
        onChange={(value) => handleChange("quantity", value)}
        required
      />
      
      <Button 
        type="submit" 
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Generating..." : "Generate Paperwork"}
      </Button>
    </form>
  );
};
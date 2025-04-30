import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FormField } from "./FormField";
import { stores } from "./formConfig";
import { useAuth } from "@/contexts/AuthContext";

interface CrossDockPaperworkData {
  date: string;
  fromStore: string;
  toStore: string;
  receiverNo: string;
  productCode: string;
  description: string;
  quantity: string;
}

const initialFormData: CrossDockPaperworkData = {
  date: new Date().toISOString().split('T')[0],
  fromStore: "",
  toStore: "",
  receiverNo: "",
  productCode: "",
  description: "",
  quantity: "",
};

export const CrossDockPaperworkForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<CrossDockPaperworkData>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Find full store names
      const fromStore = stores.find(s => s.id === formData.fromStore);
      const toStore = stores.find(s => s.id === formData.toStore);
      
      const documentData = {
        ...formData,
        fromStore: fromStore ? `${fromStore.name} (${fromStore.id})` : formData.fromStore,
        toStore: toStore ? `${toStore.name} (${toStore.id})` : formData.toStore,
      };

      console.log("Submitting cross dock paperwork:", documentData);
      
      // Submit to Google Docs via webhook
      await fetch("https://hooks.zapier.com/hooks/catch/21441385/2fo5hcr/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors",
        body: JSON.stringify({
          ...documentData,
          type: "crossDockPaperwork",
          triggered_from: window.location.origin,
        }),
      });

      toast({
        title: "Success",
        description: "Cross dock paperwork has been submitted.",
      });

      setFormData(initialFormData);
    } catch (error) {
      console.error("Error submitting cross dock paperwork:", error);
      toast({
        title: "Error",
        description: "Failed to submit cross dock paperwork. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChange = (field: keyof CrossDockPaperworkData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Cross Dock Paperwork</h2>
        <p className="text-sm text-gray-600 mt-2">
          This form is intended for sending tires or materials to another store using the Warehouse as a cross dock location
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition-colors"
          >
            Submit Paperwork
          </button>
        </div>
      </form>
    </div>
  );
};
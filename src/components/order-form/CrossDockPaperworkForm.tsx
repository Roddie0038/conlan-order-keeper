
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { stores } from "./formConfig";
import { useAuth } from "@/contexts/AuthContext";
import { generateCrossDockPDF } from "@/utils/exportUtils";
import { Button } from "@/components/ui/button";
import { FormField } from "./FormField";
import { ProductTable } from "./cross-dock/ProductTable";
import { CrossDockPaperworkData, initialFormData } from "./cross-dock/types";

export const CrossDockPaperworkForm = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState<CrossDockPaperworkData>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const fromStore = stores.find(s => s.id === formData.fromStore);
      const toStore = stores.find(s => s.id === formData.toStore);
      
      const documentData = {
        ...formData,
        fromStore: fromStore ? `${fromStore.name} (${fromStore.id})` : formData.fromStore,
        toStore: toStore ? `${toStore.name} (${toStore.id})` : formData.toStore,
      };

      console.log("Submitting cross dock paperwork:", documentData);
      
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

      generateCrossDockPDF(formData);
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

  const handleChange = (field: keyof Omit<CrossDockPaperworkData, 'products'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-lg p-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-primary underline">Cross Dock Form</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            This form is used when sending tires/material to another store using the Warehouse as a cross dock location.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <FormField
            label="Date"
            type="date"
            value={formData.date}
            onChange={(value) => handleChange("date", value)}
            required
          />
          
          <FormField
            label="FROM Store"
            value={formData.fromStore}
            onChange={(value) => handleChange("fromStore", value)}
            options={stores}
            required
          />
          
          <FormField
            label="TO Store"
            value={formData.toStore}
            onChange={(value) => handleChange("toStore", value)}
            options={stores}
            required
          />
          
          <FormField
            label="Receiver No (MaddenCo)"
            type="text"
            value={formData.receiverNo}
            onChange={(value) => handleChange("receiverNo", value)}
            required
          />
          
          <ProductTable 
            products={formData.products}
            onProductsChange={(products) => setFormData(prev => ({ ...prev, products }))}
          />

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            Submit
          </Button>
        </form>
      </div>
    </div>
  );
};

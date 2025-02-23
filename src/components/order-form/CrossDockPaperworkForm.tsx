
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { FormField } from "./FormField";
import { stores } from "./formConfig";
import { useAuth } from "@/contexts/AuthContext";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

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

  const handleExport = (type: 'excel' | 'pdf') => {
    const fromStore = stores.find(s => s.id === formData.fromStore);
    const toStore = stores.find(s => s.id === formData.toStore);
    
    const exportData = [{
      Date: formData.date,
      'From Store': fromStore ? `${fromStore.name} (${fromStore.id})` : formData.fromStore,
      'To Store': toStore ? `${toStore.name} (${toStore.id})` : formData.toStore,
      'Receiver No': formData.receiverNo,
      'Product Code': formData.productCode,
      Description: formData.description,
      Quantity: formData.quantity,
    }];

    const headers = ['Date', 'From Store', 'To Store', 'Receiver No', 'Product Code', 'Description', 'Quantity'];
    
    if (type === 'excel') {
      exportToExcel(exportData, `cross-dock-paperwork-${new Date().toISOString().split('T')[0]}`);
    } else {
      exportToPDF(exportData, `cross-dock-paperwork-${new Date().toISOString().split('T')[0]}`, headers);
    }
  };

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

      // After successful submission, trigger downloads
      handleExport('excel');
      handleExport('pdf');

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
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto bg-white/90 dark:bg-slate-800/90 rounded-lg shadow-lg p-6 space-y-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-primary">Cross Dock Paperwork</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
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
            type="text"
            value={formData.receiverNo}
            onChange={(value) => handleChange("receiverNo", value)}
            required
          />
          
          <FormField
            label="Product Code"
            type="text"
            value={formData.productCode}
            onChange={(value) => handleChange("productCode", value)}
            required
          />
          
          <FormField
            label="Description"
            type="text"
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

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleExport('excel')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleExport('pdf')}
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              Submit Paperwork
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

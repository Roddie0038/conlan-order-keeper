
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { stores } from "./formConfig";
import { useAuth } from "@/contexts/AuthContext";
import { exportToExcel, generateCrossDockPDF } from "@/utils/exportUtils";
import { CrossDockHeader } from "./cross-dock/CrossDockHeader";
import { CrossDockFormFields } from "./cross-dock/CrossDockFormFields";
import { ExportButtons } from "./cross-dock/ExportButtons";
import { CrossDockPaperworkData, initialFormData } from "./cross-dock/types";

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

    if (type === 'excel') {
      exportToExcel(exportData, `cross-dock-paperwork-${new Date().toISOString().split('T')[0]}`);
    } else {
      generateCrossDockPDF(formData);
    }
  };

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
        <CrossDockHeader />

        <form onSubmit={handleSubmit} className="space-y-4">
          <CrossDockFormFields 
            formData={formData}
            onChange={handleChange}
          />

          <ExportButtons onExport={handleExport} />
        </form>
      </div>
    </div>
  );
};

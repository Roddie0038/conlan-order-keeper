
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../order-form-schema";
import { CrossDockOptionSelect } from "./cross-dock/CrossDockOptionSelect";
import { CrossDockDetailsForm } from "./cross-dock/CrossDockDetailsForm";
import { StoreInfoBar } from "./cross-dock/StoreInfoBar";
import { CrossDockFormBanner } from "./cross-dock/CrossDockFormBanner";
import { CrossDockFormStatus } from "./cross-dock/CrossDockFormStatus";
import { CrossDockStickyActions } from "./cross-dock/CrossDockStickyActions";
import { CrossDockFormData } from "@/services/crossDockPdfService";

interface CrossDockSectionProps {
  form: UseFormReturn<OrderFormValues>;
  showCrossDockDestination: boolean;
  onAddToOrder: () => void;
}

export function CrossDockSection({ 
  form, 
  showCrossDockDestination,
  onAddToOrder
}: CrossDockSectionProps) {
  const [formData, setFormData] = useState<CrossDockFormData | null>(null);
  const [isFormOutdated, setIsFormOutdated] = useState(false);
  const [lastFormSnapshot, setLastFormSnapshot] = useState<string>('');

  // Watch for changes to detect if form is outdated
  const formValues = form.watch();
  
  useEffect(() => {
    if (formData) {
      // Create snapshot of relevant cross-dock fields
      const currentSnapshot = JSON.stringify({
        yourName: formValues.yourName,
        receiverNo: formValues.receiverNo,
        store: formValues.store,
        crossDockDestination: formValues.crossDockDestination,
        dateReceived: formValues.dateReceived,
        etaDate: formValues.etaDate,
        productNumber: formValues.productNumber,
        description: formValues.description,
        quantity: formValues.quantity,
        notes: formValues.notes
      });
      
      if (lastFormSnapshot && currentSnapshot !== lastFormSnapshot) {
        setIsFormOutdated(true);
      }
    }
  }, [formValues, formData, lastFormSnapshot]);

  const handleFormGenerated = (newFormData: CrossDockFormData) => {
    setFormData(newFormData);
    setIsFormOutdated(false);
    
    // Create snapshot for change detection
    const snapshot = JSON.stringify({
      yourName: formValues.yourName,
      receiverNo: formValues.receiverNo,
      store: formValues.store,
      crossDockDestination: formValues.crossDockDestination,
      dateReceived: formValues.dateReceived,
      etaDate: formValues.etaDate,
      productNumber: formValues.productNumber,
      description: formValues.description,
      quantity: formValues.quantity,
      notes: formValues.notes
    });
    setLastFormSnapshot(snapshot);
  };

  const handleRegenerate = async () => {
    // Regenerate will be handled by the sticky actions component
    setIsFormOutdated(false);
  };

  return (
    <>
      <div className="w-full">
        {/* Centered Cross Dock Options selector */}
        <div className="w-full max-w-xs mb-6 mx-auto">
          <CrossDockOptionSelect form={form} />
        </div>
        
        {/* Show banner when Cross Dock is selected */}
        {showCrossDockDestination && (
          <CrossDockFormBanner />
        )}
        
        {/* Cross Dock Form Details section only shown when "Yes" is selected */}
        {showCrossDockDestination && (
          <div className="w-full mt-4">
            <CrossDockDetailsForm form={form} />
          </div>
        )}
        
        {/* Show form status if form has been generated */}
        {showCrossDockDestination && formData && (
          <div className="mt-4">
            <CrossDockFormStatus 
              formData={formData}
              isOutdated={isFormOutdated}
              onRegenerate={handleRegenerate}
            />
          </div>
        )}
        
        <StoreInfoBar form={form} />
        
        {/* Add bottom padding to account for sticky footer */}
        {showCrossDockDestination && (
          <div className="h-24" />
        )}
      </div>
      
      {/* Sticky Actions Footer */}
      {showCrossDockDestination && (
        <CrossDockStickyActions 
          form={form}
          onAddToOrder={onAddToOrder}
          onFormGenerated={handleFormGenerated}
        />
      )}
    </>
  );
}

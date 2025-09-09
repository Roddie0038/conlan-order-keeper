
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "./order-form-schema";
import { Form } from "@/components/ui/form";
import { ContactSection } from "./sections/ContactSection";
import { ProductSection } from "./sections/ProductSection";
import { ScheduleSection } from "./sections/ScheduleSection";
import { CrossDockSection } from "./sections/CrossDockSection";
import { MandatoryPlantSelector } from "@/components/ui/mandatory-plant-selector";
import { SHOW_CROSS_DOCK } from "@/config/featureFlags";
import { TemplateSection } from "./sections/TemplateSection";
import { CrossPlantSection } from "@/components/orders/CrossPlantSection";
import OrderSummaryPreview from "@/components/orders/OrderSummaryPreview";
import ConfirmSamePlantModal from "@/components/common/ConfirmSamePlantModal";
import { hasFullStoreAccess } from "@/lib/roles";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { SectionBox } from "@/components/ui/SectionBox";

interface OrderFormContentProps {
  form: UseFormReturn<OrderFormValues>;
  showCrossDockDestination: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onAddToOrder: () => void;
  getCurrentFormData: () => any;
  onLoadTemplate: (templateData: any) => void;
}

export function OrderFormContent({ 
  form, 
  showCrossDockDestination,
  onSubmit,
  onAddToOrder,
  getCurrentFormData,
  onLoadTemplate
}: OrderFormContentProps) {
  const { user } = useAuth();
  const elevated = hasFullStoreAccess(user);
  const [needSamePlantConfirm, setNeedSamePlantConfirm] = React.useState(false);
  const [pendingSubmit, setPendingSubmit] = React.useState<((e: React.FormEvent<HTMLFormElement>) => void) | null>(null);

  const requiresSamePlantConfirm = () => {
    const orderingPlant = form.watch("ordering_plant");
    const destinationPlant = form.watch("destination_plant");
    return elevated && orderingPlant && destinationPlant && (orderingPlant === destinationPlant);
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (requiresSamePlantConfirm()) {
      e.preventDefault();
      setPendingSubmit(() => onSubmit);
      setNeedSamePlantConfirm(true);
      return;
    }
    onSubmit(e);
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-8 pb-28">
        {/* Template Section */}
        <TemplateSection 
          getCurrentFormData={getCurrentFormData}
          onLoadTemplate={onLoadTemplate}
        />
        
        {/* Contact Information */}
        <SectionBox title="Contact Information" tone="cyan">
          <ContactSection form={form} />
        </SectionBox>
        
        {/* Mandatory Plant Selector */}
        <SectionBox title="Select Destination Plant" tone="amber">
          <MandatoryPlantSelector
            value={form.watch("destinationPlant") || ""}
            onChange={(value) => form.setValue("destinationPlant", value)}
            error={form.formState.errors.destinationPlant?.message}
          />
        </SectionBox>
        
        {/* Order Details */}
        <SectionBox title="Product Details" tone="green">
          <ProductSection form={form} />
        </SectionBox>
        
        {/* Logistics */}
        <SectionBox title="Schedule & Notes" tone="purple">
          <ScheduleSection form={form} />
        </SectionBox>
        
        {/* Cross-Plant Ordering - For elevated users only */}
        {elevated && (
          <CrossPlantSection
            enabled={elevated}
            value={{
              ordering_store: form.watch("ordering_store") || null,
              ordering_plant: form.watch("ordering_plant") || null,
              destination_plant: form.watch("destination_plant") || null,
            }}
            onChange={(crossPlantData) => {
              form.setValue("ordering_store", crossPlantData.ordering_store || "");
              form.setValue("ordering_plant", crossPlantData.ordering_plant || "");
              form.setValue("destination_plant", crossPlantData.destination_plant || "");
            }}
          />
        )}

        {/* Order Summary Preview - For elevated users only */}
        {elevated && (
          <OrderSummaryPreview
            enabled={elevated}
            cross={{
              ordering_store: form.watch("ordering_store") || null,
              ordering_plant: form.watch("ordering_plant") || null,
              destination_plant: form.watch("destination_plant") || null,
            }}
            legacy={{
              store: form.watch("store") || "",
              plant: form.watch("destinationPlant") || "",
            }}
          />
        )}

        {/* Cross Dock - Only show if feature flag is enabled */}
        {SHOW_CROSS_DOCK && (
          <SectionBox title="Cross Dock Options" tone="fuchsia">
            <CrossDockSection 
              form={form} 
              showCrossDockDestination={showCrossDockDestination}
              onAddToOrder={onAddToOrder}
            />
          </SectionBox>
        )}
        
        {/* Manager Notification */}
        <div className="bg-amber-80 border border-amber-200 rounded-lg p-4 mb-4">
          <p className="text-amber-800 text-sm font-medium">
            One order at a time – this page is currently in progress.
          </p>
        </div>

        {/* Submit button */}
        <div className="flex gap-4">
          <button 
            type="submit" 
            className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2 rounded-md font-medium transition-colors"
          >
            Submit Order
          </button>
          <button 
            type="button" 
            onClick={onAddToOrder}
            className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-6 py-2 rounded-md font-medium transition-colors"
          >
            Add to Order Summary
          </button>
        </div>
      </form>
    </Form>

    <ConfirmSamePlantModal
      open={needSamePlantConfirm}
      source={form.watch("ordering_plant")}
      destination={form.watch("destination_plant")}
      onCancel={() => { 
        setNeedSamePlantConfirm(false); 
        setPendingSubmit(null); 
      }}
      onConfirm={() => { 
        setNeedSamePlantConfirm(false); 
        if (pendingSubmit) {
          // Create a fake event to pass to the original handler
          const fakeEvent = { preventDefault: () => {}, currentTarget: document.createElement('form') } as React.FormEvent<HTMLFormElement>;
          pendingSubmit(fakeEvent);
        }
        setPendingSubmit(null);
      }}
    />
    </>
  );
}

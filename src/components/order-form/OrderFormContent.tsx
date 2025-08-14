
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "./order-form-schema";
import { Form } from "@/components/ui/form";
import { ContactSection } from "./sections/ContactSection";
import { ProductSection } from "./sections/ProductSection";
import { ScheduleSection } from "./sections/ScheduleSection";
import { CrossDockSection } from "./sections/CrossDockSection";
import { MandatoryPlantSelector } from "@/components/ui/mandatory-plant-selector";
import { SHOW_CROSS_DOCK } from "@/config/featureFlags";
import { CrossPlantSection } from "@/components/orders/CrossPlantSection";
import OrderSummaryPreview from "@/components/orders/OrderSummaryPreview";
import ConfirmSamePlantModal from "@/components/common/ConfirmSamePlantModal";
import { hasFullStoreAccess } from "@/lib/roles";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";

interface OrderFormContentProps {
  form: UseFormReturn<OrderFormValues>;
  showCrossDockDestination: boolean;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function OrderFormContent({ 
  form, 
  showCrossDockDestination,
  onSubmit 
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
        <form onSubmit={handleFormSubmit} className="space-y-8">
        {/* Contact Information */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-6 border border-gray-100 dark:border-gray-800">
          <ContactSection form={form} />
        </div>
        
        {/* Mandatory Plant Selector */}
        <MandatoryPlantSelector
          value={form.watch("destinationPlant") || ""}
          onChange={(value) => form.setValue("destinationPlant", value)}
          error={form.formState.errors.destinationPlant?.message}
        />
        
        {/* Order Details */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-900/30">
          <ProductSection form={form} />
        </div>
        
        {/* Logistics */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-100 dark:border-green-900/30">
          <ScheduleSection form={form} />
        </div>
        
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
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-100 dark:border-purple-900/30">
            <CrossDockSection 
              form={form} 
              showCrossDockDestination={showCrossDockDestination} 
            />
          </div>
        )}
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

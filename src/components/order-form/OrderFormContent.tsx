
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "./order-form-schema";
import { Form } from "@/components/ui/form";
import { ContactSection } from "./sections/ContactSection";
import { ProductSection } from "./sections/ProductSection";
import { ScheduleSection } from "./sections/ScheduleSection";
import { RoutingTransferSection } from "@/components/common/forms/RoutingTransferSection";
import { UnifiedOrderSummary } from "@/components/common/forms/UnifiedOrderSummary";
import { useRoutingTransferData } from "./hooks/useRoutingTransferData";
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
  
  // Initialize unified routing data
  const { routingData, updateRoutingData } = useRoutingTransferData({
    form,
    initialData: {
      transfer_route: 'store->store',
      crossDock: form.watch("crossDock") || 'No',
      destination_plant: form.watch("destination_plant") || form.watch("destinationPlant"),
      destination_store: form.watch("store"),
      ordering_store: form.watch("ordering_store"),
      ordering_plant: form.watch("ordering_plant"),
      carrier: form.watch("carrier"),
      crossDockDestination: form.watch("crossDockDestination"),
      receiverNo: form.watch("receiverNo"),
      etaDate: form.watch("etaDate"),
      crossDockConfirmation: form.watch("crossDockConfirmation"),
    }
  });

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
        
        {/* Product Details */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 border border-blue-100 dark:border-blue-900/30">
          <ProductSection form={form} />
        </div>
        
        {/* Schedule & Notes */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 border border-green-100 dark:border-green-900/30">
          <ScheduleSection form={form} />
        </div>
        
        {/* 🎯 NEW: Unified Routing & Transfer Details Section */}
        <RoutingTransferSection
          form={form}
          value={routingData}
          onChange={updateRoutingData}
        />
        
        {/* Single Order Summary */}
        <UnifiedOrderSummary
          data={{
            source_store: routingData.source_store,
            source_plant: routingData.source_plant,
            transfer_route: routingData.transfer_route,
            carrier: routingData.carrier,
            destination_plant: routingData.destination_plant,
            destination_store: routingData.destination_store,
            crossDock: routingData.crossDock,
            crossDockDestination: routingData.crossDockDestination,
            receiverNo: routingData.receiverNo,
            etaDate: routingData.etaDate,
            crossDockConfirmation: routingData.crossDockConfirmation,
            productNumber: form.watch("productNumber"),
            description: form.watch("description"),
            quantity: form.watch("quantity"),
            scheduleArrival: routingData.scheduleArrival,
          }}
        />
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

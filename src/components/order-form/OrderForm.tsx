import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { OrderFormWrapper } from "./OrderFormWrapper";
import { OrderFormHeader } from "./OrderFormHeader";
import { OrderFormContent } from "./OrderFormContent";
import { OrderFormActions } from "./OrderFormActions";
import { useOrderFormSubmit } from "./hooks/useOrderFormSubmit";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formSchema } from "./order-form-schema";
import { OrderSummaryTable } from "./OrderSummaryTable";
import { OrderSubmissionHandler } from "./OrderSubmissionHandler";
import { toast } from "@/hooks/use-toast";
import { getCurrentDateTime } from "@/utils/dateTime";
import { SHOW_CROSS_DOCK } from "@/config/featureFlags";
import { logger } from '@/utils/logger';
import OrderIDService from "@/services/OrderIDService";
import { EmailRecipientsPreview } from "@/components/shared/EmailRecipientsPreview";
import { hasFullStoreAccess } from "@/lib/roles";
import { useOrderFormState } from "./state/OrderFormStateProvider";

export function OrderForm() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const elevated = hasFullStoreAccess(user);
  const { values: inMemoryValues, setValues: setInMemoryValues } = useOrderFormState();
  const { isSubmitting, handleSubmitOrders } = useOrderFormSubmit();

  // Controlled logging to prevent render spam
  useEffect(() => {
    console.info('[Ordering Acting-As]', {
      userEmail: user?.email,
      userRole: user?.role,
      elevated: elevated,
    });
  }, [user?.email, user?.role, elevated]);
  
  const [orderSummaries, setOrderSummaries] = useState<any[]>([]);
  const [recipientCount, setRecipientCount] = useState(0);

  const defaultValues = {
    yourName: "",
    store: user?.store || "",
    dateReceived: getCurrentDateTime(),
    productNumber: "",
    description: "",
    quantity: "",
    scheduleArrival: "",
    notes: "",
    crossDock: "No" as "Yes" | "No",
    crossDockDestination: "",
    receiverNo: "",
    etaDate: "",
    crossDockConfirmation: false,
    managersEmail: "",
    destinationPlant: "", // Empty by default - user must select
    // Cross-plant fields (defaults to null)
    ordering_store: "",
    ordering_plant: "",
    destination_plant: "",
    ...inMemoryValues // Use in-memory values as defaults
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Update in-memory state when form changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      setInMemoryValues(value as any);
    });
    return () => subscription.unsubscribe();
  }, [form, setInMemoryValues]);

  // Update store when user changes
  useEffect(() => {
    if (user?.store && !user?.isAdmin && !user?.hasFullStoreAccess) {
      const currentStore = form.getValues("store");
      const currentManagersEmail = form.getValues("managersEmail");
      if (!currentStore) form.setValue("store", user.store);
      if (!currentManagersEmail) form.setValue("managersEmail", "");
    }
  }, [user, form]);

  // Auto-initialize destination plant based on store
  useEffect(() => {
    const currentStore = form.watch("store");
    const currentPlant = form.watch("destinationPlant");
    
    // Only auto-set plant if not already set and we have a store
    if (currentStore && !currentPlant && selectedPlant) {
      console.log("🌱 AUTO-PLANT - Setting destination plant", {
        store: currentStore,
        selectedPlant,
        currentPlant
      });
      
      form.setValue("destinationPlant", selectedPlant);
      
      console.log("✅ AUTO-PLANT - Destination plant auto-set to:", selectedPlant);
    }
  }, [form.watch("store"), selectedPlant, form]);

  const { handleSubmit, formState, reset } = form;
  const showCrossDockDestination = SHOW_CROSS_DOCK && form.watch("crossDock") === "Yes";
  
  // Direct submission handler that calls the real submission pipeline
  const handleDirectSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log('[SUBMIT] form start', { values });
    
    // Validate plant selection
    if (!values.destinationPlant) {
      toast({
        title: "Validation Error",
        description: "Please select a destination plant before submitting.",
        variant: "destructive",
      });
      return;
    }

    logger.info("Order submitted to plant", {
      service: 'OrderForm',
      destinationPlant: values.destinationPlant
    });

    // Create the order to submit directly with all required fields
    const newOrder = {
      id: OrderIDService.generateOrderID('TRANSFER'),
      timestamp: new Date().toISOString(),
      store: values.store,
      selected: true,
      yourName: values.yourName || "Unknown",
      dateReceived: values.dateReceived || getCurrentDateTime(),
      productNumber: values.productNumber || "",
      description: values.description || "",
      quantity: values.quantity || "0",
      scheduleArrival: values.scheduleArrival || "",
      notes: values.notes || "",
      crossDock: values.crossDock || "No",
      crossDockDestination: values.crossDockDestination || "",
      receiverNo: values.receiverNo || "",
      etaDate: values.etaDate || "",
      crossDockConfirmation: values.crossDockConfirmation || false,
      managersEmail: values.managersEmail || "",
      destinationPlant: values.destinationPlant || "",
      ordering_store: values.ordering_store || "",
      ordering_plant: values.ordering_plant || "",
      destination_plant: values.destination_plant || ""
    };
    
    // Submit the order directly using the real submission pipeline
    await handleSubmitOrders([newOrder], () => {
      // Clear form after successful submission
      reset(defaultValues);
      setInMemoryValues({});
      
      toast({
        title: "Order Submitted Successfully",
        description: `Order submitted for ${values.destinationPlant}.`,
      });
    });
  };
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    // Validate plant selection
    if (!values.destinationPlant) {
      toast({
        title: "Validation Error",
        description: "Please select a destination plant before submitting.",
        variant: "destructive",
      });
      return;
    }

    logger.info("Order submitted to plant", {
      service: 'OrderForm',
      destinationPlant: values.destinationPlant
    });

    // Add current form values to the order summaries
    const newOrder = {
      ...values,
      id: OrderIDService.generateOrderID('TRANSFER'),
      timestamp: new Date().toISOString(),
      store: values.store,
      selected: true
    };
    
    setOrderSummaries(prev => [...prev, newOrder]);
    
    toast({
      title: "Item Added",
      description: `Item added to order for ${values.destinationPlant}. You can add more items or submit the order.`,
    });
    
    // Reset form after successful ADD
    if (user?.isAdmin) {
      reset(defaultValues);
    } else {
      const storeValue = form.getValues("store");
      const managerEmailValue = form.getValues("managersEmail");
      
      reset({
        ...defaultValues,
        store: storeValue,
        managersEmail: managerEmailValue
      });
    }
  };

  const handleToggleSelection = (orderId: string) => {
    setOrderSummaries(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, selected: !order.selected } : order
      )
    );
  };

  const handleAddToOrder = () => {
    form.handleSubmit(onSubmit)();
  };

  const handleLoadTemplate = async (templateData: any) => {
    Object.keys(templateData).forEach((key) => {
      if (key in defaultValues) {
        form.setValue(key as keyof typeof defaultValues, templateData[key]);
      }
    });
    
    if (user && user.store && !user?.isAdmin && !user?.hasFullStoreAccess) {
      form.setValue("store", user.store);
      form.setValue("managersEmail", "");
    }
    
    // Preserve auto-plant selection if template doesn't have destination plant
    if (!templateData.destinationPlant && selectedPlant) {
      console.log("🌱 TEMPLATE LOAD - Preserving auto-selected plant:", selectedPlant);
      form.setValue("destinationPlant", selectedPlant);
    }
    
    toast({
      title: "Template Loaded",
      description: "The template has been loaded successfully."
    });
  };

  const handleClearForm = () => {
    form.reset(defaultValues);
    setInMemoryValues({});
    setOrderSummaries([]);
  };

  const getCurrentFormData = () => {
    return form.getValues();
  };

  return (
    <OrderFormWrapper>
      <OrderFormHeader />
      
      <OrderFormContent 
        form={form} 
        showCrossDockDestination={showCrossDockDestination}
        onSubmit={handleSubmit(handleDirectSubmit)}
        onAddToOrder={handleAddToOrder}
        getCurrentFormData={getCurrentFormData}
        onLoadTemplate={handleLoadTemplate}
      />

      {/* Email Recipients Preview */}
      {form.watch("store") && (form.watch("destinationPlant") || selectedPlant) && (
        <div className="mt-6">
          <EmailRecipientsPreview
            store={form.watch("store")}
            plant={form.watch("destinationPlant") || selectedPlant}
            emailType="transfer"
            orderData={{
              manager_email: form.watch("managersEmail")
            }}
            className="w-full"
            onRecipientsChange={setRecipientCount}
          />
        </div>
      )}
      
      {orderSummaries.length > 0 && (
        <div className="mt-8">
          <OrderSummaryTable 
            orderSummaries={orderSummaries} 
            onToggleSelection={handleToggleSelection} 
          />
        </div>
      )}
      
        <OrderSubmissionHandler 
          orderSummaries={orderSummaries}
          setOrderSummaries={setOrderSummaries}
          destinationPlant={form.watch("destinationPlant") || ""}
          recipientCount={recipientCount}
        />
      
      {/* Only show regular actions if not in cross-dock mode */}
      {!(form.watch("crossDock") === "Yes") && (
        <OrderFormActions 
          isSubmitting={isSubmitting}
          selectedPlant={selectedPlant}
          onAddClick={handleAddToOrder}
        />
      )}
      
      {/* Bottom padding to account for sticky bars */}
      <div className="pb-24" />
    </OrderFormWrapper>
  );
}

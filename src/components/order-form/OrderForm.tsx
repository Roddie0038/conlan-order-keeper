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
import { OrderTemplate } from "../order-templates/OrderTemplate";
import { Card } from "@/components/ui/card";
import { useOrderFormPersistence } from "@/hooks/useOrderFormPersistence";
import { ClearFormButton } from "@/components/ui/clear-form-button";
import { FormRestorationBanner } from "@/components/ui/form-restoration-banner";

export function OrderForm() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummaries, setOrderSummaries] = useState<any[]>([]);

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
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Form persistence (only for non-admin users)
  const { lastSaved, isRestoring, clearPersistedData } = useOrderFormPersistence(form, {
    storageKey: 'ordering-platform-order-form',
    excludeFields: ['managersEmail', 'destinationPlant'], // Exclude auto-generated fields
    enabled: !user?.isAdmin,
    debounceMs: 2000,
  });

  // Update store when user changes
  useEffect(() => {
    if (user?.store && !user?.isAdmin) {
      form.setValue("store", user.store);
      form.setValue("managersEmail", "");
    }
  }, [user, form]);

  const { handleSubmit, formState, reset } = form;
  const showCrossDockDestination = SHOW_CROSS_DOCK && form.watch("crossDock") === "Yes";
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Validate plant selection
    if (!values.destinationPlant) {
      toast({
        title: "Validation Error",
        description: "Please select a destination plant before submitting.",
        variant: "destructive",
      });
      return;
    }

    console.log("✅ Order submitted to plant:", values.destinationPlant);

    // Add current form values to the order summaries
    const newOrder = {
      ...values,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      store: values.store,
      selected: true
    };
    
    setOrderSummaries(prev => [...prev, newOrder]);
    
    toast({
      title: "Item Added",
      description: `Item added to order for ${values.destinationPlant}. You can add more items or submit the order.`,
    });
    
    // Reset form for next item, but preserve store and manager email for non-admin users
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

  const handleLoadTemplate = (templateData: any) => {
    Object.keys(templateData).forEach((key) => {
      if (key in defaultValues) {
        form.setValue(key as keyof typeof defaultValues, templateData[key]);
      }
    });
    
    if (user && user.store && !user?.isAdmin) {
      form.setValue("store", user.store);
      form.setValue("managersEmail", "");
    }
    
    toast({
      title: "Template Loaded",
      description: "The template has been loaded successfully."
    });
  };

  const handleClearForm = () => {
    form.reset(defaultValues);
    clearPersistedData();
    setOrderSummaries([]);
  };

  const getCurrentFormData = () => {
    return form.getValues();
  };

  return (
    <OrderFormWrapper>
      <OrderFormHeader />
      
      {!user?.isAdmin && (
        <div className="mb-4">
          <FormRestorationBanner isRestoring={isRestoring} lastSaved={lastSaved} />
        </div>
      )}
      
      <Card className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 flex items-center">
          <h2 className="text-2xl font-semibold text-white">Order Templates</h2>
        </div>
        
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <OrderTemplate 
                type="regular" 
                currentData={getCurrentFormData()} 
                onLoadTemplate={handleLoadTemplate} 
              />
            </div>
            {!user?.isAdmin && (
              <div className="ml-4">
                <ClearFormButton 
                  onClear={handleClearForm}
                  lastSaved={lastSaved}
                  disabled={isRestoring}
                />
              </div>
            )}
          </div>
        </div>
      </Card>
      
      <OrderFormContent 
        form={form} 
        showCrossDockDestination={showCrossDockDestination}
        onSubmit={handleSubmit(onSubmit)}
      />
      
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
        />
      
      <OrderFormActions 
        isSubmitting={isSubmitting}
        selectedPlant={selectedPlant}
        onAddClick={handleAddToOrder}
      />
    </OrderFormWrapper>
  );
}

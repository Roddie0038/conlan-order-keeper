import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { usePlant } from "@/contexts/PlantContext";
import { OrderFormWrapper } from "../order-form/OrderFormWrapper";
import { OrderFormContent } from "../order-form/OrderFormContent";
import { OrderFormActions } from "../order-form/OrderFormActions";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { formSchema } from "../order-form/order-form-schema";
import { OrderSummaryTable } from "../order-form/OrderSummaryTable";
import { TransferSubmissionHandler } from "./TransferSubmissionHandler";
import { toast } from "@/hooks/use-toast";
import { getCurrentDateTime } from "@/utils/dateTime";
import { SHOW_CROSS_DOCK } from "@/config/featureFlags";
import { OrderTemplate } from "../order-templates/OrderTemplate";
import { Card } from "@/components/ui/card";
import { useOrderFormPersistence } from "@/hooks/useOrderFormPersistence";
import { ClearFormButton } from "@/components/ui/clear-form-button";
import { FormRestorationBanner } from "@/components/ui/form-restoration-banner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

export interface TransferOrderSummary {
  id: string;
  selected: boolean;
  store: string;
  yourName?: string;
  name?: string;
  timestamp?: string;
  productNumber?: string;
  description?: string;
  quantity?: string | number;
  scheduleArrival?: string;
  notes?: string;
  crossDock?: "Yes" | "No";
  crossDockDestination?: string;
  receiverNo?: string;
  etaDate?: string;
  dateReceived?: string;
  [key: string]: any;
}

export function TransferRequestForm() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummaries, setOrderSummaries] = useState<TransferOrderSummary[]>([]);

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
    managersEmail: "", // Email routing handled dynamically
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Form persistence (only for non-admin users)
  const { lastSaved, isRestoring, clearPersistedData } = useOrderFormPersistence(form, {
    storageKey: 'transfer-request-form',
    excludeFields: ['managersEmail'],
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
    // Add current form values to the order summaries
    const newOrder: TransferOrderSummary = {
      ...values,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      store: values.store,
      selected: true
    };
    
    setOrderSummaries(prev => [...prev, newOrder]);
    
    // Show toast notification
    toast({
      title: "Item Added",
      description: "The item has been added to your transfer request. You can add more items or submit the request.",
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

  // Handler to toggle selection for individual orders
  const handleToggleSelection = (orderId: string) => {
    setOrderSummaries(prev => 
      prev.map(order => 
        order.id === orderId ? { ...order, selected: !order.selected } : order
      )
    );
  };

  // This function will be called when the "Add To Order" button is clicked
  const handleAddToOrder = () => {
    form.handleSubmit(onSubmit)();
  };

  const handleLoadTemplate = (templateData: any) => {
    // When loading a template, set form values
    Object.keys(templateData).forEach((key) => {
      if (key in defaultValues) {
        form.setValue(key as keyof typeof defaultValues, templateData[key]);
      }
    });
    
    // Ensure store is still set for non-admin users
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
    // Clear form and persistence
    form.reset(defaultValues);
    clearPersistedData();
    setOrderSummaries([]);
  };

  // Get current form data for template saving
  const getCurrentFormData = () => {
    return form.getValues();
  };

  return (
    <OrderFormWrapper>
      <div className="mb-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Transfer Request:</strong> Simple store → plant transfers only. 
            Orders will be sent to the selected plant: <strong>{selectedPlant}</strong>
          </AlertDescription>
        </Alert>
      </div>
      
      {/* Form persistence feedback - only show for non-admin users */}
      {!user?.isAdmin && (
        <div className="mb-4">
          <FormRestorationBanner isRestoring={isRestoring} lastSaved={lastSaved} />
        </div>
      )}
      
      {/* Order Templates Section */}
      <Card className="bg-white shadow-lg rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-green-600 to-green-800 p-6 flex items-center">
          <h2 className="text-2xl font-semibold text-white">Transfer Request Templates</h2>
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
      
      {/* Order summaries table */}
      {orderSummaries.length > 0 && (
        <div className="mt-8">
          <OrderSummaryTable 
            orderSummaries={orderSummaries as any} 
            onToggleSelection={handleToggleSelection} 
          />
        </div>
      )}
      
      {/* Submit selected orders */}
      <TransferSubmissionHandler 
        orderSummaries={orderSummaries}
        setOrderSummaries={setOrderSummaries}
      />
      
      <OrderFormActions 
        isSubmitting={isSubmitting}
        selectedPlant={selectedPlant}
        onAddClick={handleAddToOrder}
      />
    </OrderFormWrapper>
  );
}
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
import { OrderTemplate } from "../order-templates/OrderTemplate";
import { Card } from "@/components/ui/card";
import { useFormAutosave } from "@/hooks/useFormAutosave";
import { ClearFormButton } from "@/components/ui/clear-form-button";
import { FormRestorationBanner } from "@/components/ui/form-restoration-banner";
import { DraftTopBar } from "@/components/common/forms/DraftTopBar";
import { formatStoreForDraft, formatPlantForDraft, formatStore, formatPlant } from "@/utils/formatters";
import { useRouteFlush } from "@/hooks/useRouteFlush";
import OrderIDService from "@/services/OrderIDService";
import { EmailRecipientsPreview } from "@/components/shared/EmailRecipientsPreview";
import { hasFullStoreAccess } from "@/lib/roles";
import StoreSelector from "@/components/common/StoreSelector";
import { ActingAsStoreBadge } from "@/components/common/ActingAsStoreBadge";
import { normalizeStoreName } from "@/lib/stores";

export function OrderForm() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const elevated = hasFullStoreAccess(user);

  // Controlled logging to prevent render spam
  useEffect(() => {
    console.info('[Ordering Acting-As]', {
      userEmail: user?.email,
      userRole: user?.role,
      elevated: elevated,
    });
  }, [user?.email, user?.role, elevated]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Form persistence (only for non-admin users) - Enhanced with server-side drafts
  // Generate canonical store/plant strings for stable draft keys
  const currentStore = form.watch("store") || user?.store;
  const storeString = (() => {
    if (currentStore && 
        typeof currentStore === 'object' && 
        currentStore !== null) {
      const storeObj = currentStore as any;
      if ('number' in storeObj && 'city' in storeObj && storeObj.number && storeObj.city) {
        return formatStore(storeObj.number, storeObj.city);
      }
    }
    return formatStoreForDraft(currentStore || 'Unknown Store');
  })();
    
  const plantString = (() => {
    if (selectedPlant && 
        typeof selectedPlant === 'object' && 
        selectedPlant !== null) {
      const plantObj = selectedPlant as any;
      if ('number' in plantObj && 'city' in plantObj && plantObj.number && plantObj.city) {
        return formatPlant(plantObj.number, plantObj.city);
      }
    }
    return formatPlantForDraft(selectedPlant || 'Unknown Plant');
  })();

  const { 
    lastSaved, 
    isRestoring, 
    clearPersistedData,
    ready, 
    didRestore,
    saveStatus,
    discardDraft,
    saveNow,
    isSubmittingRef,
    markSubmitting,
    clearSubmitting,
    suspendAutosave,
    resumeAutosave,
    flushAutosave
  } = useFormAutosave(form, 'order', {
    enabled: !user?.isAdmin,
    excludeFields: ['managersEmail'], // Only exclude auto-generated fields
    store: storeString,
    plant: plantString,
    onRestore: () => {
      console.log('🔄 Order form data restored');
    }
  });

  // Wrapper to suspend autosave during critical operations
  function withAutosaveFlush<T extends (...args:any[]) => Promise<any>>(fn: T): T {
    // Wrap actions that must not fight autosave (submit/template)
    return (async (...args: any[]) => {
      suspendAutosave();
      // Flush any pending debounced write; don't hang forever.
      const timeout = new Promise<void>((resolve) => setTimeout(resolve, 1500));
      await Promise.race([Promise.resolve(flushAutosave()), timeout]).catch(() => {/* ignore */});
      try {
        return await fn(...args);
      } finally {
        resumeAutosave();
      }
    }) as T;
  }

  // Flush draft saves on route changes and page unload
  useRouteFlush({ saveNow, isSubmittingRef });

  // Update store when user changes — WITH SUBMIT GUARD
  useEffect(() => {
    console.log('[AutoSave][OrderForm] defaults effect run', { ready, didRestore, submitting: isSubmittingRef.current });
    if (!ready) return;
    if (didRestore) {
      console.log('[AutoSave] Skipping defaults – restored data present.');
      return;
    }
    // CRITICAL: Never reset during submit
    if (isSubmittingRef.current) {
      console.log('[AutoSave] BLOCKED defaults during submit');
      return;
    }
    if (user?.store && !user?.isAdmin && !user?.hasFullStoreAccess) {
      const currentStore = form.getValues("store");
      const currentManagersEmail = form.getValues("managersEmail");
      if (!currentStore) form.setValue("store", user.store);
      if (!currentManagersEmail) form.setValue("managersEmail", "");
    }
  }, [user, form, ready, didRestore, isSubmittingRef]);

  // Auto-initialize destination plant based on store — WITH SUBMIT GUARD
  useEffect(() => {
    if (!ready) return;
    if (didRestore) {
      console.log('[AutoSave][OrderForm] Skipping auto-plant defaults – restored data present.');
      return;
    }
    // CRITICAL: Never reset during submit
    if (isSubmittingRef.current) {
      console.log('[AutoSave] BLOCKED auto-plant during submit');
      return;
    }
    console.log('[AutoSave][OrderForm] auto-plant defaults effect', { ready, didRestore });
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
  }, [form.watch("store"), selectedPlant, form, ready, didRestore, isSubmittingRef]);

  const { handleSubmit, formState, reset } = form;
  const showCrossDockDestination = SHOW_CROSS_DOCK && form.watch("crossDock") === "Yes";
  
  const onSubmit = withAutosaveFlush(async (values: z.infer<typeof formSchema>) => {
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
    
    // ONLY reset form after successful ADD (not during submit)
    if (!isSubmittingRef.current) {
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
    }
  });

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

  const handleLoadTemplate = withAutosaveFlush(async (templateData: any) => {
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
  });

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
        <div className="mb-4 space-y-2">
          <DraftTopBar
            saveStatus={saveStatus}
            lastSaved={lastSaved}
            onSaveNow={saveNow}
            onDiscard={discardDraft}
          />
          <FormRestorationBanner isRestoring={isRestoring} lastSaved={lastSaved} />
        </div>
      )}
      
      {/* REMOVED: International/Regional UI moved to dedicated page */}
      
      <OrderFormContent 
        form={form} 
        showCrossDockDestination={showCrossDockDestination}
        onSubmit={handleSubmit(onSubmit)}
        getCurrentFormData={getCurrentFormData}
        onLoadTemplate={handleLoadTemplate}
        onAddToOrder={handleAddToOrder}
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
          markSubmitting={markSubmitting}
          clearSubmitting={clearSubmitting}
          formHandleSubmit={form.handleSubmit}
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

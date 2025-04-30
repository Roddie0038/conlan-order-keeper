
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
import { getManagerEmail } from "./formConfig";
import { getCurrentDateTime } from "@/utils/dateTime";

export function OrderForm() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSummaries, setOrderSummaries] = useState<any[]>([]);

  // Get manager email for the user's store
  const managerEmail = user?.store ? getManagerEmail(user.store) : "";

  const defaultValues = {
    yourName: "",
    store: user?.store || "",
    dateReceived: getCurrentDateTime(), // Use string format instead of Date
    productNumber: "",
    description: "",
    quantity: "",
    scheduleArrival: "",
    notes: "",
    crossDock: "",
    crossDockDestination: "",
    managersEmail: managerEmail,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  // Update store and manager email when user changes
  useEffect(() => {
    if (user?.store && !user?.isAdmin) {
      form.setValue("store", user.store);
      const managerEmail = getManagerEmail(user.store);
      form.setValue("managersEmail", managerEmail || "");
    }
  }, [user, form]);

  const { handleSubmit, formState, reset } = form;
  const showCrossDockDestination = form.watch("crossDock") === "yes";
  
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    // Add current form values to the order summaries
    const newOrder = {
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
      description: "The item has been added to your order. You can add more items or submit the order.",
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

  return (
    <OrderFormWrapper>
      <OrderFormHeader />
      
      <OrderFormContent 
        form={form} 
        showCrossDockDestination={showCrossDockDestination}
        onSubmit={handleSubmit(onSubmit)}
      />
      
      {/* Order summaries table */}
      {orderSummaries.length > 0 && (
        <div className="mt-8">
          <OrderSummaryTable 
            orderSummaries={orderSummaries} 
            onToggleSelection={handleToggleSelection} 
          />
        </div>
      )}
      
      {/* Submit selected orders */}
      <OrderSubmissionHandler 
        orderSummaries={orderSummaries}
        setOrderSummaries={setOrderSummaries}
      />
      
      <OrderFormActions 
        isSubmitting={isSubmitting}
        selectedPlant={selectedPlant}
        onAddClick={handleAddToOrder} // Connect button click to form submission
      />
    </OrderFormWrapper>
  );
}

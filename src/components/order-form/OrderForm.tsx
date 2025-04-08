
import { useState } from "react";
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

export function OrderForm() {
  const { user } = useAuth();
  const { selectedPlant } = usePlant();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const defaultValues = {
    yourName: "",
    store: user?.store || "",
    dateReceived: new Date(),
    productNumber: "",
    description: "",
    quantity: "",
    scheduleArrival: "",
    notes: "",
    crossDock: "",
    crossDockDestination: "",
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { handleSubmit, formState } = form;
  const showCrossDockDestination = form.watch("crossDock") === "yes";
  
  const onSubmit = useOrderFormSubmit({
    setIsSubmitting,
    selectedPlant,
    resetForm: () => form.reset(defaultValues),
  });

  return (
    <OrderFormWrapper>
      <OrderFormHeader />
      
      <OrderFormContent 
        form={form} 
        showCrossDockDestination={showCrossDockDestination}
        onSubmit={handleSubmit(onSubmit)}
      />
      
      <OrderFormActions 
        isSubmitting={isSubmitting}
        selectedPlant={selectedPlant}
      />
    </OrderFormWrapper>
  );
}

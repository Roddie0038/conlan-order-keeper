
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../order-form-schema";
import { Card } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { useState, useEffect } from "react";
import { getManagerEmail } from "@/components/order-form/formConfig";
import { StoreFields } from "./components/StoreFields";
import { OrderInfoFields } from "./components/OrderInfoFields";
import { ConfirmationCheckbox } from "./components/ConfirmationCheckbox";
import { PrintFormButton } from "./components/PrintFormButton";

interface CrossDockDetailsFormProps {
  form: UseFormReturn<OrderFormValues>;
}

export function CrossDockDetailsForm({ form }: CrossDockDetailsFormProps) {
  const [destManagerEmail, setDestManagerEmail] = useState<string>("");
  
  // Update manager email when destination store changes
  useEffect(() => {
    const destStore = form.watch("crossDockDestination");
    if (destStore) {
      const email = getManagerEmail(destStore);
      setDestManagerEmail(email || "");
    }
  }, [form.watch("crossDockDestination")]);

  const handleDestinationChange = (value: string) => {
    const email = getManagerEmail(value);
    setDestManagerEmail(email || "");
  };
  
  return (
    <Card className="mt-4 p-4 border border-purple-200 bg-purple-50 dark:bg-purple-900/20">
      <div className="mb-4 border-b border-purple-200 pb-2">
        <div className="flex justify-center items-center">
          <h4 className="text-md font-medium text-purple-700 dark:text-purple-300 flex items-center">
            <Truck className="h-4 w-4 mr-2" />
            Cross Dock Form Details
          </h4>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StoreFields 
          form={form} 
          onDestinationChange={handleDestinationChange} 
        />

        <OrderInfoFields 
          form={form} 
          destManagerEmail={destManagerEmail} 
        />
      </div>

      <div className="mt-4">
        <ConfirmationCheckbox form={form} />
      </div>

      {/* Print button moved to the bottom */}
      <div className="mt-6 flex justify-center">
        <PrintFormButton form={form} />
      </div>
    </Card>
  );
}

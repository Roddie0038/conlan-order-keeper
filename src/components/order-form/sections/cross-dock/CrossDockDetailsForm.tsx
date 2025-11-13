
import { UseFormReturn } from "react-hook-form";
import { OrderFormValues } from "../../order-form-schema";
import { Card } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { useState, useEffect } from "react";
// REMOVED: Email routing now handled by OT Platform
import { StoreFields } from "./components/StoreFields";
import { OrderInfoFields } from "./components/OrderInfoFields";
import { ConfirmationCheckbox } from "./components/ConfirmationCheckbox";
import { PrintFormButton } from "./components/PrintFormButton";
import { useAuth } from "@/contexts/AuthContext";

interface CrossDockDetailsFormProps {
  form: UseFormReturn<OrderFormValues>;
}

export function CrossDockDetailsForm({ form }: CrossDockDetailsFormProps) {
  const [destManagerEmail, setDestManagerEmail] = useState<string>("");
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  
  // REMOVED: Email loading - OT Platform handles email routing
  useEffect(() => {
    const destStore = form.watch("crossDockDestination");
    if (destStore) {
      // Email routing removed - handled by OT Platform
    }
  }, [form.watch("crossDockDestination")]);

  const handleDestinationChange = async (value: string) => {
    // Email routing removed - handled by OT Platform
    setDestManagerEmail("");
  };

  // Auto-validate that FROM and TO stores are different
  useEffect(() => {
    const fromStore = form.watch("store");
    const toStore = form.watch("crossDockDestination");
    
    if (fromStore && toStore && fromStore === toStore) {
      form.setError("crossDockDestination", {
        type: "manual",
        message: "Destination store cannot be the same as origin store"
      });
    } else {
      form.clearErrors("crossDockDestination");
    }
  }, [form.watch("store"), form.watch("crossDockDestination"), form]);
  
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
          isAdmin={isAdmin}
        />

        <OrderInfoFields 
          form={form} 
          destManagerEmail={destManagerEmail}
          isAdmin={isAdmin} 
        />
      </div>

      <div className="mt-4">
        <ConfirmationCheckbox form={form} />
      </div>

      {/* Print button moved to the bottom */}
      <div className="mt-6 flex justify-center">
        <PrintFormButton form={form} isAdmin={isAdmin} />
      </div>
    </Card>
  );
}
